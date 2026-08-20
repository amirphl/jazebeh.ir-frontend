// Campaign Types and Interfaces

export type AudienceGrade = 'A' | 'B' | 'C';
export type AudienceTargetingMethod = 'standard' | 'smart_targeting' | 'excel';
export type CampaignPhase = 'test' | 'execution';
export type SmartTargetingExecutionReservationPhase =
  | 'idle'
  | 'saving'
  | 'requesting'
  | 'polling'
  | 'ready'
  | 'committing'
  | 'failed';
export type SmartTargetingSortBy =
  | 'tag_capacity'
  | 'bundle_persona_fit_score'
  | 'test_phase_avg_ctr'
  | 'overall_avg_ctr';
export type SmartTargetingSortDirection = 'asc' | 'desc';

export interface CampaignSegment {
  campaignTitle: string;
  level1: string; // Level 1 selection (single)
  level2s: string[]; // Level 2 selections (multiple)
  level3s: string[]; // Level 3 selections (multiple)
  targetAudienceExcelFileUuid?: string | null; // Excel segmentation upload UUID
  platform: CampaignPlatform;
  tags?: string[]; // Union of tags from selected level3s
  audienceTargetingMethod?: AudienceTargetingMethod;
  selectedTagIds?: number[]; // Campaign-level Smart Targeting tag IDs
  smartTargetingSelectedRawCapacity?: number;
  smartTargetingSelectionDirty?: boolean;
  smartTargetingScoreClasses?: AudienceGrade[];
  smartTargetingScoreClassesDirty?: boolean;
  smartTargetingTestSamplingInputsDirty?: boolean;
  smartTargetingCapacityCalculation?: SmartTargetingCapacityCalculationResponse | null;
  smartTargetingExactCapacityInputKey?: string | null;
  /** A current result is insufficient until a user starts a new calculation. */
  smartTargetingExactCapacityForceFreshCalculation?: boolean;
  smartTargetingExactCapacityInvalidatedCalculationId?: number | null;
  /** The calculation started by the user after a forced recalculation. */
  smartTargetingExactCapacityFreshCalculationId?: number | null;
  smartTargetingExecutionReservation?: SmartTargetingExecutionReservation | null;
  smartTargetingExactCapacityRequired?: boolean;
  smartTargetingSortBy?: SmartTargetingSortBy | '';
  smartTargetingSortDirection?: SmartTargetingSortDirection;
  smartTargetingSelectionOrderPending?: boolean;
  sampleSizePerTag?: number;
  smartTargetingTestPreview?: SmartTargetingTestSamplingPreviewResponse | null;
  smartTargetingTestPreviewInputKey?: string | null;
  smartTargetingTestPreviewStale?: boolean;
  capacityTooLow?: boolean;
  capacity?: number; // Total audience capacity (calculated from the audience spec)
  audienceGrades?: AudienceGrade[]; // Selected audience quality grades
  sex?: string;
  city?: string[];
  jobCategory?: string;
  job?: string;
  bundleId?: number | null;
  phase?: CampaignPhase;
}

export interface CustomFilter {
  field: string;
  operator: string;
  value: string;
}

export interface CampaignContent {
  insertLink: boolean;
  link: string;
  text: string;
  scheduleAt?: string; // ISO string for datetime
  shortLinkDomain: string | null;
  lineNumber?: string;
  platformSettingsId?: number | null;
  mediaUuid?: string | null;
}

export interface CampaignBudget {
  totalBudget: number;
  estimatedMessages?: number; // Populated by backend, not stored in localStorage
}

export interface CampaignPayment {
  paymentMethod: string;
  termsAccepted: boolean;
  hasEnoughBalance?: boolean; // Track if user has sufficient wallet balance
  finalCost?: number; // Populated by API, not stored in localStorage
  total?: number; // Populated by API, not stored in localStorage
}

export interface CampaignData {
  id?: number;
  uuid: string;
  segment: CampaignSegment;
  content: CampaignContent;
  budget: CampaignBudget;
  payment: CampaignPayment;
}

export type CampaignPlatform = 'sms' | 'rubika' | 'bale' | 'splus';
export type CampaignMediaType = 'image' | 'video';

// API payload interface matching Go backend structure
export interface CreateCampaignPayload {
  title?: string;
  level1?: string; // Level 1 selection (single)
  level2s?: string[]; // Level 2 selections (multiple)
  level3s?: string[]; // Level 3 selections (multiple)
  target_audience_excel_file_uuid?: string | null;
  tags?: string[]; // Union of tags from selected level3s
  audience_targeting_method?: AudienceTargetingMethod;
  selected_tag_ids?: number[];
  sex?: string;
  city?: string[];
  adlink?: string;
  content?: string;
  scheduleat?: string;
  line_number?: string | null;
  budget?: number;
  short_link_domain?: string | null;
  job_category?: string;
  job?: string;
  platform?: CampaignPlatform;
  platform_settings_id?: number | null;
  media_uuid?: string | null;
  bundle_id?: number | null;
  phase?: CampaignPhase;
  audience_grades?: AudienceGrade[];
  sample_size_per_tag?: number;
}

// API response interface matching Go backend structure
export interface CreateSMSCampaignResponse {
  message: string;
  id: number;
  uuid: string;
  status: string;
  created_at: string;
}

export interface CloneCampaignResponse {
  message: string;
  id: number;
  uuid: string;
  status: string;
  created_at: string;
}

export interface GetLastInitiatedCampaignResponse {
  message?: string;
  item?: GetCampaignResponse;
}

// API response wrapper matching Go backend structure
export interface CreateCampaignResponse {
  success: boolean;
  message: string;
  data?: CreateSMSCampaignResponse;
  error?: any;
}

// Campaign capacity calculation request interface
export interface CalculateCampaignCapacityRequest {
  campaign_id: number;
}

// Campaign capacity calculation response interface
export interface CalculateCampaignCapacityResponse {
  message: string;
  capacity: number;
}

// Campaign cost calculation request interface
export interface CalculateCampaignCostRequest {
  budget?: number;
  campaign_id: number;
}

export interface CalculateCampaignCostV2Request {
  campaign_id: number;
  num_messages: number;
}

// Campaign cost calculation response interface
export interface CalculateCampaignCostResponse {
  message: string;
  total_cost: number;
  msg_target: number;
  max_msg_target?: number;
}

// Wallet balance response interface
export interface GetWalletBalanceResponse {
  message: string;
  free: number;
  locked: number;
  frozen: number;
  credit?: number;
  spent_on_campaigns?: number;
  agency_share_with_tax?: number;
  total: number;
  currency: string;
  last_updated: string;
}

// Update campaign request interface
export interface UpdateSMSCampaignRequest {
  title?: string;
  level1?: string; // Level 1 selection (single)
  level2s?: string[]; // Level 2 selections (multiple)
  level3s?: string[]; // Level 3 selections (multiple)
  target_audience_excel_file_uuid?: string | null;
  tags?: string[]; // Union of tags from selected level3s
  audience_targeting_method?: AudienceTargetingMethod;
  selected_tag_ids?: number[];
  sex?: string;
  city?: string[];
  adlink?: string;
  content?: string;
  scheduleat?: string;
  line_number?: string | null;
  budget?: number;
  finalize?: boolean;
  execution_audience_calculation_id?: number;
  short_link_domain?: string | null;
  job_category?: string;
  job?: string;
  platform?: CampaignPlatform;
  platform_settings_id?: number | null;
  media_uuid?: string | null;
  bundle_id?: number | null;
  phase?: CampaignPhase;
  audience_grades?: AudienceGrade[];
  sample_size_per_tag?: number;
}

export interface UploadMultimediaResponse {
  message: string;
  uuid: string;
  media_type: string;
  mime_type: string;
  size_bytes: number;
  original_filename: string;
  created_at: string;
}

// Update campaign response interface
export interface UpdateSMSCampaignResponse {
  message: string;
}

export interface HideCampaignsRequest {
  campaign_ids: number[];
}

export interface HideCampaignsResponse {
  message: string;
  updated_count: number;
}

export interface UnhideCampaignsRequest {
  campaign_ids: number[];
}

export interface UnhideCampaignsResponse {
  message: string;
  updated_count: number;
}

export interface SendCampaignTestMessageResponse {
  [key: string]: unknown;
}

export interface SendCampaignTestMessageRequest {
  target_phone_number: string;
}

export interface CampaignStep {
  id: number;
  title: string;
  isCompleted: boolean;
  isAccessible: boolean;
}

export interface FormField {
  id: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'radio'
    | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
    message?: string;
  };
}

export interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  component: React.ComponentType;
  validation: (data: CampaignData) => boolean;
  fields: FormField[];
}

export interface GetCampaignResponse {
  id?: number;
  uuid: string;
  status: string;
  created_at: string;
  updated_at?: string;
  hidden?: boolean;
  title?: string;
  level1?: string;
  level2s?: string[];
  level3s?: string[];
  target_audience_excel_file_uuid?: string | null;
  tags?: string[];
  audience_targeting_method?: AudienceTargetingMethod | string;
  sex?: string;
  city?: string[];
  adlink?: string;
  content?: string;
  short_link_domain?: string | null;
  job_category?: string;
  job?: string;
  scheduleat?: string;
  line_number?: string;
  line_price_factor?: number;
  segment_price_factor?: number | null;
  budget?: number;
  num_audience?: number;
  comment?: string;
  statistics?: Record<string, any>;
  click_rate?: number;
  total_clicks?: number;
  platform?: CampaignPlatform | null;
  platform_settings_id?: number | null;
  platform_settings_name?: string | null;
  platform_base_price?: number | null;
  media_uuid?: string | null;
  audience_grades?: AudienceGrade[];
  calculation_id?: number | null;
  calculation_status?: string | null;
  selected_score_classes?: AudienceGrade[];
  raw_audience_count?: number | null;
  eligible_unique_audience_count_before_approved_campaign_deduction?:
    | number
    | null;
  approved_campaign_audience_deduction?: number | null;
  usable_unique_audience_count?: number | null;
  recalculation_required?: boolean;
  started_at?: string | null;
  finished_at?: string | null;
  expires_at?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  bundle_id?: number | null;
  bundle_title?: string | null;
  phase?: CampaignPhase | string | null;
  sample_size_per_tag?: number | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface SmartTargetingTagItem {
  tag_id: number;
  tag_display_title: string | null;
  used_in_bundle: boolean;
  tag_capacity: number | null;
  bundle_persona_fit_score: number | null;
  evaluation_run_id: number | null;
  fit_level: string | null;
  relation_type: string | null;
  test_phase_avg_ctr: number | null;
  total_test_selected_count: number | null;
  total_test_sent_count: number | null;
  total_test_delivered_count: number | null;
  total_test_click_count: number | null;
  selected_count: number | null;
  sent_count: number | null;
  delivered_count: number | null;
  click_count: number | null;
  test_campaign_ctr: number | null;
  overall_avg_ctr: number | null;
  selected: boolean;
}

export interface SmartTargetingSelectionSummary {
  selected_tag_count: number;
  selected_raw_capacity: number;
}

export interface ListSmartTargetingTagsParams {
  page: number;
  page_size: number;
  search?: string;
  capacity?: number;
  sort_by?: SmartTargetingSortBy;
  sort_direction?: SmartTargetingSortDirection;
}

export interface ListSmartTargetingTagsResponse {
  items: SmartTargetingTagItem[];
  pagination: PaginationInfo;
  selected_tag_ids: number[];
  summary: SmartTargetingSelectionSummary;
  evaluation_available: boolean;
  effective_sort_by?: SmartTargetingSortBy | '';
  effective_sort_direction?: SmartTargetingSortDirection | '';
}

export interface ReplaceSmartTargetingSelectionRequest {
  tag_ids: number[];
}

export interface AutoSelectSmartTargetingTagsRequest {
  count: number;
  search?: string;
  capacity?: number;
  sort_by?: SmartTargetingSortBy;
  sort_direction?: SmartTargetingSortDirection;
}

export interface SmartTargetingSelectionResponse {
  selected_tag_ids: number[];
  summary: SmartTargetingSelectionSummary;
}

export interface StartSmartTargetingCapacityCalculationRequest {
  /** An empty or omitted UI selection is serialized explicitly as A+B+C. */
  score_classes?: AudienceGrade[];
}

export interface SmartTargetingCapacityCalculationResponse {
  calculation_id: number;
  campaign_id: number;
  bundle_id: number;
  status: string;
  is_current: boolean;
  recalculation_required: boolean;
  selected_score_classes: AudienceGrade[];
  selected_tag_count: number;
  raw_audience_count?: number | null;
  eligible_unique_audience_count_before_approved_campaign_deduction?:
    | number
    | null;
  approved_campaign_audience_deduction?: number | null;
  usable_unique_audience_count?: number | null;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  expires_at?: string | null;
  error_code?: string | null;
  error_message?: string | null;
}

export interface SmartTargetingExecutionCalculationResponse {
  calculation_id: number;
  campaign_id: number;
  bundle_id: number;
  requested_audience_count: number;
  status: string;
  is_current: boolean;
  recalculation_required: boolean;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  error_code?: string | null;
  error_message?: string | null;
}

export interface SmartTargetingExecutionReservation {
  phase: SmartTargetingExecutionReservationPhase;
  input_key: string;
  calculation?: SmartTargetingExecutionCalculationResponse | null;
  error_code?: string | null;
  error_message?: string | null;
}

export interface SmartTargetingTestSamplingTagResult {
  tag_id: number;
  tag_display_name: string | null;
  selection_order: number;
  satisfied: boolean;
  available_count: number;
}

export interface SmartTargetingTestSamplingPreviewResponse {
  sample_size_per_tag: number;
  tag_sampling_order: number[];
  satisfied_tags: SmartTargetingTestSamplingTagResult[];
  unsatisfied_tags: SmartTargetingTestSamplingTagResult[];
  satisfied_tag_count: number;
  effective_audience_count: number;
  campaign_cost: number;
}

export interface SmartTargetingTestSamplingCalculationResponse {
  calculation_id: number;
  campaign_id: number;
  bundle_id: number;
  status: string;
  is_current: boolean;
  recalculation_required: boolean;
  sample_size_per_tag: number;
  tag_sampling_order: number[];
  selected_score_classes: AudienceGrade[];
  satisfied_tags?: SmartTargetingTestSamplingTagResult[];
  unsatisfied_tags?: SmartTargetingTestSamplingTagResult[];
  satisfied_tag_count?: number | null;
  effective_audience_count?: number | null;
  campaign_cost?: number | null;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  error_code?: string | null;
  error_message?: string | null;
}

export interface ListSMSCampaignsResponse {
  message: string;
  items: GetCampaignResponse[];
  pagination: PaginationInfo;
}

export interface ListSMSCampaignsParams {
  page: number;
  limit: number;
  orderby?:
    | 'newest'
    | 'oldest'
    | 'phase_test_first'
    | 'phase_execution_first'
    | 'highest_click_rate'
    | 'lowest_click_rate';
  campaign_title?: string;
  bundle_title?: string;
  status?:
    | 'initiated'
    | 'in-progress'
    | 'waiting-for-approval'
    | 'approved'
    | 'rejected'
    | 'running'
    | 'cancelled'
    | 'cancelled-by-admin'
    | 'expired'
    | 'executed';
  bundle_id?: number;
  platform?: 'sms' | 'rubika' | 'bale' | 'splus';
  start_date?: string;
  end_date?: string;
  phase?: 'test' | 'execution';
  hidden?: boolean;
}

// Audience Spec types
export interface AudienceSpecItem {
  layer1_category: string;
  layer2_category: string;
  layer3_category: string;
  tags: string[];
  available_audience: number;
  distinct_users: number;
  black_users: number;
  white_users: number;
  pink_users: number;
  weak_white: number;
  good_white: number;
  best_white: number;
  weak_black: number;
  good_black: number;
  best_black: number;
  weak_pink: number;
  good_pink: number;
  best_pink: number;
  scored_users: number;
}

export interface AudienceSpecLevel2 {
  metadata?: Record<string, unknown>;
  items?: Record<string, AudienceSpecItem>;
}

// Now three levels: level1 -> level2 -> level3 -> AudienceSpecItem
export type AudienceSpec = Record<string, Record<string, AudienceSpecLevel2>>;

export interface ListAudienceSpecResponse {
  message: string;
  spec: AudienceSpec;
}

// Active line numbers
export interface ActiveLineNumberItem {
  line_number: string;
}

export interface ListActiveLineNumbersResponse {
  message: string;
  items: ActiveLineNumberItem[];
}

// Segment price factors (latest per level3)
export interface SegmentPriceFactorItem {
  level3: string;
  price_factor: number;
  created_at: string;
}

export interface ListLatestSegmentPriceFactorsResponse {
  message: string;
  items: SegmentPriceFactorItem[];
}
