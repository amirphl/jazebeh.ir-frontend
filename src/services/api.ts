import {
  CreateCampaignPayload,
  CreateSMSCampaignResponse,
  CloneCampaignResponse,
  CalculateCampaignCapacityRequest,
  CalculateCampaignCapacityResponse,
  CalculateCampaignCostRequest,
  CalculateCampaignCostResponse,
  HideCampaignsRequest,
  HideCampaignsResponse,
  UnhideCampaignsRequest,
  UnhideCampaignsResponse,
  CalculateCampaignCostV2Request,
  GetWalletBalanceResponse,
  UpdateSMSCampaignRequest,
  UpdateSMSCampaignResponse,
  SendCampaignTestMessageRequest,
  SendCampaignTestMessageResponse,
  AutoSelectSmartTargetingTagsRequest,
  ListSmartTargetingTagsParams,
  ListSmartTargetingTagsResponse,
  ListSMSCampaignsParams,
  ListSMSCampaignsResponse,
  ReplaceSmartTargetingSelectionRequest,
  SmartTargetingSelectionResponse,
  SmartTargetingCapacityCalculationResponse,
  StartSmartTargetingCapacityCalculationRequest,
  SmartTargetingTestSamplingCalculationResponse,
  UploadMultimediaResponse,
} from '../types/campaign';
import {
  CreateBundleRequest,
  CreateBundleResponse,
  GetBundlePayload,
  GetBundleTagEvaluationStatusResponse,
  ListBundleTagScoresParams,
  ListBundleTagScoresResponse,
  ListBundlesParams,
  ListBundlesResponse,
  RequestBundleTagEvaluationResponse,
  UpdateBundleRequest,
  UpdateBundleResponse,
} from '../types/bundle';
import {
  CreatePlatformSettingsRequest,
  CreatePlatformSettingsResponse,
  ListPlatformSettingsResponse,
} from '../types/platformSettings';

import {
  config,
  getApiUrl,
  isDevelopment,
  isProduction,
} from '../config/environment';
import {
  GetTransactionHistoryParams,
  TransactionHistoryResponse,
} from '../types/payments';
import {
  AgencyCustomerReportResponse,
  ListAgencyActiveDiscountsResponse,
  ListAgencyCustomerDiscountsResponse,
  ListAgencyCustomersResponse,
} from '../types/agency';
import {
  ListAudienceSpecResponse,
  ListActiveLineNumbersResponse,
  ListLatestSegmentPriceFactorsResponse,
  GetLastInitiatedCampaignResponse,
} from '../types/campaign';
import {
  SubmitDepositReceiptRequest,
  SubmitDepositReceiptResponse,
  ListDepositReceiptsResponse,
  ProformaPreviewResponse,
  UpdateDepositReceiptFileRequest,
  NotifyInvoiceIssueRequest,
  NotifyInvoiceIssueResponse,
} from '../types/payments';
import {
  login as authLogin,
  requestLoginOtp as authRequestLoginOtp,
} from './auth/api';

// Updated to match Go backend response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: ErrorDetail;
}

export interface ErrorDetail {
  code: string;
  details?: any;
}

interface SignupRequestPayload {
  account_type: string;
  company_name?: string;
  national_id?: string;
  company_phone?: string;
  company_address?: string;
  postal_code?: string;
  sheba_number?: string;
  representative_first_name?: string;
  representative_last_name?: string;
  representative_mobile: string;
  email: string;
  password: string;
  confirm_password?: string;
  referrer_agency_code?: string;
  job_category?: string;
  job?: string;
  category?: string;
}

export interface PlatformBasePriceItem {
  platform: string;
  price: number;
}

export interface ListPlatformBasePricesResponse {
  message?: string;
  items: PlatformBasePriceItem[];
}

export interface PagePriceItem {
  platform: string;
  price: number;
  created_at?: string;
}

export interface GetPagePricesResponse {
  message?: string;
  items: PagePriceItem[];
}

// Global 401 handler type
export type UnauthorizedHandler = () => void;

interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  expectedContentType?: string;
}

export interface BinaryApiResponse {
  success: boolean;
  message: string;
  blob?: Blob;
  filename?: string;
}

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private unauthorizedHandler: UnauthorizedHandler | null = null;
  private inFlightRequests = new Map<string, Promise<ApiResponse<any>>>();

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  // Method to set the global 401 handler
  setUnauthorizedHandler(handler: UnauthorizedHandler) {
    this.unauthorizedHandler = handler;
  }

  // Method to check if unauthorized handler is configured
  isUnauthorizedHandlerConfigured(): boolean {
    return !!this.unauthorizedHandler;
  }

  // Test method to verify 401 handling (for debugging)
  testUnauthorizedHandler() {
    if (this.unauthorizedHandler) {
      this.unauthorizedHandler();
    } else {
      console.warn('No unauthorized handler available for testing');
    }
  }

  // Method to set access token for authenticated requests
  setAccessToken(token: string | null) {
    if (this.accessToken !== token) {
      this.inFlightRequests.clear();
    }
    this.accessToken = token;
  }

  private getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem('access_token');
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

  private async parseJsonResponse(response: Response): Promise<any | null> {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
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

  private normalizeErrorCode(
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

  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);

    // Validate URL to prevent SSRF attacks
    if (!this.isValidUrl(url)) {
      return this.createErrorResponse('INVALID_URL');
    }

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    };

    const accessToken = this.getAccessToken();
    if (accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    const mergedHeaders: Record<string, string> = {
      ...defaultHeaders,
      ...(options.headers as Record<string, string> | undefined),
    };

    const isFormData =
      typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (isFormData) {
      delete mergedHeaders['Content-Type'];
    }

    const config: RequestInit = {
      ...options,
      headers: mergedHeaders,
      signal: this.createTimeoutSignal(
        options.timeoutMs ?? 30000,
        options.signal
      ),
    };

    try {
      const response = await fetch(url, config);
      const data = await this.parseJsonResponse(response);

      if (response.status === 401) {
        const isAuthEndpoint =
          endpoint.includes('/auth/login') ||
          endpoint.includes('/auth/login/otp') ||
          endpoint.includes('/auth/signup') ||
          endpoint.includes('/auth/verify') ||
          endpoint.includes('/auth/resend-otp') ||
          endpoint.includes('/auth/forgot-password') ||
          endpoint.includes('/auth/reset');

        if (!isAuthEndpoint) {
          this.unauthorizedHandler?.();
        }

        const normalized = this.normalizeErrorCode(
          data,
          response.status,
          'UNAUTHORIZED'
        );
        return this.createErrorResponse(
          normalized.code,
          normalized.message,
          normalized.details
        );
      }

      if (!response.ok) {
        const normalized = this.normalizeErrorCode(
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

      if (response.status === 204) {
        return {
          success: true,
          message: 'Success',
          data: undefined,
        };
      }

      if (data === null) {
        return this.createErrorResponse('INVALID_RESPONSE');
      }

      return {
        success: true,
        message: data.message || 'Success',
        data: data.data,
      };
    } catch (error) {
      if (
        error instanceof DOMException &&
        (error.name === 'AbortError' || error.name === 'TimeoutError')
      ) {
        return this.createErrorResponse('TIMEOUT_ERROR');
      }

      if (error instanceof TypeError) {
        return this.createErrorResponse('NETWORK_ERROR');
      }

      return this.createErrorResponse(
        'UNKNOWN_ERROR',
        this.isProduction()
          ? 'UNKNOWN_ERROR'
          : error instanceof Error
            ? error.message
            : 'UNKNOWN_ERROR'
      );
    }
  }

  private requestOnce<T>(
    cacheKey: string,
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    // Abort signals are caller-owned. Sharing those requests would let one
    // unmounted consumer cancel every consumer waiting on the same endpoint.
    if (options.signal) {
      return this.request<T>(endpoint, options);
    }

    const existing = this.inFlightRequests.get(cacheKey);
    if (existing) {
      return existing as Promise<ApiResponse<T>>;
    }

    let requestPromise: Promise<ApiResponse<T>>;
    requestPromise = this.request<T>(endpoint, options).finally(() => {
      if (this.inFlightRequests.get(cacheKey) === requestPromise) {
        this.inFlightRequests.delete(cacheKey);
      }
    });

    this.inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  private async requestBinary(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<BinaryApiResponse> {
    const url = getApiUrl(endpoint);
    if (!this.isValidUrl(url)) {
      return { success: false, message: 'INVALID_URL' };
    }

    const {
      expectedContentType,
      timeoutMs,
      signal: callerSignal,
      ...requestOptions
    } = options;

    const headers: Record<string, string> = {
      Accept: expectedContentType || '*/*',
      'X-Requested-With': 'XMLHttpRequest',
    };
    const accessToken = this.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...requestOptions,
        method: requestOptions.method ?? 'GET',
        headers: {
          ...(requestOptions.headers
            ? Object.fromEntries(new Headers(requestOptions.headers))
            : undefined),
          ...headers,
        },
        signal: this.createTimeoutSignal(timeoutMs ?? 30000, callerSignal),
      });

      if (response.status === 401) {
        this.unauthorizedHandler?.();
        return {
          success: false,
          message: 'UNAUTHORIZED',
        };
      }

      if (!response.ok) {
        const data = await this.parseJsonResponse(response);
        const normalized = this.normalizeErrorCode(
          data,
          response.status,
          this.getStatusErrorCode(response.status)
        );
        return { success: false, message: normalized.code };
      }

      const contentType = response.headers.get('content-type') || '';
      if (
        expectedContentType &&
        !contentType.toLowerCase().includes(expectedContentType.toLowerCase())
      ) {
        return { success: false, message: 'INVALID_RESPONSE' };
      }

      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition') || '';
      const filenameMatch = disposition.match(/filename=([^;]+)/i);
      const filename = filenameMatch
        ? filenameMatch[1].replace(/"/g, '')
        : undefined;
      return { success: true, message: 'Success', blob, filename };
    } catch (error) {
      if (
        error instanceof DOMException &&
        (error.name === 'AbortError' || error.name === 'TimeoutError')
      ) {
        return { success: false, message: 'TIMEOUT_ERROR' };
      }
      if (error instanceof TypeError) {
        return { success: false, message: 'NETWORK_ERROR' };
      }
      return {
        success: false,
        message:
          error instanceof Error && !this.isProduction()
            ? error.message
            : 'UNKNOWN_ERROR',
      };
    }
  }

  // Validate URL to prevent SSRF attacks
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Only allow HTTPS in production
      if (this.isProduction() && urlObj.protocol !== 'https:') {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // Format phone number to include +98 prefix
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any existing +98 prefix and leading zeros
    let cleaned = phoneNumber.replace(/^\+98/, '').replace(/^0+/, '');

    // If it starts with 9 (Iranian mobile numbers), add +98
    if (cleaned.startsWith('9')) {
      return `+98${cleaned}`;
    }

    // If it's already in international format, return as is
    if (cleaned.startsWith('98')) {
      return `+${cleaned}`;
    }

    // Default: add +98 prefix
    return `+98${cleaned}`;
  }

  // Auth endpoints
  async login(
    identifier: string,
    password: string,
    otpCode: string
  ): Promise<ApiResponse> {
    return authLogin(identifier, password, otpCode);
  }

  async requestLoginOtp(identifier: string): Promise<ApiResponse> {
    return authRequestLoginOtp(identifier);
  }

  async signup(signupData: SignupRequestPayload): Promise<ApiResponse> {
    // Input validation
    if (!signupData || typeof signupData !== 'object') {
      return {
        success: false,
        message: 'Invalid signup data',
        error: {
          code: 'Invalid signup data',
          details: null,
        },
      };
    }

    // Validate required fields
    const requiredFields: Array<keyof SignupRequestPayload> = [
      'email',
      'password',
      'representative_mobile',
    ];
    for (const field of requiredFields) {
      if (!signupData[field] || typeof signupData[field] !== 'string') {
        return {
          success: false,
          message: `Missing required field: ${field}`,
          error: {
            code: `Missing required field: ${field}`,
            details: null,
          },
        };
      }
    }

    // If account_type is not marketing_agency, job_category and job are required
    if (signupData.account_type !== 'marketing_agency') {
      if (
        !signupData.job_category ||
        typeof signupData.job_category !== 'string'
      ) {
        return {
          success: false,
          message: 'Missing required field: job_category',
          error: {
            code: 'Missing required field: job_category',
            details: null,
          },
        };
      }
      if (!signupData.job || typeof signupData.job !== 'string') {
        return {
          success: false,
          message: 'Missing required field: job',
          error: { code: 'Missing required field: job', details: null },
        };
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      return {
        success: false,
        message: 'Invalid email format',
        error: {
          code: 'Invalid email format',
          details: null,
        },
      };
    }

    // Validate password strength
    if (signupData.password.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long',
        error: {
          code: 'Password must be at least 8 characters long',
          details: null,
        },
      };
    }

    // Check for at least 1 uppercase letter and 1 number
    if (!/[A-Z]/.test(signupData.password)) {
      return {
        success: false,
        message: 'Password must contain at least 1 uppercase letter',
        error: {
          code: 'Password must contain at least 1 uppercase letter',
          details: null,
        },
      };
    }

    if (!/\d/.test(signupData.password)) {
      return {
        success: false,
        message: 'Password must contain at least 1 number',
        error: {
          code: 'Password must contain at least 1 number',
          details: null,
        },
      };
    }

    if (
      signupData.confirm_password &&
      signupData.confirm_password !== signupData.password
    ) {
      return {
        success: false,
        message: 'Passwords do not match',
        error: {
          code: 'Passwords do not match',
          details: null,
        },
      };
    }

    // Format phone numbers to include +98 prefix
    const formattedData = {
      ...signupData,
      representative_mobile: this.formatPhoneNumber(
        signupData.representative_mobile
      ),
      company_phone: signupData.company_phone
        ? this.formatPhoneNumber(signupData.company_phone)
        : undefined,
      // Include job/category fields if present
      category: signupData.job_category
        ? String(signupData.job_category)
        : undefined,
      job: signupData.job ? String(signupData.job) : undefined,
    };

    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(formattedData),
    });

    return response;
  }

  async verifyOtp(
    customerId: number,
    otpCode: string,
    otpType: string = 'mobile'
  ): Promise<ApiResponse> {
    if (!Number.isInteger(customerId) || customerId <= 0) {
      return {
        success: false,
        message: 'Invalid customer id',
        error: {
          code: 'Invalid customer id',
          details: null,
        },
      };
    }

    if (!/^\d{6}$/.test(otpCode)) {
      return {
        success: false,
        message: 'Invalid OTP code',
        error: {
          code: 'Invalid OTP code',
          details: null,
        },
      };
    }

    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        otp_code: otpCode,
        otp_type: otpType,
      }),
    });
  }

  async resendOtp(
    customerId: number,
    otpType: string = 'mobile'
  ): Promise<ApiResponse> {
    if (!Number.isInteger(customerId) || customerId <= 0) {
      return {
        success: false,
        message: 'Invalid customer id',
        error: {
          code: 'Invalid customer id',
          details: null,
        },
      };
    }

    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        otp_type: otpType,
      }),
    });
  }

  // Get authenticated user's profile
  async getProfile(): Promise<
    ApiResponse<{ customer: any; parent_agency?: any; parentAgency?: any }>
  > {
    return this.request<{
      customer: any;
      parent_agency?: any;
      parentAgency?: any;
    }>('/profile', { method: 'GET' });
  }

  async forgotPassword(identifier: string): Promise<ApiResponse> {
    // Input validation
    if (
      !identifier ||
      typeof identifier !== 'string' ||
      identifier.length > 255
    ) {
      return {
        success: false,
        message: 'Invalid identifier',
        error: {
          code: 'Invalid identifier',
          details: null,
        },
      };
    }

    // Check if identifier looks like a phone number (contains only digits and +)
    const phoneRegex = /^[\d+]+$/;
    if (phoneRegex.test(identifier)) {
      // Format phone number to include +98 prefix
      const formattedIdentifier = this.formatPhoneNumber(identifier);
      return this.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          identifier: formattedIdentifier,
        }),
      });
    }

    // If it's not a phone number (likely email), send as is
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        identifier: identifier.trim(),
      }),
    });
  }

  async resetPassword(
    customerId: number,
    newPassword: string,
    confirmPassword: string,
    otpCode: string
  ): Promise<ApiResponse> {
    return this.request('/auth/reset', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        new_password: newPassword,
        confirm_password: confirmPassword,
        otp_code: otpCode,
      }),
    });
  }

  // Campaign endpoints
  async listCampaigns(
    params: ListSMSCampaignsParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<ListSMSCampaignsResponse>> {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('limit', String(params.limit));
    if (params.orderby) query.set('orderby', params.orderby);
    if (params.campaign_title) {
      query.set('campaign_title', params.campaign_title);
    }
    if (params.bundle_title) query.set('bundle_title', params.bundle_title);
    if (params.status) query.set('status', params.status);
    if (params.bundle_id) query.set('bundle_id', String(params.bundle_id));
    if (params.platform) query.set('platform', params.platform);
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.phase) query.set('phase', params.phase);
    if (params.hidden !== undefined) query.set('hidden', String(params.hidden));
    const endpoint = `${config.endpoints.campaigns.list}?${query.toString()}`;
    return this.request<ListSMSCampaignsResponse>(endpoint, {
      method: 'GET',
      signal,
    });
  }

  async listBundles(
    params: ListBundlesParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<ListBundlesResponse>> {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('limit', String(params.limit));
    if (params.title) query.set('title', params.title);
    if (params.target_audience_persona) {
      query.set('target_audience_persona', params.target_audience_persona);
    }

    const endpoint = `${config.endpoints.bundles.list}?${query.toString()}`;
    const cacheKey = `GET:${endpoint}`;
    return this.requestOnce<ListBundlesResponse>(cacheKey, endpoint, {
      method: 'GET',
      signal,
    });
  }

  async getBundle(
    id: number,
    signal?: AbortSignal
  ): Promise<ApiResponse<GetBundlePayload>> {
    const endpoint = config.endpoints.bundles.get.replace(
      ':id',
      encodeURIComponent(String(id))
    );
    const cacheKey = `GET:${endpoint}`;
    return this.requestOnce<GetBundlePayload>(cacheKey, endpoint, {
      method: 'GET',
      signal,
    });
  }

  async createBundle(
    payload: CreateBundleRequest
  ): Promise<ApiResponse<CreateBundleResponse>> {
    return this.request<CreateBundleResponse>(config.endpoints.bundles.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateBundle(
    id: number,
    payload: UpdateBundleRequest
  ): Promise<ApiResponse<UpdateBundleResponse>> {
    const endpoint = config.endpoints.bundles.update.replace(
      ':id',
      encodeURIComponent(String(id))
    );

    return this.request<UpdateBundleResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async requestBundleTagEvaluation(
    id: number
  ): Promise<ApiResponse<RequestBundleTagEvaluationResponse>> {
    const endpoint = config.endpoints.bundles.requestTagEvaluation.replace(
      ':id',
      encodeURIComponent(String(id))
    );

    return this.request<RequestBundleTagEvaluationResponse>(endpoint, {
      method: 'POST',
    });
  }

  async getBundleTagEvaluationStatus(
    id: number,
    signal?: AbortSignal
  ): Promise<ApiResponse<GetBundleTagEvaluationStatusResponse>> {
    const endpoint = config.endpoints.bundles.tagEvaluationStatus.replace(
      ':id',
      encodeURIComponent(String(id))
    );

    return this.request<GetBundleTagEvaluationStatusResponse>(endpoint, {
      method: 'GET',
      signal,
    });
  }

  async listBundleTagScores(
    id: number,
    params: ListBundleTagScoresParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<ListBundleTagScoresResponse>> {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
    });
    const path = config.endpoints.bundles.tagScores.replace(
      ':id',
      encodeURIComponent(String(id))
    );

    return this.request<ListBundleTagScoresResponse>(
      `${path}?${query.toString()}`,
      { method: 'GET', signal }
    );
  }

  async getCampaigns(): Promise<ApiResponse> {
    return this.request(config.endpoints.campaigns.list, {
      method: 'GET',
    });
  }

  async createCampaign(
    campaignData: CreateCampaignPayload
  ): Promise<ApiResponse<CreateSMSCampaignResponse>> {
    // Do not infer creation success from the account's "last initiated"
    // Campaign. Another tab can create an indistinguishable Campaign while
    // this request is in flight, so only the POST response can establish the
    // identity safely. The CampaignProvider deduplicates concurrent attempts
    // within this application instance.
    return this.request<CreateSMSCampaignResponse>(
      config.endpoints.campaigns.create,
      {
        method: 'POST',
        body: JSON.stringify(campaignData),
      }
    );
  }

  async getLastInitiatedCampaign(): Promise<
    ApiResponse<GetLastInitiatedCampaignResponse>
  > {
    return this.request<GetLastInitiatedCampaignResponse>(
      config.endpoints.campaigns.lastInitiated,
      {
        method: 'GET',
      }
    );
  }

  async cloneCampaign(
    uuid: string
  ): Promise<ApiResponse<CloneCampaignResponse>> {
    if (typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }

    const endpoint = config.endpoints.campaigns.clone.replace(
      ':uuid',
      encodeURIComponent(uuid.trim())
    );
    return this.request<CloneCampaignResponse>(endpoint, {
      method: 'POST',
    });
  }

  async listCampaignSmartTargetingTags(
    uuid: string,
    params: ListSmartTargetingTagsParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<ListSmartTargetingTagsResponse>> {
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }
    if (!Number.isInteger(params.page) || params.page < 1) {
      return this.createErrorResponse('INVALID_PAGE');
    }
    if (
      !Number.isInteger(params.page_size) ||
      params.page_size < 1 ||
      params.page_size > 100
    ) {
      return this.createErrorResponse('INVALID_PAGE_SIZE');
    }
    if (params.search && params.search.trim().length > 200) {
      return this.createErrorResponse('SMART_TARGETING_SEARCH_TOO_LONG');
    }

    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('page_size', String(params.page_size));
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.capacity !== undefined) {
      query.set('capacity', String(params.capacity));
    }
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_direction) {
      query.set('sort_direction', params.sort_direction);
    }

    const path = config.endpoints.campaigns.smartTargetingTags.replace(
      ':uuid',
      encodeURIComponent(uuid.trim())
    );

    return this.request<ListSmartTargetingTagsResponse>(
      `${path}?${query.toString()}`,
      { method: 'GET', signal }
    );
  }

  async listBundleSmartTargetingTags(
    bundleId: number,
    params: ListSmartTargetingTagsParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<ListSmartTargetingTagsResponse>> {
    if (!Number.isInteger(bundleId) || bundleId <= 0) {
      return this.createErrorResponse('INVALID_BUNDLE_ID');
    }
    if (!Number.isInteger(params.page) || params.page < 1) {
      return this.createErrorResponse('INVALID_PAGE');
    }
    if (
      !Number.isInteger(params.page_size) ||
      params.page_size < 1 ||
      params.page_size > 100
    ) {
      return this.createErrorResponse('INVALID_PAGE_SIZE');
    }
    if (params.search && params.search.trim().length > 200) {
      return this.createErrorResponse('SMART_TARGETING_SEARCH_TOO_LONG');
    }

    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('page_size', String(params.page_size));
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.capacity !== undefined) {
      query.set('capacity', String(params.capacity));
    }
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_direction) {
      query.set('sort_direction', params.sort_direction);
    }

    const path = config.endpoints.bundles.smartTargetingTags.replace(
      ':id',
      encodeURIComponent(String(bundleId))
    );

    return this.request<ListSmartTargetingTagsResponse>(
      `${path}?${query.toString()}`,
      { method: 'GET', signal }
    );
  }

  async getCampaignSmartTargetingSelection(
    uuid: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<SmartTargetingSelectionResponse>> {
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }

    const endpoint = config.endpoints.campaigns.smartTargetingSelection.replace(
      ':uuid',
      encodeURIComponent(uuid.trim())
    );

    return this.request<SmartTargetingSelectionResponse>(endpoint, {
      method: 'GET',
      signal,
    });
  }

  async replaceCampaignSmartTargetingSelection(
    uuid: string,
    payload: ReplaceSmartTargetingSelectionRequest,
    signal?: AbortSignal
  ): Promise<ApiResponse<SmartTargetingSelectionResponse>> {
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }
    const tagIds = Array.isArray(payload?.tag_ids)
      ? payload.tag_ids.filter(id => Number.isInteger(id) && id > 0)
      : [];
    if (
      tagIds.length > 10000 ||
      tagIds.length !== payload.tag_ids.length ||
      new Set(tagIds).size !== tagIds.length
    ) {
      return this.createErrorResponse(
        'SMART_TARGETING_SELECTION_INVALID',
        'SMART_TARGETING_SELECTION_INVALID'
      );
    }

    const endpoint = config.endpoints.campaigns.smartTargetingSelection.replace(
      ':uuid',
      encodeURIComponent(uuid.trim())
    );

    return this.request<SmartTargetingSelectionResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ tag_ids: tagIds }),
      signal,
    });
  }

  async autoSelectCampaignSmartTargetingTags(
    uuid: string,
    payload: AutoSelectSmartTargetingTagsRequest,
    signal?: AbortSignal
  ): Promise<ApiResponse<SmartTargetingSelectionResponse>> {
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }
    if (
      !Number.isInteger(payload.count) ||
      payload.count < 1 ||
      payload.count > 10000 ||
      (payload.search?.trim().length ?? 0) > 200
    ) {
      return this.createErrorResponse(
        'SMART_TARGETING_AUTO_SELECT_INVALID',
        'SMART_TARGETING_AUTO_SELECT_INVALID'
      );
    }

    const endpoint =
      config.endpoints.campaigns.smartTargetingAutoSelect.replace(
        ':uuid',
        encodeURIComponent(uuid.trim())
      );

    return this.request<SmartTargetingSelectionResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        count: payload.count,
        ...(payload.search?.trim() ? { search: payload.search.trim() } : {}),
        ...(payload.capacity !== undefined
          ? { capacity: payload.capacity }
          : {}),
        ...(payload.sort_by ? { sort_by: payload.sort_by } : {}),
        ...(payload.sort_direction
          ? { sort_direction: payload.sort_direction }
          : {}),
      }),
      signal,
    });
  }

  async startSmartTargetingCapacityCalculation(
    uuid: string,
    payload: StartSmartTargetingCapacityCalculationRequest = {},
    signal?: AbortSignal
  ): Promise<ApiResponse<SmartTargetingCapacityCalculationResponse>> {
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }

    const scoreClasses = Array.isArray(payload.score_classes)
      ? Array.from(
          new Set(
            payload.score_classes.map(value =>
              typeof value === 'string' ? value.toUpperCase() : value
            )
          )
        )
      : [];
    if (
      scoreClasses.length > 3 ||
      scoreClasses.some(value => !['A', 'B', 'C'].includes(value))
    ) {
      return this.createErrorResponse('SMART_TARGETING_SCORE_CLASSES_INVALID');
    }

    const endpoint =
      config.endpoints.campaigns.smartTargetingCapacityCalculations.replace(
        ':uuid',
        encodeURIComponent(uuid.trim())
      );

    return this.request<SmartTargetingCapacityCalculationResponse>(endpoint, {
      method: 'POST',
      // The backend interprets an omitted field as "reuse persisted grades".
      // The UI interprets no checked class as all classes, so make that intent
      // explicit and independent of older Campaign state.
      body: JSON.stringify({
        score_classes: scoreClasses.length > 0 ? scoreClasses : ['A', 'B', 'C'],
      }),
      signal,
    });
  }

  async getCurrentSmartTargetingCapacityCalculation(
    uuid: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<SmartTargetingCapacityCalculationResponse>> {
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }

    const endpoint =
      config.endpoints.campaigns.smartTargetingCapacityCalculations.replace(
        ':uuid',
        encodeURIComponent(uuid.trim())
      );
    return this.request<SmartTargetingCapacityCalculationResponse>(endpoint, {
      method: 'GET',
      signal,
    });
  }

  async getSmartTargetingCapacityCalculationById(
    uuid: string,
    calculationId: number,
    signal?: AbortSignal
  ): Promise<ApiResponse<SmartTargetingCapacityCalculationResponse>> {
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }
    if (!Number.isSafeInteger(calculationId) || calculationId < 1) {
      return this.createErrorResponse('INVALID_CALCULATION_ID');
    }

    const endpoint =
      config.endpoints.campaigns.smartTargetingCapacityCalculationById
        .replace(':uuid', encodeURIComponent(uuid.trim()))
        .replace(':calculation_id', encodeURIComponent(String(calculationId)));
    return this.request<SmartTargetingCapacityCalculationResponse>(endpoint, {
      method: 'GET',
      signal,
    });
  }

  async startSmartTargetingTestSamplingCalculation(
    uuid: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<SmartTargetingTestSamplingCalculationResponse>> {
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }

    const endpoint =
      config.endpoints.campaigns.smartTargetingTestSamplingPreview.replace(
        ':uuid',
        encodeURIComponent(uuid.trim())
      );
    return this.request<SmartTargetingTestSamplingCalculationResponse>(
      endpoint,
      {
        method: 'POST',
        signal,
      }
    );
  }

  async getCurrentSmartTargetingTestSamplingCalculation(
    uuid: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<SmartTargetingTestSamplingCalculationResponse>> {
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }

    const endpoint =
      config.endpoints.campaigns.smartTargetingTestSamplingPreview.replace(
        ':uuid',
        encodeURIComponent(uuid.trim())
      );
    return this.request<SmartTargetingTestSamplingCalculationResponse>(
      endpoint,
      {
        method: 'GET',
        cache: 'no-store',
        signal,
      }
    );
  }

  async getSmartTargetingTestSamplingCalculationById(
    uuid: string,
    calculationId: number,
    signal?: AbortSignal
  ): Promise<ApiResponse<SmartTargetingTestSamplingCalculationResponse>> {
    if (!uuid || typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }
    if (!Number.isSafeInteger(calculationId) || calculationId < 1) {
      return this.createErrorResponse('INVALID_CALCULATION_ID');
    }

    const endpoint =
      config.endpoints.campaigns.smartTargetingTestSamplingPreviewById
        .replace(':uuid', encodeURIComponent(uuid.trim()))
        .replace(':calculation_id', encodeURIComponent(String(calculationId)));
    return this.request<SmartTargetingTestSamplingCalculationResponse>(
      endpoint,
      {
        method: 'GET',
        cache: 'no-store',
        signal,
      }
    );
  }

  async hideCampaigns(
    payload: HideCampaignsRequest
  ): Promise<ApiResponse<HideCampaignsResponse>> {
    const campaignIds = Array.isArray(payload.campaign_ids)
      ? Array.from(
          new Set(
            payload.campaign_ids.filter(
              id => Number.isInteger(id) && Number.isFinite(id) && id > 0
            )
          )
        )
      : [];

    if (campaignIds.length === 0) {
      return this.createErrorResponse('VALIDATION_ERROR', 'VALIDATION_ERROR', [
        'At least one valid campaign ID is required',
      ]);
    }

    return this.request<HideCampaignsResponse>(
      config.endpoints.campaigns.hide,
      {
        method: 'POST',
        body: JSON.stringify({ campaign_ids: campaignIds }),
        timeoutMs: 30000,
      }
    );
  }

  async unhideCampaigns(
    payload: UnhideCampaignsRequest
  ): Promise<ApiResponse<UnhideCampaignsResponse>> {
    const campaignIds = Array.isArray(payload.campaign_ids)
      ? Array.from(
          new Set(
            payload.campaign_ids.filter(
              id => Number.isInteger(id) && Number.isFinite(id) && id > 0
            )
          )
        )
      : [];

    if (campaignIds.length === 0) {
      return this.createErrorResponse('VALIDATION_ERROR', 'VALIDATION_ERROR', [
        'At least one valid campaign ID is required',
      ]);
    }

    return this.request<UnhideCampaignsResponse>(
      config.endpoints.campaigns.unhide,
      {
        method: 'POST',
        body: JSON.stringify({ campaign_ids: campaignIds }),
        timeoutMs: 30000,
      }
    );
  }

  async exportCampaignReport(uuid: string): Promise<{
    success: boolean;
    message: string;
    blob?: Blob;
    filename?: string;
  }> {
    const endpoint = `/campaigns/${encodeURIComponent(uuid)}/export`;
    return this.requestBinary(endpoint);
  }

  async exportCampaignClickReport(uuid: string): Promise<{
    success: boolean;
    message: string;
    blob?: Blob;
    filename?: string;
  }> {
    const endpoint = `/campaigns/${encodeURIComponent(uuid)}/click-report`;
    return this.requestBinary(endpoint, {
      timeoutMs: 60000,
    });
  }

  async exportCampaignAudienceClickReport(
    campaignIds: number[]
  ): Promise<BinaryApiResponse> {
    const normalizedCampaignIds = Array.from(
      new Set(
        (Array.isArray(campaignIds) ? campaignIds : []).filter(
          id => Number.isInteger(id) && Number.isFinite(id) && id > 0
        )
      )
    );

    if (normalizedCampaignIds.length === 0) {
      return { success: false, message: 'CAMPAIGN_IDS_REQUIRED' };
    }

    return this.requestBinary('/campaigns/audience-click-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campaign_ids: normalizedCampaignIds }),
      timeoutMs: 130000,
      expectedContentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  async calculateCampaignCapacity(
    capacityData: CalculateCampaignCapacityRequest
  ): Promise<ApiResponse<CalculateCampaignCapacityResponse>> {
    return this.request<CalculateCampaignCapacityResponse>(
      config.endpoints.campaigns.calculateCapacity,
      {
        method: 'POST',
        body: JSON.stringify(capacityData),
      }
    );
  }

  // New campaign cost calculation endpoint for message count
  async calculateCampaignCost(
    costData: CalculateCampaignCostRequest
  ): Promise<ApiResponse<CalculateCampaignCostResponse>> {
    return this.request<CalculateCampaignCostResponse>(
      config.endpoints.campaigns.calculateCost,
      {
        method: 'POST',
        body: JSON.stringify(costData),
      }
    );
  }

  async calculateCampaignCostV2(
    costData: CalculateCampaignCostV2Request
  ): Promise<ApiResponse<CalculateCampaignCostResponse>> {
    return this.request<CalculateCampaignCostResponse>(
      config.endpoints.campaigns.calculateCostV2,
      {
        method: 'POST',
        body: JSON.stringify(costData),
      }
    );
  }

  // Wallet balance endpoint
  async getWalletBalance(): Promise<ApiResponse<GetWalletBalanceResponse>> {
    return this.request<GetWalletBalanceResponse>(
      config.endpoints.wallet.balance,
      {
        method: 'GET',
      }
    );
  }

  // Start wallet charge to obtain Atipay token
  async startWalletCharge(
    amount: number,
    lang?: string
  ): Promise<ApiResponse<{ token: string }>> {
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return {
        success: false,
        message: 'Invalid amount',
        error: { code: 'Invalid amount', details: null },
      };
    }
    return this.request<{ token: string }>(`/payments/charge-wallet`, {
      method: 'POST',
      body: JSON.stringify({ amount, ...(lang ? { lang } : {}) }),
    });
  }

  async submitDepositReceipt(
    payload: SubmitDepositReceiptRequest
  ): Promise<ApiResponse<SubmitDepositReceiptResponse>> {
    return this.request<SubmitDepositReceiptResponse>(
      `/payments/deposit-receipts`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  async listDepositReceipts(
    lang?: string
  ): Promise<ApiResponse<ListDepositReceiptsResponse>> {
    const query = lang ? `?lang=${encodeURIComponent(lang)}` : '';
    return this.request<ListDepositReceiptsResponse>(
      `/payments/deposit-receipts${query}`,
      {
        method: 'GET',
      }
    );
  }

  async previewProformaInvoice(
    receiptUuid: string,
    lang?: string
  ): Promise<ApiResponse<ProformaPreviewResponse>> {
    const params = new URLSearchParams();
    params.set('receipt_uuid', receiptUuid);
    if (lang) params.set('lang', lang);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<ProformaPreviewResponse>(
      `/payments/proforma/preview${query}`,
      {
        method: 'GET',
      }
    );
  }

  async previewProformaInvoiceByAmount(
    amountWithTax: number,
    lang?: string
  ): Promise<ApiResponse<ProformaPreviewResponse>> {
    const params = new URLSearchParams();
    params.set('amount', String(amountWithTax));
    if (lang) params.set('lang', lang);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<ProformaPreviewResponse>(
      `/payments/proforma/preview-by-amount${query}`,
      { method: 'GET' }
    );
  }

  async downloadDepositReceiptFile(receiptUuid: string): Promise<{
    success: boolean;
    message: string;
    blob?: Blob;
    filename?: string;
  }> {
    const endpoint = `/payments/deposit-receipts/${encodeURIComponent(receiptUuid)}/file`;
    return this.requestBinary(endpoint);
  }

  async updateDepositReceiptFile(
    receiptUuid: string,
    payload: UpdateDepositReceiptFileRequest
  ): Promise<ApiResponse<{ ok: boolean }>> {
    const endpoint = `/payments/deposit-receipts/${encodeURIComponent(receiptUuid)}/file`;
    return this.request<{ ok: boolean }>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteDepositReceiptFile(
    receiptUuid: string
  ): Promise<ApiResponse<{ ok: boolean }>> {
    const endpoint = `/payments/deposit-receipts/${encodeURIComponent(receiptUuid)}/file`;
    return this.request<{ ok: boolean }>(endpoint, {
      method: 'DELETE',
    });
  }

  // Payments endpoints
  async getPaymentHistory(
    params: GetTransactionHistoryParams = {}
  ): Promise<ApiResponse<TransactionHistoryResponse>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.page_size) query.set('page_size', String(params.page_size));
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.type) query.set('type', params.type);
    if (params.status) query.set('status', params.status);
    const endpoint = `/payments/history${query.toString() ? `?${query.toString()}` : ''}`;
    return this.request<TransactionHistoryResponse>(endpoint, {
      method: 'GET',
    });
  }

  async notifyInvoiceIssueRequest(
    payload: NotifyInvoiceIssueRequest
  ): Promise<ApiResponse<NotifyInvoiceIssueResponse>> {
    if (!payload?.transaction_uuid) {
      return {
        success: false,
        message: 'Transaction UUID is required',
        error: { code: 'INVALID_TRANSACTION_UUID', details: null },
      };
    }
    return this.request<NotifyInvoiceIssueResponse>(
      '/payments/transactions/invoice-issue-request',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  // Support endpoints
  async createSupportTicket(params: {
    title: string;
    content: string;
    file?: File | null;
  }): Promise<ApiResponse> {
    // Basic input validation
    const title = (params.title || '').trim();
    const content = (params.content || '').trim();
    if (!content) {
      return {
        success: false,
        message: 'Content is required',
        error: { code: 'Content is required', details: null },
      };
    }
    if (title.length > 80) {
      return {
        success: false,
        message: 'Title must be less than or equal to 80 characters',
        error: { code: 'Title too long', details: null },
      };
    }
    if (content.length > 1000) {
      return {
        success: false,
        message: 'Description must be at most 1000 characters',
        error: { code: 'Description too long', details: null },
      };
    }

    const form = new FormData();
    if (title) form.append('title', title);
    form.append('content', content);
    if (params.file) {
      form.append('file', params.file);
    }

    const url = getApiUrl('/tickets');
    if (!this.isValidUrl(url)) {
      return {
        success: false,
        message: 'Invalid URL',
        error: { code: 'Invalid URL', details: null },
      };
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: form,
        signal: AbortSignal.timeout(30000),
      });

      const contentType = resp.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return {
          success: false,
          message: 'Invalid response content type',
          error: { code: 'Invalid response content type', details: null },
        };
      }
      const data = await resp.json();

      if (resp.status === 201 || resp.ok) {
        return {
          success: true,
          message: data.message || 'Created successfully',
          data: data.data,
        };
      }

      const errorMessage =
        data?.error?.code || data?.message || `HTTP ${resp.status}`;
      return {
        success: false,
        message: errorMessage,
        error: { code: errorMessage, details: data?.error?.details },
      };
    } catch (e) {
      const msg = this.isProduction()
        ? 'An error occurred'
        : e instanceof Error
          ? e.message
          : 'Unknown error';
      return {
        success: false,
        message: msg,
        error: { code: msg, details: null },
      };
    }
  }

  async listSupportTickets(
    params: {
      title?: string;
      start_date?: string;
      end_date?: string;
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
          replied_by_admin?: boolean | null;
          attachments?: Array<string | { filename?: string; name?: string }>;
        }>;
      }>;
    }>
  > {
    const query = new URLSearchParams();
    if (params.title) query.set('title', params.title);
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.page) query.set('page', String(params.page));
    if (params.page_size) query.set('page_size', String(params.page_size));
    const endpoint = `/tickets${query.toString() ? `?${query.toString()}` : ''}`;
    return this.request(endpoint, { method: 'GET' });
  }

  async downloadTicketAttachment(
    ticketId: number,
    fileIndex: number
  ): Promise<ApiResponse<{ blob: Blob; filename?: string }>> {
    if (!ticketId || ticketId <= 0 || fileIndex < 0) {
      return {
        success: false,
        message: 'Invalid ticket id or file index',
        error: { code: 'INVALID_PARAMS', details: null },
      };
    }

    const endpoint = `/tickets/${ticketId}/attachments/${fileIndex}`;
    const url = getApiUrl(endpoint);
    if (!this.isValidUrl(url)) {
      return {
        success: false,
        message: 'Invalid URL',
        error: { code: 'Invalid URL', details: null },
      };
    }

    const headers: Record<string, string> = {
      Accept: 'application/octet-stream',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(30000),
      });

      if (resp.status === 401) {
        if (this.unauthorizedHandler) {
          this.unauthorizedHandler();
        }
        return {
          success: false,
          message: 'Unauthorized',
          error: { code: 'Unauthorized', details: null },
        };
      }

      if (resp.ok) {
        const disposition = resp.headers.get('content-disposition') || '';
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
        const filename = filenameMatch?.[1];
        const blob = await resp.blob();
        return {
          success: true,
          message: 'Downloaded',
          data: { blob, filename },
        };
      }

      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await resp.json();
        const errorMessage =
          data?.error?.code || data?.message || `HTTP ${resp.status}`;
        return {
          success: false,
          message: errorMessage,
          error: { code: errorMessage, details: data?.error?.details },
        };
      }

      return {
        success: false,
        message: `HTTP ${resp.status}`,
        error: { code: `HTTP ${resp.status}`, details: null },
      };
    } catch (e) {
      const msg = this.isProduction()
        ? 'An error occurred'
        : e instanceof Error
          ? e.message
          : 'Unknown error';
      return {
        success: false,
        message: msg,
        error: { code: msg, details: null },
      };
    }
  }

  // Create ticket reply (customer response to existing ticket)
  async createTicketReply(params: {
    ticket_id: number;
    content: string;
    file?: File | null;
  }): Promise<ApiResponse> {
    // Basic input validation
    const content = (params.content || '').trim();
    if (!content) {
      return {
        success: false,
        message: 'Content is required',
        error: { code: 'Content is required', details: null },
      };
    }
    if (content.length > 1000) {
      return {
        success: false,
        message: 'Content must be at most 1000 characters',
        error: { code: 'Content too long', details: null },
      };
    }
    if (!params.ticket_id || params.ticket_id <= 0) {
      return {
        success: false,
        message: 'Valid ticket ID is required',
        error: { code: 'Invalid ticket ID', details: null },
      };
    }

    const form = new FormData();
    form.append('ticket_id', String(params.ticket_id));
    form.append('content', content);
    if (params.file) {
      form.append('file', params.file);
    }

    const url = getApiUrl('/tickets/reply');
    if (!this.isValidUrl(url)) {
      return {
        success: false,
        message: 'Invalid URL',
        error: { code: 'Invalid URL', details: null },
      };
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: form,
        signal: AbortSignal.timeout(30000),
      });

      const contentType = resp.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return {
          success: false,
          message: 'Invalid response content type',
          error: { code: 'Invalid response content type', details: null },
        };
      }
      const data = await resp.json();

      // Handle 401 unauthorized
      if (resp.status === 401) {
        if (this.unauthorizedHandler) {
          this.unauthorizedHandler();
        }
        const errorMessage =
          data?.error?.code || data?.message || 'Unauthorized';
        return {
          success: false,
          message: errorMessage,
          error: { code: errorMessage, details: data?.error?.details },
        };
      }

      if (resp.status === 201 || resp.ok) {
        return {
          success: true,
          message: data.message || 'Reply created successfully',
          data: data.data,
        };
      }

      const errorMessage =
        data?.error?.code || data?.message || `HTTP ${resp.status}`;
      return {
        success: false,
        message: errorMessage,
        error: { code: errorMessage, details: data?.error?.details },
      };
    } catch (e) {
      const msg = this.isProduction()
        ? 'An error occurred'
        : e instanceof Error
          ? e.message
          : 'Unknown error';
      return {
        success: false,
        message: msg,
        error: { code: msg, details: null },
      };
    }
  }

  // Update campaign endpoint
  async updateCampaign(
    uuid: string,
    campaignData: UpdateSMSCampaignRequest,
    signal?: AbortSignal
  ): Promise<ApiResponse<UpdateSMSCampaignResponse>> {
    if (typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }

    const url = config.endpoints.campaigns.update.replace(
      ':uuid',
      encodeURIComponent(uuid.trim())
    );
    return this.request<UpdateSMSCampaignResponse>(url, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
      timeoutMs: 60000,
      signal,
    });
  }

  async sendCampaignTestMessage(
    uuid: string,
    payload: SendCampaignTestMessageRequest
  ): Promise<ApiResponse<SendCampaignTestMessageResponse>> {
    if (typeof uuid !== 'string' || !uuid.trim()) {
      return this.createErrorResponse('INVALID_CAMPAIGN_UUID');
    }

    const endpoint = config.endpoints.campaigns.testSend.replace(
      ':uuid',
      encodeURIComponent(uuid.trim())
    );
    return this.request<SendCampaignTestMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Analytics endpoints
  async getDashboardData(): Promise<ApiResponse> {
    return this.request(config.endpoints.analytics.dashboard, {
      method: 'GET',
    });
  }

  // Campaigns summary endpoint
  async getCampaignsSummary(): Promise<
    ApiResponse<{
      approved_count: number;
      running_count: number;
      total: number;
    }>
  > {
    return this.request<{
      approved_count: number;
      running_count: number;
      total: number;
    }>('/campaigns/summary', { method: 'GET' });
  }

  async getPlatformBasePrices(): Promise<
    ApiResponse<ListPlatformBasePricesResponse>
  > {
    return this.request<ListPlatformBasePricesResponse>(
      '/platform-base-prices',
      {
        method: 'GET',
      }
    );
  }

  async getPagePrices(): Promise<ApiResponse<GetPagePricesResponse>> {
    return this.request<GetPagePricesResponse>('/campaigns/page-prices', {
      method: 'GET',
    });
  }

  async getReports(): Promise<ApiResponse> {
    return this.request(config.endpoints.analytics.reports, {
      method: 'GET',
    });
  }

  // Agency report: customers
  async getAgencyCustomerReport(
    params: {
      start_date?: string;
      end_date?: string;
      orderby?: string;
      name?: string;
    } = {}
  ): Promise<ApiResponse<AgencyCustomerReportResponse>> {
    const query = new URLSearchParams();
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.orderby) query.set('orderby', params.orderby);
    if (params.name) query.set('name', params.name);
    const endpoint = `/reports/agency/customers${query.toString() ? `?${query.toString()}` : ''}`;
    return this.request<AgencyCustomerReportResponse>(endpoint, {
      method: 'GET',
    });
  }

  // Agency active discounts
  async listAgencyActiveDiscounts(
    params: { name?: string } = {}
  ): Promise<ApiResponse<ListAgencyActiveDiscountsResponse>> {
    const query = new URLSearchParams();
    if (params.name) query.set('name', params.name);
    const endpoint = `/reports/agency/discounts/active${query.toString() ? `?${query.toString()}` : ''}`;
    return this.request<ListAgencyActiveDiscountsResponse>(endpoint, {
      method: 'GET',
    });
  }

  // Agency customer discount history
  async listAgencyCustomerDiscounts(
    customerId: number
  ): Promise<ApiResponse<ListAgencyCustomerDiscountsResponse>> {
    if (!customerId || customerId <= 0) {
      return {
        success: false,
        message: 'Invalid customer id',
        error: { code: 'Invalid customer id', details: null },
      };
    }
    const endpoint = `/reports/agency/customers/${customerId}/discounts`;
    return this.request<ListAgencyCustomerDiscountsResponse>(endpoint, {
      method: 'GET',
    });
  }

  // List agency customers
  async listAgencyCustomers(): Promise<
    ApiResponse<ListAgencyCustomersResponse>
  > {
    return this.request<ListAgencyCustomersResponse>(
      `/reports/agency/customers/list`,
      { method: 'GET' }
    );
  }

  // Create agency discount
  async createAgencyDiscount(payload: {
    customer_id: number;
    name: string;
    discount_rate: number;
  }): Promise<ApiResponse> {
    if (!payload || typeof payload !== 'object') {
      return {
        success: false,
        message: 'Invalid payload',
        error: { code: 'Invalid payload', details: null },
      };
    }
    const { customer_id, name, discount_rate } = payload;
    if ((!customer_id && customer_id !== 0) || !name?.trim()) {
      return {
        success: false,
        message: 'Missing required fields',
        error: { code: 'Missing required fields', details: null },
      };
    }
    // Discount rates are stored/sent as a normalized fraction: percent / (percent + 100)
    // Valid range therefore includes 0 and is always less than 1.
    if (
      !(
        Number.isFinite(discount_rate) &&
        discount_rate >= 0 &&
        discount_rate < 1
      )
    ) {
      return {
        success: false,
        message: 'Rate must be between 0 and 1',
        error: { code: 'DISCOUNT_RATE_OUT_OF_RANGE', details: null },
      };
    }
    return this.request(`/reports/agency/discounts`, {
      method: 'POST',
      body: JSON.stringify({ customer_id, name: name.trim(), discount_rate }),
    });
  }

  // Audience spec endpoint
  async listAudienceSpec(
    platform?: string
  ): Promise<ApiResponse<ListAudienceSpecResponse>> {
    const endpoint = platform
      ? `${config.endpoints.campaigns.audienceSpec}?platform=${encodeURIComponent(platform)}`
      : config.endpoints.campaigns.audienceSpec;
    return this.request<ListAudienceSpecResponse>(endpoint, { method: 'GET' });
  }

  // Active line numbers
  async listActiveLineNumbers(): Promise<
    ApiResponse<ListActiveLineNumbersResponse>
  > {
    return this.request<ListActiveLineNumbersResponse>(
      config.endpoints.lineNumbers.active,
      { method: 'GET' }
    );
  }

  // Segment price factors (latest per level3)
  async listLatestSegmentPriceFactors(
    platform?: string
  ): Promise<ApiResponse<ListLatestSegmentPriceFactorsResponse>> {
    const endpoint = platform
      ? `${config.endpoints.segmentPriceFactors.listLatest}?platform=${encodeURIComponent(platform)}`
      : config.endpoints.segmentPriceFactors.listLatest;
    return this.request<ListLatestSegmentPriceFactorsResponse>(endpoint, {
      method: 'GET',
    });
  }

  async uploadMultimedia(
    file: File
  ): Promise<ApiResponse<UploadMultimediaResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<UploadMultimediaResponse>(
      config.endpoints.media.upload,
      {
        method: 'POST',
        body: formData,
      }
    );
  }

  async downloadMultimedia(uuid: string): Promise<{
    success: boolean;
    message: string;
    blob?: Blob;
    filename?: string;
  }> {
    const endpoint = config.endpoints.media.download.replace(
      ':uuid',
      encodeURIComponent(uuid)
    );
    return this.requestBinary(endpoint);
  }

  async previewMultimedia(uuid: string): Promise<{
    success: boolean;
    message: string;
    blob?: Blob;
    filename?: string;
  }> {
    const endpoint = config.endpoints.media.preview.replace(
      ':uuid',
      encodeURIComponent(uuid)
    );
    return this.requestBinary(endpoint);
  }

  async listPlatformSettings(): Promise<
    ApiResponse<ListPlatformSettingsResponse>
  > {
    return this.request<ListPlatformSettingsResponse>(
      config.endpoints.platformSettings.list,
      { method: 'GET' }
    );
  }

  async createPlatformSettings(
    payload: CreatePlatformSettingsRequest
  ): Promise<ApiResponse<CreatePlatformSettingsResponse>> {
    return this.request<CreatePlatformSettingsResponse>(
      config.endpoints.platformSettings.create,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  // Utility methods
  getConfig() {
    return config;
  }

  isProduction() {
    return isProduction();
  }

  isDevelopment() {
    return isDevelopment();
  }

  isStaging() {
    return false; // No staging environment in current setup
  }
}

export const apiService = new ApiService();
export default apiService;
