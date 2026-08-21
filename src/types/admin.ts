// Admin-specific types

export interface AdminShortLinkUploadJobDTO {
  id: string;
  scenario_id: number;
  status: string;
  total_rows: number;
  created: number;
  skipped: number;
  published: number;
  attempts: number;
  next_attempt_at?: string | null;
  last_error?: string | null;
}

export interface AdminCreateShortLinksResponse {
  message: string;
  total_rows: number;
  created: number;
  skipped: number;
  scenario_id: number;
  job: AdminShortLinkUploadJobDTO;
}

export interface AdminDTO {
  id: number;
  uuid: string;
  username: string;
  is_active?: boolean | null;
  created_at: string;
}

export interface AdminSessionDTO {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string; // e.g., "Bearer"
  created_at: string;
}

export interface AdminCaptchaInitResponse {
  challenge_id: string;
  master_image_base64: string;
  thumb_image_base64: string;
}

export interface AdminCaptchaVerifyRequest {
  challenge_id: string;
  username: string;
  password: string;
  user_angle: number;
}

export interface AdminLoginInitResponse {
  message: string;
  challenge_id: string;
  masked_phone: string;
  otp_sent: boolean;
  already_sent: boolean;
  otp_expires_at: string | null;
  requires_two_factor: boolean;
}

export interface AdminLoginVerifyOTPRequest {
  challenge_id: string;
  otp_code: string;
}

export interface AdminLoginVerifyOTPResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  admin: AdminDTO;
}

export type AdminLoginResponse =
  | AdminLoginInitResponse
  | AdminLoginVerifyOTPResponse;

// Line Numbers
export interface AdminCreateLineNumberRequest {
  name?: string | null;
  line_number: string;
  price_factor: number;
  priority?: number | null;
  is_active?: boolean | null;
}

export interface AdminLineNumberDTO {
  id: number;
  uuid: string;
  name?: string | null;
  line_number: string;
  price_factor: number;
  priority?: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

// Batch update
export interface AdminUpdateLineNumberItem {
  id: number;
  priority?: number | null;
  is_active?: boolean | null;
}

export interface AdminUpdateLineNumbersRequest {
  items: AdminUpdateLineNumberItem[];
}

// Report
export interface AdminLineNumberReportItem {
  line_number: string;
  total_sent: number;
  total_parts_sent: number;
  total_arrived_parts_sent: number;
  total_non_arrived_parts_sent: number;
  total_income: number;
  total_cost: number;
}

export interface AdminListCampaignsFilter {
  title?: string;
  status?:
    | 'initiated'
    | 'in-progress'
    | 'waiting-for-approval'
    | 'approved'
    | 'rejected'
    | 'running'
    | 'executed'
    | 'expired'
    | 'cancelled'
    | 'cancelled-by-admin';
  start_date?: string; // RFC3339 string
  end_date?: string; // RFC3339 string
  page?: number;
  limit?: number;
}

export interface AdminGetCampaignResponse {
  id: number;
  campaign_id?: number | null;
  uuid: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
  hidden?: boolean;
  title?: string | null;
  level1?: string | null;
  level2s?: string[];
  level3s?: string[];
  tags?: string[];
  sex?: string | null;
  city?: string[];
  adlink?: string | null;
  content?: string | null;
  short_link_domain?: string | null;
  job_category?: string | null;
  job?: string | null;
  scheduleat?: string | null;
  line_number?: string | null;
  media_uuid?: string | null;
  platform_settings_id?: number | null;
  platform: string;
  platform_base_price?: number | null;
  budget?: number | null;
  comment?: string | null;
  segment_price_factor?: number;
  line_number_price_factor?: number;
  statistics?: Record<string, any>;
  total_sent?: number | null;
  total_delivered?: number | null;
  total_clicks?: number | null;
  click_rate?: number | null;
  num_audience?: number | null;
  customer_full_name?: string | null;
  agency_full_name?: string | null;
  target_audience_excel_file_uuid?: string | null;
  platform_settings_name?: string | null;
  bundle_id?: number | null;
  bundle_title?: string | null;
  phase?: string | null;
  sample_size_per_tag?: number | null;
}

export interface AdminPaginationInfo {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface AdminListCampaignsResponse {
  message: string;
  items: AdminGetCampaignResponse[];
  pagination?: AdminPaginationInfo;
}

// Admin approve/reject responses
export interface AdminApproveCampaignResponse {
  message: string;
}

export interface AdminRejectCampaignResponse {
  message: string;
}

export interface AdminCancelCampaignRequest {
  campaign_id: number;
  comment: string;
}

export interface AdminCancelCampaignResponse {
  message: string;
}

export interface AdminRescheduleCampaignRequest {
  campaign_id: number;
  schedule_at: string; // RFC3339 UTC (+00:00)
}

export interface AdminRescheduleCampaignResponse {
  message: string;
}

// Admin Segment Price Factors
export interface AdminCreateSegmentPriceFactorRequest {
  platform: AdminPlatformKey;
  level3: string;
  price_factor: number;
}

export interface AdminCreateSegmentPriceFactorResponse {
  message: string;
}

export interface AdminSegmentPriceFactorItem {
  platform: AdminPlatformKey;
  level3: string;
  price_factor: number;
  created_at: string;
}

export interface AdminListSegmentPriceFactorsResponse {
  message: string;
  items: AdminSegmentPriceFactorItem[];
}

export interface AdminListLevel3OptionsResponse {
  message: string;
  items: string[];
}

// Admin Customer Management - Customers Shares
export interface AdminCustomersSharesRequest {
  start_date?: string; // RFC3339
  end_date?: string; // RFC3339
}

export interface AdminCustomersSharesItem {
  first_name: string;
  last_name: string;
  full_name: string;
  company_name: string;
  referrer_agency_name: string;
  agency_share_with_tax: number; // uint64
  system_share: number; // uint64
  tax_share: number; // uint64
  total_sent: number; // uint64
  click_rate: number;
  customer_id?: number; // optional numeric id if available
  account_type_name: string;
  is_active?: boolean | null;
}

export interface AdminCustomersSharesResponse {
  message: string;
  items: AdminCustomersSharesItem[];
  sum_agency_share_with_tax: number;
  sum_system_share: number;
  sum_tax_share: number;
  sum_total_sent: number;
}

// Admin Customer Details with Campaigns
export interface AdminCustomerDetailDTO {
  id: number;
  uuid: string;
  agency_referer_code: string;
  account_type_id: number;
  account_type_name: string;
  company_name?: string | null;
  national_id?: string | null;
  company_phone?: string | null;
  company_address?: string | null;
  postal_code?: string | null;
  representative_first_name: string;
  representative_last_name: string;
  representative_mobile: string;
  email: string;
  sheba_number?: string | null;
  referrer_agency_id?: number | null;
  is_email_verified?: boolean | null;
  is_mobile_verified?: boolean | null;
  is_active?: boolean | null;
  created_at: string; // ISO
  updated_at?: string | null; // ISO
  email_verified_at?: string | null; // ISO
  mobile_verified_at?: string | null; // ISO
  last_login_at?: string | null; // ISO
}

export interface AdminCustomerCampaignItem {
  id: number;
  campaign_id?: number | null;
  uuid: string;
  status: string;
  created_at: string; // ISO
  updated_at?: string | null; // ISO
  title?: string | null;
  level1?: string | null;
  level2s?: string[] | null;
  level3s?: string[] | null;
  tags?: string[] | null;
  sex?: string | null;
  city?: string[] | null;
  adlink?: string | null;
  content?: string | null;
  short_link_domain?: string | null;
  job_category?: string | null;
  job?: string | null;
  scheduleat?: string | null; // ISO
  line_number?: string | null;
  media_uuid?: string | null;
  platform_settings_id?: number | null;
  platform: string;
  budget?: number | null;
  comment?: string | null;
  segment_price_factor?: number | null;
  line_number_price_factor?: number | null;
  statistics?: Record<string, any> | null;
  total_sent?: number | null;
  total_delivered?: number | null;
  total_clicks?: number | null;
  click_rate: number;
  num_audience?: number | null;
  customer_full_name?: string | null;
  agency_full_name?: string | null;
  target_audience_excel_file_uuid?: string | null;
  sample_size_per_tag?: number | null;
}

export interface AdminCustomerWithCampaignsResponse {
  message: string;
  customer: AdminCustomerDetailDTO;
  campaigns: AdminCustomerCampaignItem[];
}

// Ticket Management
export interface TicketItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  replied_by_admin?: boolean | null;
  // Admin-only fields (populated in admin listings only)
  customer_first_name?: string;
  customer_last_name?: string;
  company_name?: string;
  phone_number?: string;
  agency_name?: string;
}

export interface TicketGroup {
  correlation_id: string;
  items: TicketItem[];
}

export interface ListTicketsResponse {
  message: string;
  groups: TicketGroup[];
}

export interface AdminCreateResponseTicketRequest {
  ticket_id: number;
  content: string;
  file?: File;
}

export interface AdminCreateResponseTicketResponse {
  message: string;
  id: number;
  uuid: string;
  correlation_id: string;
  created_at: string;
}

// Admin Customer Discounts History
export interface AdminCustomerDiscountHistoryItem {
  discount_rate: number;
  created_at: string;
  expires_at?: string | null;
  total_sent: number;
  agency_share_with_tax: number;
}

export interface AdminCustomerDiscountHistoryResponse {
  message: string;
  items: AdminCustomerDiscountHistoryItem[];
}

// Admin Payments
export interface AdminChargeWalletRequest {
  customer_id: number;
  amount_with_tax: number;
  admin_note: string;
  idempotency_key?: string;
}

export interface AdminChargeWalletResponse {
  message: string;
  success: boolean;
  payment_request_id: number;
  invoice_number: string;
  reference_number: string;
  customer_id: number;
  admin_id: number;
  amount_with_tax: number;
}

export interface AdminPreviewWalletChargeImpactRequest {
  customer_id: number;
  amount_with_tax: number;
}

export interface AdminPreviewWalletChargeImpactResponse {
  message: string;
  success: boolean;
  customer_id: number;
  agency_id: number;
  agency_discount_id: number;
  discount_rate: number;
  amount_with_tax: number;
  amount: number;
  tax: number;
  free_increase: number;
  credit_increase: number;
  agency_share_with_tax: number;
  system_share_with_tax: number;
}

export interface AdminListCustomersResponse {
  message: string;
  items: AdminCustomerDetailDTO[];
  total: number;
}

// Admin Set Customer Active Status
export interface AdminSetCustomerActiveStatusRequest {
  customer_id: number;
  is_active: boolean;
}

export interface AdminSetCustomerActiveStatusResponse {
  message: string;
  is_active: boolean;
}

// Admin Platform Settings
export type AdminPlatformKey = 'rubika' | 'bale' | 'splus' | 'sms' | string;
export type AdminPlatformSettingsStatus =
  | 'initialized'
  | 'in-progress'
  | 'active'
  | 'inactive'
  | string;

export interface AdminPlatformSettingsItem {
  id: number;
  uuid: string;
  customer_id: number;
  platform: AdminPlatformKey;
  name?: string | null;
  description?: string | null;
  website?: string | null;
  multimedia_uuid?: string | null;
  business_license_uuid?: string | null;
  metadata?: Record<string, any> | null;
  status: AdminPlatformSettingsStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminListPlatformSettingsResponse {
  message: string;
  items: AdminPlatformSettingsItem[];
}

export interface AdminChangePlatformSettingsStatusRequest {
  id: number;
  status: 'in-progress' | 'active' | 'inactive';
}

export interface AdminChangePlatformSettingsStatusResponse {
  message: string;
  id: number;
  status: 'in-progress' | 'active' | 'inactive';
}

export interface AdminAddPlatformSettingsMetadataRequest {
  id: number;
  key: string;
  value: string;
}

export interface AdminAddPlatformSettingsMetadataResponse {
  message: string;
  id: number;
  metadata: Record<string, any>;
}

// Admin Platform Base Prices
export interface AdminUpdatePlatformBasePriceRequest {
  platform: 'sms' | 'rubika' | 'bale' | 'splus';
  price: number;
}

export interface AdminUpdatePlatformBasePriceResponse {
  message: string;
  platform: string;
  price: number;
}

export interface AdminPlatformBasePriceItem {
  platform: string;
  price: number;
}

export interface AdminListPlatformBasePricesResponse {
  message: string;
  items: AdminPlatformBasePriceItem[];
}

// Admin Campaign Page Prices
export interface AdminUpdatePagePriceRequest {
  platform: 'sms' | 'rubika' | 'bale' | 'splus';
  price: number;
}

export interface AdminUpdatePagePriceResponse {
  message: string;
  platform: string;
  price: number;
  created_at?: string;
}

export interface AdminPagePriceItem {
  platform: string;
  price: number;
  created_at?: string;
}

export interface AdminGetPagePricesResponse {
  message: string;
  items: AdminPagePriceItem[];
}
