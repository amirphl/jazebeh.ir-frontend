import {
  AudienceTargetingMethod,
  AudienceGrade,
  CampaignBudget,
  CampaignContent,
  CampaignData,
  CampaignPayment,
  CampaignPlatform,
  CampaignSegment,
  GetCampaignResponse,
} from '../types/campaign';
import { clearLevelSelection, saveLevelSelection } from '../types/segment';
import { normalizeLinkPlaceholder } from './campaignUtils';
import { DEFAULT_SMART_TARGETING_TEST_SAMPLE_SIZE } from './smartTargetingTestPreview';

export interface SmartTargetingDraftSelection {
  selectedTagIds: number[];
  selectedRawCapacity: number;
}

const isAudienceTargetingMethod = (
  value: unknown
): value is AudienceTargetingMethod =>
  value === 'standard' || value === 'smart_targeting' || value === 'excel';

const normalizeSelectedTagIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map(item => Number(item))
        .filter(item => Number.isInteger(item) && item > 0)
    )
  );
};

const normalizeStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0
      )
    : [];

const normalizeAudienceGrades = (value: unknown): AudienceGrade[] =>
  Array.isArray(value)
    ? Array.from(
        new Set(
          value.filter(
            (item): item is AudienceGrade =>
              item === 'A' || item === 'B' || item === 'C'
          )
        )
      )
    : [];

const normalizePositiveInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : null;

const normalizePlatform = (value: unknown): CampaignPlatform =>
  value === 'rubika' || value === 'bale' || value === 'splus' ? value : 'sms';

const resolveAudienceTargetingMethod = (
  campaign: GetCampaignResponse,
  selectedTagIds: number[]
): AudienceTargetingMethod => {
  if (isAudienceTargetingMethod(campaign.audience_targeting_method)) {
    return campaign.audience_targeting_method;
  }
  if (selectedTagIds.length > 0) return 'smart_targeting';
  return typeof campaign.target_audience_excel_file_uuid === 'string' &&
    campaign.target_audience_excel_file_uuid.trim()
    ? 'excel'
    : 'standard';
};

export const createCampaignCreationDraft = (overrides?: {
  id?: number;
  uuid?: string;
  segment?: Partial<CampaignSegment>;
  content?: Partial<CampaignContent>;
  budget?: Partial<CampaignBudget>;
  payment?: Partial<CampaignPayment>;
}): CampaignData => {
  const {
    segment: segmentOverrides,
    content: contentOverrides,
    budget: budgetOverrides,
    payment: paymentOverrides,
    ...campaignOverrides
  } = overrides ?? {};

  return {
    uuid: '',
    ...campaignOverrides,
    segment: {
      campaignTitle: '',
      level1: '',
      level2s: [],
      level3s: [],
      targetAudienceExcelFileUuid: null,
      platform: 'sms',
      tags: [],
      audienceTargetingMethod: 'standard',
      selectedTagIds: [],
      smartTargetingSelectedRawCapacity: 0,
      smartTargetingSelectionDirty: false,
      smartTargetingScoreClasses: [],
      smartTargetingScoreClassesDirty: false,
      smartTargetingTestSamplingInputsDirty: false,
      smartTargetingCapacityCalculation: null,
      smartTargetingExactCapacityRequired: false,
      smartTargetingSortBy: '',
      smartTargetingSortDirection: 'desc',
      smartTargetingSelectionOrderPending: false,
      sampleSizePerTag: DEFAULT_SMART_TARGETING_TEST_SAMPLE_SIZE,
      smartTargetingTestPreview: null,
      smartTargetingTestPreviewInputKey: null,
      smartTargetingTestPreviewStale: false,
      capacityTooLow: false,
      capacity: undefined,
      audienceGrades: [],
      sex: '',
      city: [],
      jobCategory: '',
      job: '',
      bundleId: null,
      phase: 'execution',
      ...(segmentOverrides ?? {}),
    },
    content: {
      insertLink: false,
      link: '',
      text: '',
      scheduleAt: undefined,
      shortLinkDomain: null,
      lineNumber: '',
      platformSettingsId: null,
      mediaUuid: null,
      ...(contentOverrides ?? {}),
    },
    budget: {
      totalBudget: 0,
      estimatedMessages: undefined,
      ...(budgetOverrides ?? {}),
    },
    payment: {
      paymentMethod: '',
      termsAccepted: false,
      ...(paymentOverrides ?? {}),
    },
  };
};

export const normalizeCampaignResponseToDraft = (
  campaign: GetCampaignResponse,
  options?: {
    id?: number | null;
    uuid?: string;
    clearSchedule?: boolean;
    smartTargetingSelection?: SmartTargetingDraftSelection;
    smartTargetingSelectionDirty?: boolean;
  }
): CampaignData => {
  const selectedTagIds = normalizeSelectedTagIds(
    options?.smartTargetingSelection?.selectedTagIds
  );
  const audienceTargetingMethod = resolveAudienceTargetingMethod(
    campaign,
    selectedTagIds
  );
  const isSmartTargetingTest =
    audienceTargetingMethod === 'smart_targeting' && campaign.phase === 'test';
  const platform = normalizePlatform(campaign.platform);
  const responseCapacity =
    typeof campaign.num_audience === 'number' &&
    Number.isFinite(campaign.num_audience)
      ? Math.max(0, campaign.num_audience)
      : undefined;
  const selectedRawCapacity =
    typeof options?.smartTargetingSelection?.selectedRawCapacity === 'number' &&
    Number.isFinite(options.smartTargetingSelection.selectedRawCapacity)
      ? Math.max(0, options.smartTargetingSelection.selectedRawCapacity)
      : 0;
  const capacity =
    audienceTargetingMethod === 'smart_targeting'
      ? selectedRawCapacity
      : responseCapacity;
  const level3s = normalizeStringArray(campaign.level3s);
  const hasAdlink =
    typeof campaign.adlink === 'string' && campaign.adlink.trim().length > 0;
  const shortLinkDomain =
    typeof campaign.short_link_domain === 'string' &&
    campaign.short_link_domain.trim()
      ? campaign.short_link_domain.trim()
      : null;

  return createCampaignCreationDraft({
    id:
      options && 'id' in options
        ? (normalizePositiveInteger(options.id) ?? undefined)
        : (normalizePositiveInteger(campaign.id) ?? undefined),
    uuid:
      options?.uuid !== undefined
        ? options.uuid.trim()
        : typeof campaign.uuid === 'string'
          ? campaign.uuid.trim()
          : '',
    segment: {
      campaignTitle: typeof campaign.title === 'string' ? campaign.title : '',
      level1: typeof campaign.level1 === 'string' ? campaign.level1 : '',
      level2s: normalizeStringArray(campaign.level2s),
      level3s,
      targetAudienceExcelFileUuid:
        typeof campaign.target_audience_excel_file_uuid === 'string' &&
        campaign.target_audience_excel_file_uuid.trim()
          ? campaign.target_audience_excel_file_uuid.trim()
          : null,
      platform,
      tags: normalizeStringArray(campaign.tags),
      audienceTargetingMethod,
      selectedTagIds,
      smartTargetingSelectedRawCapacity: selectedRawCapacity,
      smartTargetingSelectionDirty:
        options?.smartTargetingSelectionDirty === true,
      smartTargetingScoreClasses: normalizeAudienceGrades(
        campaign.selected_score_classes ??
          (audienceTargetingMethod === 'smart_targeting'
            ? campaign.audience_grades
            : undefined)
      ),
      smartTargetingScoreClassesDirty: false,
      smartTargetingTestSamplingInputsDirty: false,
      smartTargetingCapacityCalculation: null,
      smartTargetingExactCapacityRequired: false,
      sampleSizePerTag:
        typeof campaign.sample_size_per_tag === 'number' &&
        Number.isSafeInteger(campaign.sample_size_per_tag) &&
        campaign.sample_size_per_tag > 0
          ? campaign.sample_size_per_tag
          : DEFAULT_SMART_TARGETING_TEST_SAMPLE_SIZE,
      smartTargetingTestPreview: null,
      smartTargetingTestPreviewInputKey: null,
      smartTargetingTestPreviewStale: false,
      capacity,
      capacityTooLow:
        audienceTargetingMethod !== 'excel' &&
        (audienceTargetingMethod === 'standard'
          ? level3s.length > 0
          : selectedTagIds.length > 0) &&
        capacity !== undefined &&
        capacity < 500,
      audienceGrades: normalizeAudienceGrades(campaign.audience_grades),
      sex: typeof campaign.sex === 'string' ? campaign.sex : '',
      city: normalizeStringArray(campaign.city),
      jobCategory:
        typeof campaign.job_category === 'string' ? campaign.job_category : '',
      job: typeof campaign.job === 'string' ? campaign.job : '',
      bundleId: normalizePositiveInteger(campaign.bundle_id),
      phase:
        campaign.phase === 'test' || campaign.phase === 'execution'
          ? campaign.phase
          : 'execution',
    },
    content: {
      insertLink: hasAdlink,
      link: hasAdlink ? campaign.adlink!.trim() : '',
      text: normalizeLinkPlaceholder(
        typeof campaign.content === 'string' ? campaign.content : ''
      ),
      scheduleAt: options?.clearSchedule
        ? undefined
        : typeof campaign.scheduleat === 'string' && campaign.scheduleat.trim()
          ? campaign.scheduleat
          : undefined,
      shortLinkDomain: hasAdlink ? shortLinkDomain : null,
      lineNumber:
        typeof campaign.line_number === 'string' ? campaign.line_number : '',
      platformSettingsId: normalizePositiveInteger(
        campaign.platform_settings_id
      ),
      mediaUuid:
        typeof campaign.media_uuid === 'string' && campaign.media_uuid.trim()
          ? campaign.media_uuid
          : null,
    },
    budget: {
      totalBudget: isSmartTargetingTest
        ? 0
        : typeof campaign.budget === 'number' &&
            Number.isFinite(campaign.budget)
          ? Math.max(0, campaign.budget)
          : 0,
      estimatedMessages: isSmartTargetingTest ? undefined : responseCapacity,
    },
    payment: {
      paymentMethod: '',
      termsAccepted: false,
      hasEnoughBalance: undefined,
      finalCost: undefined,
      total: undefined,
    },
  });
};

const persistCampaignCreationDraft = (draft: CampaignData) => {
  localStorage.setItem('campaign_creation_data', JSON.stringify(draft));
  localStorage.setItem('campaign_creation_step', '1');
  saveLevelSelection({
    campaignTitle: draft.segment.campaignTitle || '',
    level1s: draft.segment.level1 ? [draft.segment.level1] : [],
    level2s: draft.segment.level2s || [],
    level3s: draft.segment.level3s || [],
    targetAudienceExcelFileUuid:
      draft.segment.targetAudienceExcelFileUuid ?? null,
    audienceTargetingMethod:
      draft.segment.audienceTargetingMethod ?? 'standard',
    selectedTagIds: draft.segment.selectedTagIds ?? [],
    smartTargetingSelectedRawCapacity:
      draft.segment.smartTargetingSelectedRawCapacity ?? 0,
    smartTargetingScoreClasses: draft.segment.smartTargetingScoreClasses ?? [],
    metadata: {},
    tags: draft.segment.tags || [],
    count: draft.segment.capacity || 0,
    lastUpdated: new Date().toISOString(),
  });
};

export const prepareCampaignCreationDraft = (draft: CampaignData) => {
  clearLevelSelection();
  localStorage.removeItem('campaign_creation_data');
  localStorage.removeItem('campaign_creation_step');
  persistCampaignCreationDraft(draft);
};
