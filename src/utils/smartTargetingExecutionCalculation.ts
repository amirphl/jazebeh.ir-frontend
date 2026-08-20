import {
  CampaignData,
  SmartTargetingExecutionCalculationResponse,
} from '../types/campaign';

export const SMART_TARGETING_EXECUTION_POLL_INTERVAL_MS = 10_000;

const normalizeStatus = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .trim()
        .toLowerCase()
        .replace(/[-\s]+/g, '_')
    : '';

const positiveInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0
    ? value
    : null;

const nonNegativeInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;

const optionalString = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

export const normalizeSmartTargetingExecutionCalculation = (
  value: unknown
): SmartTargetingExecutionCalculationResponse | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const calculationId = positiveInteger(candidate.calculation_id);
  const campaignId = positiveInteger(candidate.campaign_id);
  const bundleId = positiveInteger(candidate.bundle_id);
  const requestedAudienceCount = nonNegativeInteger(
    candidate.requested_audience_count
  );
  const status = normalizeStatus(candidate.status);

  if (
    calculationId === null ||
    campaignId === null ||
    bundleId === null ||
    requestedAudienceCount === null ||
    !status ||
    typeof candidate.is_current !== 'boolean' ||
    typeof candidate.recalculation_required !== 'boolean' ||
    typeof candidate.created_at !== 'string' ||
    !candidate.created_at.trim()
  ) {
    return null;
  }

  return {
    calculation_id: calculationId,
    campaign_id: campaignId,
    bundle_id: bundleId,
    requested_audience_count: requestedAudienceCount,
    status,
    is_current: candidate.is_current,
    recalculation_required: candidate.recalculation_required,
    created_at: candidate.created_at.trim(),
    started_at: optionalString(candidate.started_at),
    finished_at: optionalString(candidate.finished_at),
    error_code: optionalString(candidate.error_code),
    error_message: optionalString(candidate.error_message),
  };
};

export const isSmartTargetingExecutionCalculationReady = (
  calculation: SmartTargetingExecutionCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation &&
    calculation.status === 'ready' &&
    calculation.is_current &&
    !calculation.recalculation_required
  );

export const isSmartTargetingExecutionCalculationActive = (
  calculation: SmartTargetingExecutionCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation &&
    (calculation.status === 'pending' || calculation.status === 'calculating')
  );

export const isSmartTargetingExecutionCalculationStale = (
  calculation: SmartTargetingExecutionCalculationResponse | null | undefined
): boolean =>
  Boolean(
    calculation &&
    (calculation.status === 'stale' ||
      calculation.recalculation_required ||
      (calculation.status === 'ready' && !calculation.is_current))
  );

/** Only fields named by the API as reservation-invalidating participate here. */
export const getSmartTargetingExecutionCalculationInputKey = (
  campaign: CampaignData
): string => {
  const { segment, content, budget } = campaign;
  const targetingMethod =
    segment.audienceTargetingMethod ??
    (segment.targetAudienceExcelFileUuid != null ? 'excel' : 'standard');
  const tagIds = Array.from(
    new Set(
      (segment.selectedTagIds || []).filter(
        id => Number.isSafeInteger(id) && id > 0
      )
    )
  ).sort((left, right) => left - right);
  const grades = Array.from(
    new Set(
      (segment.smartTargetingScoreClasses || []).filter(
        grade => grade === 'A' || grade === 'B' || grade === 'C'
      )
    )
  ).sort();
  const eligibility =
    segment.platform === 'sms'
      ? content.lineNumber?.trim() || ''
      : String(content.platformSettingsId || '');

  return [
    campaign.uuid.trim(),
    targetingMethod,
    String(segment.bundleId || ''),
    tagIds.join(','),
    grades.join(','),
    segment.platform,
    eligibility,
    String(budget.totalBudget),
    segment.phase || '',
  ].join('|');
};

/** Exact-capacity validity has the same backend-invalidating inputs. */
export const getSmartTargetingExactCapacityInputKey =
  getSmartTargetingExecutionCalculationInputKey;
