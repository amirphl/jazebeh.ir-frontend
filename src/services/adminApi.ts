import { ApiResponse } from './api';
import { getApiUrl } from '../config/environment';
import {
  AdminCaptchaInitResponse,
  AdminCaptchaVerifyRequest,
  AdminLoginInitResponse,
  AdminLoginResponse,
  AdminLoginVerifyOTPRequest,
  AdminLoginVerifyOTPResponse,
  AdminCreateLineNumberRequest,
  AdminLineNumberDTO,
  AdminUpdateLineNumbersRequest,
  AdminLineNumberReportItem,
  AdminListCampaignsFilter,
  AdminListCampaignsResponse,
  AdminApproveCampaignResponse,
  AdminCancelCampaignRequest,
  AdminCancelCampaignResponse,
  AdminRescheduleCampaignRequest,
  AdminRescheduleCampaignResponse,
  AdminRejectCampaignResponse,
  AdminListPlatformSettingsResponse,
  AdminChangePlatformSettingsStatusRequest,
  AdminChangePlatformSettingsStatusResponse,
  AdminAddPlatformSettingsMetadataRequest,
  AdminAddPlatformSettingsMetadataResponse,
  AdminListPlatformBasePricesResponse,
  AdminUpdatePlatformBasePriceRequest,
  AdminUpdatePlatformBasePriceResponse,
  AdminGetPagePricesResponse,
  AdminUpdatePagePriceRequest,
  AdminUpdatePagePriceResponse,
  AdminChargeWalletRequest,
  AdminChargeWalletResponse,
  AdminPreviewWalletChargeImpactRequest,
  AdminPreviewWalletChargeImpactResponse,
  AdminListCustomersResponse,
  AdminCreateShortLinksResponse,
  AdminShortLinkUploadJobDTO,
} from '../types/admin';

// Separate storage keys to avoid clash with normal user tokens
const ADMIN_ACCESS_TOKEN_KEY = 'admin_access_token';
const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';

// Global modal/redirect guard
let adminSessionModalShown = false;

class AdminApiService {
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  }

  setRefreshToken(token: string | null) {
    if (token) localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  }

  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
  }

  private getAdminAuthHeaders(contentType: 'json' | 'none' = 'json') {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (contentType === 'json') {
      headers['Content-Type'] = 'application/json';
    }

    const accessToken = this.getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
  }

  private async parseJsonResponse(resp: Response): Promise<any> {
    const contentType = resp.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }

    try {
      return await resp.json();
    } catch {
      return null;
    }
  }

  private createTimeoutSignal(
    timeoutMs: number,
    signal?: AbortSignal | null
  ): AbortSignal {
    if (!signal) {
      return AbortSignal.timeout(timeoutMs);
    }

    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(
      () => controller.abort(),
      timeoutMs
    );
    const clearTimer = () => globalThis.clearTimeout(timeoutId);

    if (signal.aborted) {
      clearTimer();
      controller.abort(signal.reason);
      return controller.signal;
    }

    signal.addEventListener(
      'abort',
      () => {
        clearTimer();
        controller.abort(signal.reason);
      },
      { once: true }
    );

    controller.signal.addEventListener('abort', clearTimer, { once: true });

    return controller.signal;
  }

  private createErrorResponse<T>(
    code: string,
    message = code,
    details: unknown = null
  ): ApiResponse<T> {
    return {
      success: false,
      message,
      error: {
        code,
        details,
      },
    };
  }

  private getStatusErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'INVALID_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT_ERROR';
      case 423:
        return 'RESOURCE_LOCKED';
      case 429:
        return 'RATE_LIMIT_EXCEEDED';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  private normalizeErrorPayload(
    payload: {
      message?: unknown;
      error?: { code?: unknown; details?: unknown };
    } | null,
    status: number,
    fallbackCode: string
  ) {
    const backendCode = payload?.error?.code;
    if (typeof backendCode === 'string' && backendCode.trim()) {
      return {
        code: backendCode.trim(),
        message:
          typeof payload?.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : backendCode.trim(),
        details: payload?.error?.details ?? null,
      };
    }

    if (typeof payload?.message === 'string' && payload.message.trim()) {
      const message = payload.message.trim();
      return {
        code: message,
        message,
        details: payload?.error?.details ?? null,
      };
    }

    return {
      code: fallbackCode || this.getStatusErrorCode(status),
      message: fallbackCode || this.getStatusErrorCode(status),
      details: payload?.error?.details ?? null,
    };
  }

  private async requestJson<T>(
    endpoint: string,
    options: RequestInit = {},
    config: { timeoutMs?: number; allowNoContent?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);

    try {
      const response = await fetch(url, {
        ...options,
        signal: this.createTimeoutSignal(
          config.timeoutMs ?? 20000,
          options.signal
        ),
      });

      if (response.status === 401) {
        this.handleUnauthorized();
        return this.createErrorResponse('UNAUTHORIZED');
      }

      if (response.status === 204 && config.allowNoContent) {
        return {
          success: true,
          message: 'OK',
          data: [] as T,
        };
      }

      const data = await this.parseJsonResponse(response);

      if (!response.ok) {
        const normalized = this.normalizeErrorPayload(
          data,
          response.status,
          this.getStatusErrorCode(response.status)
        );
        return this.createErrorResponse(
          normalized.code,
          normalized.message,
          normalized.details
        );
      }

      if (data === null) {
        if (config.allowNoContent) {
          return {
            success: true,
            message: 'OK',
            data: [] as T,
          };
        }

        return this.createErrorResponse('INVALID_RESPONSE');
      }

      return {
        success: true,
        message: data?.message || 'OK',
        data: data?.data as T,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return this.createErrorResponse('TIMEOUT_ERROR');
      }

      if (error instanceof TypeError) {
        return this.createErrorResponse('NETWORK_ERROR');
      }

      return this.createErrorResponse(
        'UNKNOWN_ERROR',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  private withFallbackData<T>(
    response: ApiResponse<T>,
    fallbackData: T
  ): ApiResponse<T> {
    if (!response.success) {
      return response;
    }

    return {
      ...response,
      data: response.data ?? fallbackData,
    };
  }

  private normalizeCaptchaInitResponse(
    payload: any
  ): AdminCaptchaInitResponse | undefined {
    const candidate = payload?.data ?? payload;
    if (
      !candidate?.challenge_id ||
      !candidate?.master_image_base64 ||
      !candidate?.thumb_image_base64
    ) {
      return undefined;
    }

    return candidate as AdminCaptchaInitResponse;
  }

  private normalizeAdminLoginResponse(
    payload: any
  ): AdminLoginResponse | undefined {
    const candidate = payload?.data ?? payload;

    if (
      candidate?.access_token &&
      candidate?.refresh_token &&
      candidate?.token_type &&
      candidate?.admin
    ) {
      return candidate as AdminLoginVerifyOTPResponse;
    }

    if (
      candidate?.challenge_id &&
      candidate?.masked_phone &&
      typeof candidate?.requires_two_factor === 'boolean'
    ) {
      return candidate as AdminLoginInitResponse;
    }

    return undefined;
  }

  private handleUnauthorized() {
    // Clear tokens
    this.setAccessToken(null);
    this.setRefreshToken(null);

    if (adminSessionModalShown) return;
    adminSessionModalShown = true;

    try {
      window.dispatchEvent(new CustomEvent('admin-session-expired'));
    } catch {}

    // Show a blocking alert as a fallback if modal listener not mounted
    const currentLang = document.documentElement.lang || 'en';
    const isFa = currentLang === 'fa';
    const msg = isFa
      ? 'نشست مدیریتی شما منقضی شده است. برای ادامه باید دوباره وارد شوید.'
      : 'Your admin session has expired. Please sign in again to continue.';
    setTimeout(() => {
      try {
        // In case no UI listener, use alert as fallback to inform the user
        if (!document.getElementById('admin-session-modal-mounted')) {
          alert(msg);
        }
      } catch {}
      // Redirect to Sardis (admin login hub)
      window.location.replace('/satrap');
    }, 1500);
  }

  async initCaptcha(): Promise<ApiResponse<AdminCaptchaInitResponse>> {
    const response = await this.requestJson<AdminCaptchaInitResponse>(
      '/admin/auth/captcha/init',
      {
        method: 'GET',
        headers: this.getAdminAuthHeaders('none'),
      },
      { timeoutMs: 15000 }
    );

    if (!response.success) {
      return response;
    }

    const responseData = this.normalizeCaptchaInitResponse(response.data);
    if (!responseData) {
      return this.createErrorResponse('INVALID_RESPONSE');
    }

    return {
      ...response,
      data: responseData,
    };
  }

  async verifyLogin(
    payload: AdminCaptchaVerifyRequest
  ): Promise<ApiResponse<AdminLoginResponse>> {
    const response = await this.requestJson<AdminLoginResponse>(
      '/admin/auth/login',
      {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (!response.success || !response.data) {
      return response;
    }

    const responseData = this.normalizeAdminLoginResponse(response.data);
    if (!responseData) {
      return this.createErrorResponse('INVALID_RESPONSE');
    }

    if ('access_token' in responseData && 'refresh_token' in responseData) {
      this.setAccessToken(responseData.access_token);
      this.setRefreshToken(responseData.refresh_token);
    }

    return {
      ...response,
      data: responseData,
    };
  }

  async verifyLoginOtp(
    payload: AdminLoginVerifyOTPRequest
  ): Promise<ApiResponse<AdminLoginVerifyOTPResponse>> {
    const response = await this.requestJson<AdminLoginVerifyOTPResponse>(
      '/admin/auth/login/verify-otp',
      {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (!response.success || !response.data) {
      return response;
    }

    const responseData = this.normalizeAdminLoginResponse(response.data);
    if (
      !responseData ||
      !('access_token' in responseData) ||
      !('refresh_token' in responseData)
    ) {
      return this.createErrorResponse('INVALID_RESPONSE');
    }

    this.setAccessToken(responseData.access_token);
    this.setRefreshToken(responseData.refresh_token);

    return {
      ...response,
      data: responseData,
    };
  }

  async listLineNumbers(): Promise<ApiResponse<AdminLineNumberDTO[]>> {
    return this.requestJson<AdminLineNumberDTO[]>(
      '/admin/line-numbers',
      {
        method: 'GET',
        headers: this.getAdminAuthHeaders('none'),
      },
      { allowNoContent: true }
    );
  }

  async createLineNumber(
    payload: AdminCreateLineNumberRequest
  ): Promise<ApiResponse<AdminLineNumberDTO>> {
    return this.requestJson<AdminLineNumberDTO>('/admin/line-numbers/', {
      method: 'POST',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async updateLineNumbersBatch(
    payload: AdminUpdateLineNumbersRequest
  ): Promise<ApiResponse<{ updated: boolean }>> {
    return this.requestJson<{ updated: boolean }>('/admin/line-numbers/', {
      method: 'PUT',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async getLineNumbersReport(): Promise<
    ApiResponse<AdminLineNumberReportItem[]>
  > {
    return this.requestJson<AdminLineNumberReportItem[]>(
      '/admin/line-numbers/report',
      {
        method: 'GET',
        headers: this.getAdminAuthHeaders('none'),
      },
      { allowNoContent: true }
    );
  }

  async listCampaigns(
    filter: AdminListCampaignsFilter = {}
  ): Promise<ApiResponse<AdminListCampaignsResponse>> {
    const qs = new URLSearchParams();
    if (filter.title) qs.set('title', filter.title);
    if (filter.status) qs.set('status', filter.status);
    if (filter.start_date) qs.set('start_date', filter.start_date);
    if (filter.end_date) qs.set('end_date', filter.end_date);
    if (filter.page) qs.set('page', String(filter.page));
    if (filter.limit) qs.set('limit', String(filter.limit));
    const response = await this.requestJson<AdminListCampaignsResponse>(
      `/admin/campaigns${qs.toString() ? `?${qs.toString()}` : ''}`,
      {
        method: 'GET',
        headers: this.getAdminAuthHeaders('none'),
      }
    );

    if (!response.success) {
      return response;
    }

    return {
      ...response,
      data: response.data ?? {
        message: response.message,
        items: [],
      },
    };
  }

  async approveCampaign(
    campaignId: number,
    comment?: string | null
  ): Promise<ApiResponse<AdminApproveCampaignResponse>> {
    return this.requestJson<AdminApproveCampaignResponse>(
      '/admin/campaigns/approve',
      {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify({
          campaign_id: campaignId,
          comment: comment ?? undefined,
        }),
      }
    );
  }

  async rejectCampaign(
    campaignId: number,
    comment: string
  ): Promise<ApiResponse<AdminRejectCampaignResponse>> {
    return this.requestJson<AdminRejectCampaignResponse>(
      '/admin/campaigns/reject',
      {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify({ campaign_id: campaignId, comment }),
      }
    );
  }

  async cancelCampaign(
    payload: AdminCancelCampaignRequest
  ): Promise<ApiResponse<AdminCancelCampaignResponse>> {
    return this.requestJson<AdminCancelCampaignResponse>(
      '/admin/campaigns/cancel',
      {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  }

  async rescheduleCampaign(
    payload: AdminRescheduleCampaignRequest
  ): Promise<ApiResponse<AdminRescheduleCampaignResponse>> {
    return this.requestJson<AdminRescheduleCampaignResponse>(
      '/admin/campaigns/reschedule',
      {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  }

  async listDepositReceipts(params: {
    status?: string;
    lang?: string;
    customer_name?: string;
    limit?: number;
    offset?: number;
    order?: string;
  }): Promise<ApiResponse<any>> {
    const search = new URLSearchParams();
    if (params.status) search.set('status', params.status);
    if (params.lang) search.set('lang', params.lang);
    if (params.customer_name) search.set('customer_name', params.customer_name);
    if (params.limit) search.set('limit', String(params.limit));
    if (params.offset) search.set('offset', String(params.offset));
    if (params.order) search.set('order', params.order);
    return this.requestJson<any>(
      `/admin/payments/deposit-receipts${search.toString() ? `?${search.toString()}` : ''}`,
      {
        method: 'GET',
        headers: this.getAdminAuthHeaders('none'),
      }
    );
  }

  async downloadDepositReceiptFile(uuid: string): Promise<{
    success: boolean;
    message: string;
    blob?: Blob;
    filename?: string;
  }> {
    const url = getApiUrl(
      `/admin/payments/deposit-receipts/${encodeURIComponent(uuid)}/file`
    );
    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: '*/*',
          ...(this.getAccessToken()
            ? { Authorization: `Bearer ${this.getAccessToken()}` }
            : {}),
        },
        signal: AbortSignal.timeout(20000),
      });
      if (resp.status === 401) {
        this.handleUnauthorized();
        return { success: false, message: 'Unauthorized' };
      }
      if (!resp.ok) {
        let msg = `HTTP ${resp.status}`;
        try {
          const data = await resp.json();
          msg = data?.message || msg;
        } catch {}
        return { success: false, message: msg };
      }
      const blob = await resp.blob();
      const disposition = resp.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const filename = match ? match[1] : `receipt-${uuid}`;
      return { success: true, message: 'OK', blob, filename };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }

  async updateDepositReceiptStatus(payload: {
    receipt_uuid: string;
    action: string;
    reason?: string;
  }): Promise<ApiResponse<any>> {
    return this.requestJson<any>('/admin/payments/deposit-receipts/status', {
      method: 'POST',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async listTransactions(params: {
    page?: number;
    page_size?: number;
    start_date?: string;
    end_date?: string;
    customer_id?: number;
    customer_name?: string;
  }): Promise<
    ApiResponse<import('../types/payments').AdminListTransactionsResponse>
  > {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.page_size) search.set('page_size', String(params.page_size));
    if (params.start_date) search.set('start_date', params.start_date);
    if (params.end_date) search.set('end_date', params.end_date);
    if (params.customer_id)
      search.set('customer_id', String(params.customer_id));
    if (params.customer_name) search.set('customer_name', params.customer_name);

    const response = await this.requestJson<
      import('../types/payments').AdminListTransactionsResponse
    >(
      `/admin/payments/transactions${search.toString() ? `?${search.toString()}` : ''}`,
      {
        method: 'GET',
        headers: this.getAdminAuthHeaders('none'),
      }
    );

    return this.withFallbackData(response, {
      items: [],
      pagination: {
        current_page: 1,
        page_size: 20,
        total_items: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false,
      },
    });
  }

  async uploadMultimediaByAdmin(
    customerId: number,
    file: File
  ): Promise<
    ApiResponse<import('../types/campaign').UploadMultimediaResponse>
  > {
    const url = getApiUrl('/admin/media/upload');
    try {
      const form = new FormData();
      form.append('customer_id', String(customerId));
      form.append('file', file);
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(this.getAccessToken()
            ? { Authorization: `Bearer ${this.getAccessToken()}` }
            : {}),
        },
        body: form,
        signal: AbortSignal.timeout(120000),
      });
      if (resp.status === 401) {
        this.handleUnauthorized();
        return {
          success: false,
          message: 'Unauthorized',
          error: { code: 'UNAUTHORIZED', details: null },
        } as any;
      }
      const data = await resp.json();
      if (!resp.ok) {
        return {
          success: false,
          message: data?.message || 'Failed to upload multimedia',
          error: data?.error,
        };
      }
      return {
        success: true,
        message: data?.message || 'OK',
        data: data?.data,
      };
    } catch {
      return {
        success: false,
        message: 'An error occurred',
        error: { code: 'NETWORK_ERROR', details: null },
      };
    }
  }

  async addInvoiceToTransaction(payload: {
    transaction_uuid: string;
    customer_invoice_uuid: string;
  }): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const response = await this.requestJson<{
      success: boolean;
      message: string;
    }>('/admin/payments/transactions/invoice', {
      method: 'POST',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return this.withFallbackData(response, { success: true, message: 'OK' });
  }

  async getCustomersShares(
    params: { start_date?: string; end_date?: string } = {}
  ): Promise<
    ApiResponse<import('../types/admin').AdminCustomersSharesResponse>
  > {
    const qs = new URLSearchParams();
    if (params.start_date) qs.set('start_date', params.start_date);
    if (params.end_date) qs.set('end_date', params.end_date);
    const response = await this.requestJson<
      import('../types/admin').AdminCustomersSharesResponse
    >(
      `/admin/customer-management/shares${qs.toString() ? `?${qs.toString()}` : ''}`,
      {
        method: 'GET',
        headers: this.getAdminAuthHeaders('none'),
      }
    );

    return this.withFallbackData(
      response,
      {} as import('../types/admin').AdminCustomersSharesResponse
    );
  }

  async listCustomersByAdmin(): Promise<
    ApiResponse<AdminListCustomersResponse>
  > {
    const response = await this.requestJson<AdminListCustomersResponse>(
      '/admin/customer-management',
      {
        method: 'GET',
        headers: this.getAdminAuthHeaders('none'),
      }
    );

    return this.withFallbackData(response, {
      message: response.message,
      items: [],
      total: 0,
    });
  }

  async chargeWallet(
    payload: AdminChargeWalletRequest
  ): Promise<ApiResponse<AdminChargeWalletResponse>> {
    const response = await this.requestJson<AdminChargeWalletResponse>(
      '/admin/payments/charge-wallet',
      {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    return this.withFallbackData(response, {} as AdminChargeWalletResponse);
  }

  async previewWalletChargeImpact(
    payload: AdminPreviewWalletChargeImpactRequest
  ): Promise<ApiResponse<AdminPreviewWalletChargeImpactResponse>> {
    const response =
      await this.requestJson<AdminPreviewWalletChargeImpactResponse>(
        '/admin/payments/charge-wallet/preview',
        {
          method: 'POST',
          headers: this.getAdminAuthHeaders(),
          body: JSON.stringify(payload),
        },
        { timeoutMs: 30000 }
      );

    return this.withFallbackData(
      response,
      {} as AdminPreviewWalletChargeImpactResponse
    );
  }

  async listTickets(
    params: {
      customer_id?: number;
      title?: string;
      start_date?: string;
      end_date?: string;
      replied_by_admin?: boolean;
      page?: number;
      page_size?: number;
    } = {}
  ): Promise<
    ApiResponse<{
      message: string;
      groups: Array<{
        correlation_id: string;
        items: Array<{
          id: number;
          title: string;
          content: string;
          created_at: string;
          customer_first_name?: string;
          customer_last_name?: string;
          company_name?: string;
          phone_number?: string;
          agency_name?: string;
        }>;
      }>;
    }>
  > {
    const qs = new URLSearchParams();
    if (params.customer_id) qs.set('customer_id', String(params.customer_id));
    if (params.title) qs.set('title', params.title);
    if (params.start_date) qs.set('start_date', params.start_date);
    if (params.end_date) qs.set('end_date', params.end_date);
    if (typeof params.replied_by_admin === 'boolean')
      qs.set('replied_by_admin', params.replied_by_admin ? 'true' : 'false');
    if (params.page) qs.set('page', String(params.page));
    if (params.page_size) qs.set('page_size', String(params.page_size));
    const response = await this.requestJson<{
      message: string;
      groups: Array<{
        correlation_id: string;
        items: Array<{
          id: number;
          title: string;
          content: string;
          created_at: string;
          customer_first_name?: string;
          customer_last_name?: string;
          company_name?: string;
          phone_number?: string;
          agency_name?: string;
        }>;
      }>;
    }>(`/admin/tickets${qs.toString() ? `?${qs.toString()}` : ''}`, {
      method: 'GET',
      headers: this.getAdminAuthHeaders('none'),
    });

    return this.withFallbackData(response, {
      message: 'OK',
      groups: [],
    });
  }

  async createTicketReply(payload: {
    ticket_id: number;
    content: string;
    file?: File | null;
  }): Promise<
    ApiResponse<{
      id: number;
      uuid: string;
      correlation_id: string;
      created_at: string;
    }>
  > {
    const url = getApiUrl('/admin/tickets/reply');
    try {
      let resp: Response;
      if (payload.file) {
        const form = new FormData();
        if (payload.ticket_id)
          form.append('ticket_id', String(payload.ticket_id));
        if (payload.content) form.append('content', payload.content);
        form.append('file', payload.file);
        resp = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            ...(this.getAccessToken()
              ? { Authorization: `Bearer ${this.getAccessToken()}` }
              : {}),
          },
          body: form,
          signal: AbortSignal.timeout(20000),
        });
      } else {
        resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(this.getAccessToken()
              ? { Authorization: `Bearer ${this.getAccessToken()}` }
              : {}),
          },
          body: JSON.stringify({
            ticket_id: payload.ticket_id,
            content: payload.content,
          }),
          signal: AbortSignal.timeout(20000),
        });
      }

      if (resp.status === 401) {
        this.handleUnauthorized();
        return {
          success: false,
          message: 'Unauthorized',
          error: { code: 'UNAUTHORIZED', details: null },
        } as any;
      }

      const data = await resp.json();
      if (resp.status === 201 || resp.ok) {
        return {
          success: true,
          message: data?.message || 'OK',
          data: data?.data,
        } as any;
      }
      const errorMessage =
        data?.error?.code || data?.message || `HTTP ${resp.status}`;
      return {
        success: false,
        message: errorMessage,
        error: { code: errorMessage, details: data?.error?.details },
      } as any;
    } catch (e) {
      return {
        success: false,
        message: 'An error occurred',
        error: { code: 'NETWORK_ERROR', details: null },
      } as any;
    }
  }

  async getCustomerWithCampaigns(
    customerId: number
  ): Promise<
    ApiResponse<import('../types/admin').AdminCustomerWithCampaignsResponse>
  > {
    const response = await this.requestJson<
      import('../types/admin').AdminCustomerWithCampaignsResponse
    >(`/admin/customer-management/${customerId}`, {
      method: 'GET',
      headers: this.getAdminAuthHeaders('none'),
    });

    return this.withFallbackData(
      response,
      {} as import('../types/admin').AdminCustomerWithCampaignsResponse
    );
  }

  async getCampaignById(
    id: number
  ): Promise<ApiResponse<import('../types/admin').AdminGetCampaignResponse>> {
    const response = await this.requestJson<
      import('../types/admin').AdminGetCampaignResponse
    >(`/admin/campaigns/${id}`, {
      method: 'GET',
      headers: this.getAdminAuthHeaders('none'),
    });

    return this.withFallbackData(
      response,
      {} as import('../types/admin').AdminGetCampaignResponse
    );
  }

  async getCustomerDiscountsHistory(
    customerId: number
  ): Promise<
    ApiResponse<import('../types/admin').AdminCustomerDiscountHistoryResponse>
  > {
    const response = await this.requestJson<
      import('../types/admin').AdminCustomerDiscountHistoryResponse
    >(`/admin/customer-management/${customerId}/discounts`, {
      method: 'GET',
      headers: this.getAdminAuthHeaders('none'),
    });

    return this.withFallbackData(response, {
      message: response.message,
      items: [],
    } as import('../types/admin').AdminCustomerDiscountHistoryResponse);
  }

  async setCustomerActiveStatus(
    payload: import('../types/admin').AdminSetCustomerActiveStatusRequest
  ): Promise<
    ApiResponse<import('../types/admin').AdminSetCustomerActiveStatusResponse>
  > {
    const response = await this.requestJson<
      import('../types/admin').AdminSetCustomerActiveStatusResponse
    >('/admin/customer-management/active-status', {
      method: 'POST',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return this.withFallbackData(
      response,
      {} as import('../types/admin').AdminSetCustomerActiveStatusResponse
    );
  }

  async listLevel3Options(
    platform?: string
  ): Promise<
    ApiResponse<import('../types/admin').AdminListLevel3OptionsResponse>
  > {
    const query = platform ? `?platform=${encodeURIComponent(platform)}` : '';
    const response = await this.requestJson<
      import('../types/admin').AdminListLevel3OptionsResponse
    >(`/admin/segment-price-factors/level3-options${query}`, {
      method: 'GET',
      headers: this.getAdminAuthHeaders('none'),
    });

    return this.withFallbackData(response, {
      message: response.message,
      items: [],
    } as import('../types/admin').AdminListLevel3OptionsResponse);
  }

  async listSegmentPriceFactors(
    platform?: string
  ): Promise<
    ApiResponse<import('../types/admin').AdminListSegmentPriceFactorsResponse>
  > {
    const query = platform ? `?platform=${encodeURIComponent(platform)}` : '';
    const response = await this.requestJson<
      import('../types/admin').AdminListSegmentPriceFactorsResponse
    >(`/admin/segment-price-factors${query}`, {
      method: 'GET',
      headers: this.getAdminAuthHeaders('none'),
    });

    return this.withFallbackData(response, {
      message: response.message,
      items: [],
    } as import('../types/admin').AdminListSegmentPriceFactorsResponse);
  }

  async createSegmentPriceFactor(
    payload: import('../types/admin').AdminCreateSegmentPriceFactorRequest
  ): Promise<
    ApiResponse<import('../types/admin').AdminCreateSegmentPriceFactorResponse>
  > {
    const response = await this.requestJson<
      import('../types/admin').AdminCreateSegmentPriceFactorResponse
    >('/admin/segment-price-factors', {
      method: 'POST',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return this.withFallbackData(
      response,
      {} as import('../types/admin').AdminCreateSegmentPriceFactorResponse
    );
  }

  async listPlatformSettingsByAdmin(): Promise<
    ApiResponse<AdminListPlatformSettingsResponse>
  > {
    const response = await this.requestJson<AdminListPlatformSettingsResponse>(
      '/admin/platform-settings',
      {
        method: 'GET',
        headers: this.getAdminAuthHeaders('none'),
      }
    );

    return this.withFallbackData(response, {
      message: response.message,
      items: [],
    } as AdminListPlatformSettingsResponse);
  }

  async changePlatformSettingsStatusByAdmin(
    payload: AdminChangePlatformSettingsStatusRequest
  ): Promise<ApiResponse<AdminChangePlatformSettingsStatusResponse>> {
    const response =
      await this.requestJson<AdminChangePlatformSettingsStatusResponse>(
        '/admin/platform-settings/status',
        {
          method: 'PUT',
          headers: this.getAdminAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

    return this.withFallbackData(
      response,
      {} as AdminChangePlatformSettingsStatusResponse
    );
  }

  async addPlatformSettingsMetadataByAdmin(
    payload: AdminAddPlatformSettingsMetadataRequest
  ): Promise<ApiResponse<AdminAddPlatformSettingsMetadataResponse>> {
    const response =
      await this.requestJson<AdminAddPlatformSettingsMetadataResponse>(
        '/admin/platform-settings/metadata',
        {
          method: 'PUT',
          headers: this.getAdminAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

    return this.withFallbackData(
      response,
      {} as AdminAddPlatformSettingsMetadataResponse
    );
  }

  async listPlatformBasePricesByAdmin(): Promise<
    ApiResponse<AdminListPlatformBasePricesResponse>
  > {
    const response =
      await this.requestJson<AdminListPlatformBasePricesResponse>(
        '/admin/platform-base-prices',
        {
          method: 'GET',
          headers: this.getAdminAuthHeaders('none'),
        }
      );

    return this.withFallbackData(response, {
      message: response.message,
      items: [],
    } as AdminListPlatformBasePricesResponse);
  }

  async updatePlatformBasePriceByAdmin(
    payload: AdminUpdatePlatformBasePriceRequest
  ): Promise<ApiResponse<AdminUpdatePlatformBasePriceResponse>> {
    const response =
      await this.requestJson<AdminUpdatePlatformBasePriceResponse>(
        '/admin/platform-base-prices',
        {
          method: 'PUT',
          headers: this.getAdminAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

    return this.withFallbackData(
      response,
      {} as AdminUpdatePlatformBasePriceResponse
    );
  }

  async getCampaignPagePricesByAdmin(): Promise<
    ApiResponse<AdminGetPagePricesResponse>
  > {
    const response = await this.requestJson<AdminGetPagePricesResponse>(
      '/admin/campaigns/page-prices',
      {
        method: 'GET',
        headers: this.getAdminAuthHeaders('none'),
      }
    );

    return this.withFallbackData(response, {
      message: response.message,
      items: [],
    } as AdminGetPagePricesResponse);
  }

  async updateCampaignPagePriceByAdmin(
    payload: AdminUpdatePagePriceRequest
  ): Promise<ApiResponse<AdminUpdatePagePriceResponse>> {
    const response = await this.requestJson<AdminUpdatePagePriceResponse>(
      '/admin/campaigns/page-prices',
      {
        method: 'PUT',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    return this.withFallbackData(response, {} as AdminUpdatePagePriceResponse);
  }

  async downloadMultimediaByAdmin(uuid: string): Promise<{
    success: boolean;
    message: string;
    blob?: Blob;
    filename?: string;
  }> {
    const url = getApiUrl(`/admin/media/${encodeURIComponent(uuid)}`);
    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          ...(this.getAccessToken()
            ? { Authorization: `Bearer ${this.getAccessToken()}` }
            : {}),
        },
        signal: AbortSignal.timeout(30000),
      });
      if (resp.status === 401) {
        this.handleUnauthorized();
        return { success: false, message: 'Unauthorized' };
      }
      if (!resp.ok) {
        let message = 'Failed to download multimedia';
        try {
          const data = await resp.json();
          message = data?.message || message;
        } catch {
          // ignore JSON parse errors for binary/non-JSON error payloads
        }
        return { success: false, message };
      }
      const blob = await resp.blob();
      const cd = resp.headers.get('Content-Disposition') || '';
      const filenameMatch = cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
      const filename = filenameMatch
        ? decodeURIComponent(filenameMatch[1]).replace(/"/g, '')
        : 'multimedia';
      return { success: true, message: 'OK', blob, filename };
    } catch {
      return { success: false, message: 'An error occurred' };
    }
  }

  async previewMultimediaByAdmin(uuid: string): Promise<{
    success: boolean;
    message: string;
    blob?: Blob;
    filename?: string;
    notFound?: boolean;
  }> {
    const url = getApiUrl(`/admin/media/${encodeURIComponent(uuid)}/preview`);
    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          ...(this.getAccessToken()
            ? { Authorization: `Bearer ${this.getAccessToken()}` }
            : {}),
        },
        signal: AbortSignal.timeout(30000),
      });
      if (resp.status === 401) {
        this.handleUnauthorized();
        return { success: false, message: 'Unauthorized' };
      }
      if (resp.status === 404 || resp.status === 410) {
        return { success: false, message: 'Not found', notFound: true };
      }
      if (!resp.ok) {
        let message = 'Failed to generate preview';
        try {
          const data = await resp.json();
          message = data?.message || message;
        } catch {
          // ignore JSON parse errors for binary/non-JSON error payloads
        }
        return { success: false, message };
      }
      const blob = await resp.blob();
      const cd = resp.headers.get('Content-Disposition') || '';
      const filenameMatch = cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
      const filename = filenameMatch
        ? decodeURIComponent(filenameMatch[1]).replace(/"/g, '')
        : 'preview';
      return { success: true, message: 'OK', blob, filename };
    } catch {
      return { success: false, message: 'An error occurred' };
    }
  }

  // Creates an upload job. The API returns 202 while it is being processed.
  async uploadShortLinksCSV(
    file: File,
    shortLinkDomain: string,
    scenarioName: string
  ): Promise<ApiResponse<AdminCreateShortLinksResponse>> {
    const form = new FormData();
    form.append('file', file);
    form.append('short_link_domain', shortLinkDomain);
    form.append('scenario_name', scenarioName.trim());

    const response = await this.requestJson<AdminCreateShortLinksResponse>(
      '/admin/short-links/upload-csv',
      {
        method: 'POST',
        headers: this.getAdminAuthHeaders('none'),
        body: form,
      },
      // Uploads can be large; allow up to 5 minutes to match backend limits.
      { timeoutMs: 300000 }
    );

    if (response.success && !response.data?.job?.id) {
      return this.createErrorResponse('INVALID_RESPONSE');
    }

    return response;
  }

  async getShortLinkUploadStatus(
    jobId: string
  ): Promise<ApiResponse<AdminShortLinkUploadJobDTO>> {
    const response = await this.requestJson<AdminShortLinkUploadJobDTO>(
      `/admin/short-links/upload-csv/${encodeURIComponent(jobId)}`,
      { headers: this.getAdminAuthHeaders('none') },
      { timeoutMs: 30000 }
    );

    if (response.success && !response.data?.id) {
      return this.createErrorResponse('INVALID_RESPONSE');
    }

    return response;
  }
}

export const adminApiService = new AdminApiService();
export default adminApiService;
