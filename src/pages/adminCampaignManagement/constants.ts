import { AdminListCampaignsFilter } from '../../types/admin';

export type CampaignActionType = 'approve' | 'reject' | 'cancel';

export const CAMPAIGN_STATUSES: AdminListCampaignsFilter['status'][] = [
  'initiated',
  'in-progress',
  'waiting-for-approval',
  'approved',
  'rejected',
  'running',
  'cancelled',
  'cancelled-by-admin',
  'expired',
  'executed',
];

export const DEFAULT_CAMPAIGN_STATUS_FILTER: NonNullable<
  AdminListCampaignsFilter['status']
> = 'waiting-for-approval';

export const WAITING_FOR_APPROVAL_STATUSES = new Set<string>([
  'waiting-for-approval',
  'waiting_for_approval',
]);

export const CANCELLABLE_STATUSES = new Set<string>(['approved']);

export const ACTIONABLE_COMMENT_REQUIRED: CampaignActionType[] = [
  'reject',
  'cancel',
];

export const RESCHEDULABLE_STATUSES = new Set<string>([
  'initiated',
  'in-progress',
  'in_progress',
  'waiting-for-approval',
  'waiting_for_approval',
  'approved',
]);

export const RESCHEDULE_MIN_LEAD_MINUTES = 7;
export const RESCHEDULE_HOUR_START = 8;
export const RESCHEDULE_HOUR_END = 21;
