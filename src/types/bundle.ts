import type { PaginationInfo } from './campaign';

export interface BundleStatistics {
  aggregatedTotalRecords?: number | string | null;
  aggregatedTotalSent?: number | string | null;
  aggregatedTotalClicks?: number | string | null;
  totalCampaigns?: number | string | null;
  totalCampaignsPhaseTest?: number | string | null;
  totalCampaignsPhaseExecution?: number | string | null;
  [key: string]: unknown;
}

export interface BundleListItem {
  id: number;
  title: string;
  objective: string;
  target_audience_persona: string;
  adlink?: string | null;
  description?: string | null;
  short_link_domain?: string | null;
  target_customer_name?: string | null;
  job_category?: string | null;
  job?: string | null;
  metadata?: Record<string, unknown> | null;
  statistics?: BundleStatistics | null;
  tag_evaluation_status?: BundleTagEvaluationStatus | string | null;
  tag_evaluated_at?: string | null;
  customer_id: number;
  created_at: string;
  updated_at: string;
}

export interface BundlePagination {
  page: number;
  limit: number;
  total_items?: number;
  total?: number;
  total_pages: number;
}

export interface ListBundlesResponse {
  message?: string;
  items: BundleListItem[];
  pagination: BundlePagination;
}

export interface ListBundlesParams {
  page: number;
  limit: number;
  title?: string;
  target_audience_persona?: string;
}

export interface CreateBundleRequest {
  title: string;
  objective: string;
  target_audience_persona: string;
  adlink?: string;
  short_link_domain?: string;
  description?: string;
  target_customer_name?: string;
  job_category?: string;
  job?: string;
}

export interface CreateBundleResponse {
  message?: string;
  id?: number;
  bundle_id?: number;
  uuid?: string;
  title?: string;
  [key: string]: unknown;
}

export type UpdateBundleRequest = CreateBundleRequest;

export interface UpdateBundleResponse {
  message?: string;
  id: number;
  updated_at: string;
}

export interface GetBundlePayload {
  message?: string;
  item?: BundleListItem | null;
}

export type BundleTagEvaluationStatus =
  | 'not_evaluated'
  | 'evaluating'
  | 'evaluated'
  | 'update_required'
  | 'error';

export interface RequestBundleTagEvaluationResponse {
  message: string;
  evaluation_run_id: number;
  status: string;
  created_at: string;
}

export interface BundleTagEvaluationStatusItem {
  bundle_id: number;
  status: string;
  latest_run_id?: number | null;
  latest_successful_run_id?: number | null;
  latest_run_created_at?: string | null;
  latest_completed_at?: string | null;
  latest_error_message?: string | null;
  latest_error_at?: string | null;
}

export interface GetBundleTagEvaluationStatusResponse {
  message: string;
  item?: BundleTagEvaluationStatusItem | null;
}

export interface BundleTagScoreItem {
  evaluation_run_id: number;
  tag_id: number;
  tag_name_snapshot?: string | null;
  tag_display_title_snapshot?: string | null;
  tag_persona_snapshot?: string | null;
  tag_audience_count_snapshot?: number | null;
  bundle_fit_score: number;
  fit_level: string;
  relation_type: string;
  reason: string;
}

export interface ListBundleTagScoresParams {
  page: number;
  limit: number;
}

export interface ListBundleTagScoresResponse {
  message: string;
  items: BundleTagScoreItem[];
  pagination: PaginationInfo;
}

export interface BundleCreateFormValues {
  title: string;
  objective: string;
  targetAudiencePersona: string;
  description: string;
  insertLink: boolean;
  link: string;
  shortLinkDomain: string | null;
  customerName: string;
  jobCategory: string;
  job: string;
}

export interface BundleCreateFormErrors {
  title?: string;
  objective?: string;
  targetAudiencePersona?: string;
  description?: string;
  link?: string;
}

export type BundleActionFileStatus =
  | 'pending'
  | 'processing'
  | 'processed'
  | 'failed'
  | 'delete_pending'
  | 'deleted';

export interface BundleActionFileItem {
  id: number;
  original_file_name: string;
  action_level: string;
  status: BundleActionFileStatus;
  total_row_count: number;
  unique_uid_count: number;
  new_action_uid_count: number;
  duplicate_in_file_count: number;
  duplicate_in_other_files_count: number;
  invalid_uid_count: number;
  outside_bundle_count: number;
  unassigned_tag_count: number;
  missing_delivery_count: number;
  eligible_action_uid_count: number;
  error_code?: string | null;
  error_message?: string | null;
  created_at: string;
  processed_at?: string | null;
}
export interface BundleActionFilesPagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
export interface BundleActionFilesResponse {
  items: BundleActionFileItem[];
  pagination: BundleActionFilesPagination;
}
export interface BundleActionFilesQuery {
  page?: number;
  limit?: number;
}
export interface BundleActionSummary {
  bundle_id: number;
  has_active_action_files: boolean;
  action_count: number;
  eligible_delivered_count: number;
  bundle_avg_atr: number | null;
  updated_at: string;
}
export interface BundleActionTagMetric {
  tag_id: number;
  test_action_count: number;
  test_eligible_delivered_count: number;
  test_phase_avg_atr: number | null;
  overall_action_count: number;
  overall_eligible_delivered_count: number;
  overall_avg_atr: number | null;
}
