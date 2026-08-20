import {
  AudienceGrade,
  SmartTargetingCapacityCalculationResponse,
} from '../types/campaign';

export const SMART_TARGETING_CAPACITY_POLL_INTERVAL_MS = 10_000;
export const SMART_TARGETING_CAPACITY_MAX_POLL_RETRIES = 3;

const SCORE_CLASS_ORDER: AudienceGrade[] = ['A', 'B', 'C'];
// `status` is the source of truth for the exact-capacity UI.  In particular,
// do not keep the calculation action blocked for a stale metadata flag or for
// legacy/unknown in-progress values: the API exposes `calculating` while work
// is actually in progress.
const ACTIVE_STATUSES = new Set(['calculating']);
const FAILED_STATUSES = new Set(['failed', 'cancelled', 'canceled', 'expired']);
const CALCULATED_STATUSES = new Set(['calculated', 'completed']);
const CAPACITY_RECALCULATION_ERROR_CODES = new Set([
  'SMART_TARGETING_CAPACITY_FAILED',
  'SMART_TARGETING_CAPACITY_PENDING',
  'SMART_TARGETING_CAPACITY_RECALCULATION_REQUIRED',
  'SMART_TARGETING_CAPACITY_UNAVAILABLE',
  'SMART_TARGETING_EXACT_CAPACITY_REQUIRED',
  'CAMPAIGN_FINALIZE_STALE',
]);

export const normalizeSmartTargetingScoreClasses = (
  value: unknown
): AudienceGrade[] => {
  if (!Array.isArray(value)) return [];

  const normalized = new Set<AudienceGrade>();
  value.forEach(item => {
    if (typeof item !== 'string') return;
    const scoreClass = item.toUpperCase();
    if (scoreClass === 'A' || scoreClass === 'B' || scoreClass === 'C') {
      normalized.add(scoreClass);
    }
  });

  return SCORE_CLASS_ORDER.filter(scoreClass => normalized.has(scoreClass));
};

/** Empty and A+B+C are equivalent because both mean all score classes. */
export const getEffectiveScoreClassKey = (value: unknown): string => {
  const scoreClasses = normalizeSmartTargetingScoreClasses(value);
  return scoreClasses.length === 0 || scoreClasses.length === 3
    ? 'A,B,C'
    : scoreClasses.join(',');
};

export const getSelectedTagKey = (value: unknown): string =>
  Array.isArray(value)
    ? Array.from(
        new Set(
          value
            .map(Number)
            .filter(item => Number.isSafeInteger(item) && item > 0)
        )
      )
        .sort((left, right) => left - right)
        .join(',')
    : '';

const normalizeStatus = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .trim()
        .toLowerCase()
        .replace(/[-\s]+/g, '_')
    : '';

const normalizePositiveInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0
    ? value
    : null;

const normalizeNonNegativeInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;

const normalizeOptionalCount = (value: unknown): number | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return normalizeNonNegativeInteger(value) ?? undefined;
};

const normalizeOptionalString = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

export const normalizeSmartTargetingCapacityCalculation = (
  value: unknown
): SmartTargetingCapacityCalculationResponse | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const calculationId = normalizePositiveInteger(candidate.calculation_id);
  const campaignId = normalizePositiveInteger(candidate.campaign_id);
  const bundleId = normalizePositiveInteger(candidate.bundle_id);
  const status = normalizeStatus(candidate.status);
  const selectedTagCount = normalizeNonNegativeInteger(
    candidate.selected_tag_count
  );
  const selectedScoreClasses = normalizeSmartTargetingScoreClasses(
    candidate.selected_score_classes
  );

  if (
    calculationId === null ||
    campaignId === null ||
    bundleId === null ||
    !status ||
    selectedTagCount === null ||
    typeof candidate.is_current !== 'boolean' ||
    typeof candidate.recalculation_required !== 'boolean' ||
    !Array.isArray(candidate.selected_score_classes) ||
    selectedScoreClasses.length !== candidate.selected_score_classes.length ||
    typeof candidate.created_at !== 'string' ||
    !candidate.created_at.trim()
  ) {
    return null;
  }

  const rawAudienceCount = normalizeOptionalCount(candidate.raw_audience_count);
  const eligibleUniqueCount = normalizeOptionalCount(
    candidate.eligible_unique_audience_count_before_approved_campaign_deduction
  );
  const approvedDeduction = normalizeOptionalCount(
    candidate.approved_campaign_audience_deduction
  );
  const usableUniqueCount = normalizeOptionalCount(
    candidate.usable_unique_audience_count
  );
  const suppliedCounts = [
    ['raw_audience_count', rawAudienceCount],
    [
      'eligible_unique_audience_count_before_approved_campaign_deduction',
      eligibleUniqueCount,
    ],
    ['approved_campaign_audience_deduction', approvedDeduction],
    ['usable_unique_audience_count', usableUniqueCount],
  ] as const;
  if (
    suppliedCounts.some(
      ([field, normalized]) =>
        candidate[field] !== undefined &&
        candidate[field] !== null &&
        normalized === undefined
    )
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
    selected_score_classes: selectedScoreClasses,
    selected_tag_count: selectedTagCount,
    raw_audience_count: rawAudienceCount,
    eligible_unique_audience_count_before_approved_campaign_deduction:
      eligibleUniqueCount,
    approved_campaign_audience_deduction: approvedDeduction,
    usable_unique_audience_count: usableUniqueCount,
    created_at: candidate.created_at.trim(),
    started_at: normalizeOptionalString(candidate.started_at),
    finished_at: normalizeOptionalString(candidate.finished_at),
    expires_at: normalizeOptionalString(candidate.expires_at),
    error_code: normalizeOptionalString(candidate.error_code),
    error_message: normalizeOptionalString(candidate.error_message),
  };
};

export const isSmartTargetingCapacityActive = (
  calculation: SmartTargetingCapacityCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation &&
    ACTIVE_STATUSES.has(normalizeStatus(calculation.status))
  );

export const isSmartTargetingCapacityFailed = (
  calculation: SmartTargetingCapacityCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation && FAILED_STATUSES.has(normalizeStatus(calculation.status))
  );

export const isSmartTargetingCapacityCalculated = (
  calculation: SmartTargetingCapacityCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation && CALCULATED_STATUSES.has(normalizeStatus(calculation.status))
  );

export const isSmartTargetingCapacityStale = (
  calculation: SmartTargetingCapacityCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation &&
    (!calculation.is_current ||
      calculation.recalculation_required ||
      normalizeStatus(calculation.status) === 'recalculation_required' ||
      normalizeStatus(calculation.status) === 'stale')
  );

export const isKnownSmartTargetingCapacityStatus = (
  calculation: SmartTargetingCapacityCalculationResponse | null | undefined
): boolean => {
  if (!calculation) return true;
  const status = normalizeStatus(calculation.status);
  return (
    ACTIVE_STATUSES.has(status) ||
    FAILED_STATUSES.has(status) ||
    CALCULATED_STATUSES.has(status) ||
    status === 'stale' ||
    status === 'recalculation_required' ||
    status === 'not_calculated'
  );
};

export const isSmartTargetingCapacityRecalculationError = (
  value: unknown
): boolean =>
  typeof value === 'string' &&
  CAPACITY_RECALCULATION_ERROR_CODES.has(value.trim().toUpperCase());

export const isCurrentUsableSmartTargetingCapacity = (
  calculation: SmartTargetingCapacityCalculationResponse | null | undefined,
  selectedTagIds: unknown,
  selectedScoreClasses: unknown
): boolean => {
  const selectedTagKey = getSelectedTagKey(selectedTagIds);
  if (!calculation || !selectedTagKey) return false;

  return (
    calculation.is_current &&
    !calculation.recalculation_required &&
    isSmartTargetingCapacityCalculated(calculation) &&
    typeof calculation.usable_unique_audience_count === 'number' &&
    calculation.selected_tag_count === selectedTagKey.split(',').length &&
    getEffectiveScoreClassKey(calculation.selected_score_classes) ===
      getEffectiveScoreClassKey(selectedScoreClasses)
  );
};
