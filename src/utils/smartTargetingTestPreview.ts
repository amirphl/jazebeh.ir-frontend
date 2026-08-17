import {
  CampaignData,
  CampaignSegment,
  SmartTargetingTestSamplingCalculationResponse,
  SmartTargetingTestSamplingPreviewResponse,
  SmartTargetingTestSamplingTagResult,
} from '../types/campaign';
import {
  getEffectiveScoreClassKey,
  normalizeSmartTargetingScoreClasses,
} from './smartTargetingCapacity';

export const DEFAULT_SMART_TARGETING_TEST_SAMPLE_SIZE = 0;
export const SMART_TARGETING_TEST_SAMPLING_POLL_INTERVAL_MS = 10_000;
export const SMART_TARGETING_TEST_SAMPLING_MAX_POLL_RETRIES = 3;

// The API's `status` field controls the action state. Only `calculating`
// represents in-progress work; every other status allows a new request.
const ACTIVE_CALCULATION_STATUSES = new Set(['calculating']);
const COMPLETED_CALCULATION_STATUSES = new Set([
  'calculated',
  'completed',
  'succeeded',
  'success',
]);
const FAILED_CALCULATION_STATUSES = new Set([
  'failed',
  'cancelled',
  'canceled',
  'expired',
]);

const normalizeStatus = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .trim()
        .toLowerCase()
        .replace(/[-\s]+/g, '_')
    : '';

const normalizePositiveSafeInteger = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isSafeInteger(numeric) && numeric > 0 ? numeric : null;
};

const normalizeNonNegativeSafeInteger = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isSafeInteger(numeric) && numeric >= 0 ? numeric : null;
};

export const normalizeOrderedTagIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  const normalized: number[] = [];
  const seen = new Set<number>();

  value.forEach(item => {
    const tagId = normalizePositiveSafeInteger(item);
    if (tagId === null || seen.has(tagId)) return;
    seen.add(tagId);
    normalized.push(tagId);
  });

  return normalized;
};

export const areSameOrderedTagIds = (
  left: unknown,
  right: unknown
): boolean => {
  const normalizedLeft = normalizeOrderedTagIds(left);
  const normalizedRight = normalizeOrderedTagIds(right);
  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((tagId, index) => tagId === normalizedRight[index])
  );
};

const normalizeTagResult = (
  value: unknown
): SmartTargetingTestSamplingTagResult | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const tagId = normalizePositiveSafeInteger(candidate.tag_id);
  const selectionOrder = normalizeNonNegativeSafeInteger(
    candidate.selection_order
  );
  const availableCount = normalizeNonNegativeSafeInteger(
    candidate.available_count
  );
  const tagDisplayName =
    typeof candidate.tag_display_name === 'string'
      ? candidate.tag_display_name.trim() || null
      : null;

  if (
    tagId === null ||
    selectionOrder === null ||
    availableCount === null ||
    (candidate.tag_display_name !== undefined &&
      candidate.tag_display_name !== null &&
      typeof candidate.tag_display_name !== 'string') ||
    typeof candidate.satisfied !== 'boolean'
  ) {
    return null;
  }

  return {
    tag_id: tagId,
    tag_display_name: tagDisplayName,
    selection_order: selectionOrder,
    satisfied: candidate.satisfied,
    available_count: availableCount,
  };
};

export const normalizeSmartTargetingTestPreview = (
  value: unknown
): SmartTargetingTestSamplingPreviewResponse | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const sampleSizePerTag = normalizePositiveSafeInteger(
    candidate.sample_size_per_tag
  );
  const tagSamplingOrder = normalizeOrderedTagIds(candidate.tag_sampling_order);
  const satisfiedTagCount = normalizeNonNegativeSafeInteger(
    candidate.satisfied_tag_count
  );
  const effectiveAudienceCount = normalizeNonNegativeSafeInteger(
    candidate.effective_audience_count
  );
  const campaignCost = normalizeNonNegativeSafeInteger(candidate.campaign_cost);
  const satisfiedTags = Array.isArray(candidate.satisfied_tags)
    ? candidate.satisfied_tags.map(normalizeTagResult)
    : [];
  const unsatisfiedTags = Array.isArray(candidate.unsatisfied_tags)
    ? candidate.unsatisfied_tags.map(normalizeTagResult)
    : [];

  if (
    sampleSizePerTag === null ||
    tagSamplingOrder.length === 0 ||
    satisfiedTagCount === null ||
    effectiveAudienceCount === null ||
    campaignCost === null ||
    !Array.isArray(candidate.tag_sampling_order) ||
    tagSamplingOrder.length !== candidate.tag_sampling_order.length ||
    !Array.isArray(candidate.satisfied_tags) ||
    !Array.isArray(candidate.unsatisfied_tags) ||
    satisfiedTags.some(item => item === null) ||
    unsatisfiedTags.some(item => item === null)
  ) {
    return null;
  }

  const normalizedSatisfiedTags =
    satisfiedTags as SmartTargetingTestSamplingTagResult[];
  const normalizedUnsatisfiedTags =
    unsatisfiedTags as SmartTargetingTestSamplingTagResult[];
  const resultTagIds = [
    ...normalizedSatisfiedTags,
    ...normalizedUnsatisfiedTags,
  ].map(item => item.tag_id);
  const allTagResults = [
    ...normalizedSatisfiedTags,
    ...normalizedUnsatisfiedTags,
  ];
  const selectionOrders = allTagResults.map(item => item.selection_order);
  const orderedTagResults = [...allTagResults].sort(
    (left, right) => left.selection_order - right.selection_order
  );
  const firstSelectionOrder = orderedTagResults[0]?.selection_order;
  const hasContiguousSelectionOrder =
    (firstSelectionOrder === 0 || firstSelectionOrder === 1) &&
    orderedTagResults.every(
      (item, index) => item.selection_order === firstSelectionOrder + index
    );
  const expectedEffectiveCount = satisfiedTagCount * sampleSizePerTag;

  if (
    !Number.isSafeInteger(expectedEffectiveCount) ||
    satisfiedTagCount !== normalizedSatisfiedTags.length ||
    effectiveAudienceCount !== expectedEffectiveCount ||
    normalizedSatisfiedTags.some(item => !item.satisfied) ||
    normalizedUnsatisfiedTags.some(item => item.satisfied) ||
    resultTagIds.length !== tagSamplingOrder.length ||
    new Set(resultTagIds).size !== resultTagIds.length ||
    resultTagIds.some(tagId => !tagSamplingOrder.includes(tagId)) ||
    new Set(selectionOrders).size !== selectionOrders.length ||
    !hasContiguousSelectionOrder ||
    orderedTagResults.some(
      (item, index) => tagSamplingOrder[index] !== item.tag_id
    ) ||
    normalizedSatisfiedTags.some(
      item => item.available_count < sampleSizePerTag
    ) ||
    normalizedUnsatisfiedTags.some(
      item => item.available_count >= sampleSizePerTag
    )
  ) {
    return null;
  }

  return {
    sample_size_per_tag: sampleSizePerTag,
    tag_sampling_order: tagSamplingOrder,
    satisfied_tags: normalizedSatisfiedTags,
    unsatisfied_tags: normalizedUnsatisfiedTags,
    satisfied_tag_count: satisfiedTagCount,
    effective_audience_count: effectiveAudienceCount,
    campaign_cost: campaignCost,
  };
};

const normalizeOptionalNonNegativeSafeInteger = (
  value: unknown
): number | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return normalizeNonNegativeSafeInteger(value) ?? undefined;
};

const normalizeOptionalString = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const normalizeOptionalTagResults = (
  value: unknown
): SmartTargetingTestSamplingTagResult[] | undefined => {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return undefined;
  const normalized = value.map(normalizeTagResult);
  return normalized.some(item => item === null)
    ? undefined
    : (normalized as SmartTargetingTestSamplingTagResult[]);
};

export const normalizeSmartTargetingTestSamplingCalculation = (
  value: unknown
): SmartTargetingTestSamplingCalculationResponse | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const calculationId = normalizePositiveSafeInteger(candidate.calculation_id);
  const campaignId = normalizePositiveSafeInteger(candidate.campaign_id);
  const bundleId = normalizePositiveSafeInteger(candidate.bundle_id);
  const status = normalizeStatus(candidate.status);
  const sampleSizePerTag = normalizePositiveSafeInteger(
    candidate.sample_size_per_tag
  );
  const tagSamplingOrder = normalizeOrderedTagIds(candidate.tag_sampling_order);
  const selectedScoreClasses = normalizeSmartTargetingScoreClasses(
    candidate.selected_score_classes
  );
  const satisfiedTags = normalizeOptionalTagResults(candidate.satisfied_tags);
  const unsatisfiedTags = normalizeOptionalTagResults(
    candidate.unsatisfied_tags
  );
  const satisfiedTagCount = normalizeOptionalNonNegativeSafeInteger(
    candidate.satisfied_tag_count
  );
  const effectiveAudienceCount = normalizeOptionalNonNegativeSafeInteger(
    candidate.effective_audience_count
  );
  const campaignCost = normalizeOptionalNonNegativeSafeInteger(
    candidate.campaign_cost
  );

  if (
    calculationId === null ||
    campaignId === null ||
    bundleId === null ||
    !status ||
    sampleSizePerTag === null ||
    tagSamplingOrder.length === 0 ||
    !Array.isArray(candidate.tag_sampling_order) ||
    tagSamplingOrder.length !== candidate.tag_sampling_order.length ||
    !Array.isArray(candidate.selected_score_classes) ||
    selectedScoreClasses.length !== candidate.selected_score_classes.length ||
    typeof candidate.is_current !== 'boolean' ||
    typeof candidate.recalculation_required !== 'boolean' ||
    typeof candidate.created_at !== 'string' ||
    !candidate.created_at.trim() ||
    (candidate.satisfied_tags !== undefined &&
      candidate.satisfied_tags !== null &&
      satisfiedTags === undefined) ||
    (candidate.unsatisfied_tags !== undefined &&
      candidate.unsatisfied_tags !== null &&
      unsatisfiedTags === undefined) ||
    (candidate.satisfied_tag_count !== undefined &&
      candidate.satisfied_tag_count !== null &&
      satisfiedTagCount === undefined) ||
    (candidate.effective_audience_count !== undefined &&
      candidate.effective_audience_count !== null &&
      effectiveAudienceCount === undefined) ||
    (candidate.campaign_cost !== undefined &&
      candidate.campaign_cost !== null &&
      campaignCost === undefined)
  ) {
    return null;
  }

  return {
    calculation_id: calculationId,
    campaign_id: campaignId,
    bundle_id: bundleId,
    status,
    is_current: candidate.is_current,
    recalculation_required: candidate.recalculation_required,
    sample_size_per_tag: sampleSizePerTag,
    tag_sampling_order: tagSamplingOrder,
    selected_score_classes: selectedScoreClasses,
    satisfied_tags: satisfiedTags,
    unsatisfied_tags: unsatisfiedTags,
    satisfied_tag_count: satisfiedTagCount,
    effective_audience_count: effectiveAudienceCount,
    campaign_cost: campaignCost,
    created_at: candidate.created_at.trim(),
    started_at: normalizeOptionalString(candidate.started_at),
    finished_at: normalizeOptionalString(candidate.finished_at),
    error_code: normalizeOptionalString(candidate.error_code),
    error_message: normalizeOptionalString(candidate.error_message),
  };
};

export const isSmartTargetingTestSamplingActive = (
  calculation: SmartTargetingTestSamplingCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation &&
    ACTIVE_CALCULATION_STATUSES.has(normalizeStatus(calculation.status))
  );

export const isSmartTargetingTestSamplingCompleted = (
  calculation: SmartTargetingTestSamplingCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation &&
    COMPLETED_CALCULATION_STATUSES.has(normalizeStatus(calculation.status))
  );

export const isSmartTargetingTestSamplingFailed = (
  calculation: SmartTargetingTestSamplingCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation &&
    FAILED_CALCULATION_STATUSES.has(normalizeStatus(calculation.status))
  );

export const isSmartTargetingTestSamplingStale = (
  calculation: SmartTargetingTestSamplingCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation &&
    (!calculation.is_current ||
      calculation.recalculation_required ||
      normalizeStatus(calculation.status) === 'recalculation_required' ||
      normalizeStatus(calculation.status) === 'stale')
  );

export const isKnownSmartTargetingTestSamplingStatus = (
  calculation: SmartTargetingTestSamplingCalculationResponse | null | undefined
): boolean => {
  if (!calculation) return true;
  const status = normalizeStatus(calculation.status);
  return (
    ACTIVE_CALCULATION_STATUSES.has(status) ||
    COMPLETED_CALCULATION_STATUSES.has(status) ||
    FAILED_CALCULATION_STATUSES.has(status) ||
    status === 'stale' ||
    status === 'not_calculated' ||
    status === 'recalculation_required'
  );
};

export const doesSmartTargetingTestSamplingMatchInputs = (
  calculation: SmartTargetingTestSamplingCalculationResponse,
  tagIds: unknown,
  sampleSizePerTag: unknown,
  selectedScoreClasses: unknown
): boolean =>
  calculation.sample_size_per_tag === sampleSizePerTag &&
  areSameOrderedTagIds(calculation.tag_sampling_order, tagIds) &&
  getEffectiveScoreClassKey(calculation.selected_score_classes) ===
    getEffectiveScoreClassKey(selectedScoreClasses);

export const getSmartTargetingTestPreviewFromCalculation = (
  calculation: SmartTargetingTestSamplingCalculationResponse | null | undefined
): SmartTargetingTestSamplingPreviewResponse | null => {
  if (
    !calculation ||
    !isSmartTargetingTestSamplingCompleted(calculation) ||
    isSmartTargetingTestSamplingStale(calculation) ||
    typeof calculation.satisfied_tag_count !== 'number' ||
    typeof calculation.effective_audience_count !== 'number' ||
    typeof calculation.campaign_cost !== 'number'
  ) {
    return null;
  }

  return normalizeSmartTargetingTestPreview({
    sample_size_per_tag: calculation.sample_size_per_tag,
    tag_sampling_order: calculation.tag_sampling_order,
    satisfied_tags: calculation.satisfied_tags ?? [],
    unsatisfied_tags: calculation.unsatisfied_tags ?? [],
    satisfied_tag_count: calculation.satisfied_tag_count,
    effective_audience_count: calculation.effective_audience_count,
    campaign_cost: calculation.campaign_cost,
  });
};

export const getSmartTargetingTestPreviewInputKey = (
  campaignUuid: string | undefined,
  segment: Partial<CampaignSegment>
): string => {
  const orderedTagIds = normalizeOrderedTagIds(segment.selectedTagIds);
  const sampleSize = normalizePositiveSafeInteger(segment.sampleSizePerTag);
  return [
    campaignUuid?.trim() || 'unsaved',
    segment.bundleId ?? 'no-bundle',
    segment.audienceTargetingMethod ?? 'standard',
    segment.phase ?? 'execution',
    segment.platform ?? 'sms',
    segment.smartTargetingSortBy || 'default',
    segment.smartTargetingSortBy
      ? segment.smartTargetingSortDirection || 'desc'
      : 'default',
    orderedTagIds.join(','),
    sampleSize ?? 'invalid-sample',
    getEffectiveScoreClassKey(segment.smartTargetingScoreClasses),
  ].join('|');
};

export const isCurrentSmartTargetingTestPreview = (
  campaignData: CampaignData
): boolean => {
  const { segment } = campaignData;
  const preview = normalizeSmartTargetingTestPreview(
    segment.smartTargetingTestPreview
  );
  if (
    segment.audienceTargetingMethod !== 'smart_targeting' ||
    segment.phase !== 'test' ||
    !preview ||
    segment.smartTargetingTestPreviewStale === true ||
    !segment.smartTargetingTestPreviewInputKey
  ) {
    return false;
  }

  return (
    segment.smartTargetingTestPreviewInputKey ===
      getSmartTargetingTestPreviewInputKey(campaignData.uuid, segment) &&
    preview.sample_size_per_tag === segment.sampleSizePerTag &&
    areSameOrderedTagIds(preview.tag_sampling_order, segment.selectedTagIds)
  );
};

export const hasUsableSmartTargetingTestPreview = (
  campaignData: CampaignData
): boolean =>
  isCurrentSmartTargetingTestPreview(campaignData) &&
  (campaignData.segment.smartTargetingTestPreview?.effective_audience_count ??
    0) > 0;
