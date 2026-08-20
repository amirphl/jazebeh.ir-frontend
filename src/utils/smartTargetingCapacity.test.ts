import {
  getEffectiveScoreClassKey,
  isCurrentUsableSmartTargetingCapacity,
  isSmartTargetingCapacityRecalculationError,
  normalizeSmartTargetingCapacityCalculation,
  SMART_TARGETING_CAPACITY_POLL_INTERVAL_MS,
} from './smartTargetingCapacity';
import { describe, expect, it } from '@jest/globals';

const calculation = {
  calculation_id: 42,
  campaign_id: 7,
  bundle_id: 3,
  status: 'calculated',
  is_current: true,
  recalculation_required: false,
  selected_score_classes: ['A', 'B', 'C'],
  selected_tag_count: 2,
  raw_audience_count: 1500,
  eligible_unique_audience_count_before_approved_campaign_deduction: 900,
  approved_campaign_audience_deduction: 100,
  usable_unique_audience_count: 0,
  created_at: '2026-08-03T10:00:00Z',
};

describe('Smart Targeting exact-capacity helpers', () => {
  it('polls every ten seconds', () => {
    expect(SMART_TARGETING_CAPACITY_POLL_INTERVAL_MS).toBe(10_000);
  });

  it('treats an omitted score restriction and all classes as equivalent', () => {
    expect(getEffectiveScoreClassKey([])).toBe(
      getEffectiveScoreClassKey(['C', 'A', 'B'])
    );
  });

  it('preserves a calculated zero as a real usable result', () => {
    const normalized = normalizeSmartTargetingCapacityCalculation(calculation);

    expect(normalized?.usable_unique_audience_count).toBe(0);
    expect(
      isCurrentUsableSmartTargetingCapacity(normalized, [10, 20], [])
    ).toBe(true);
  });

  it('rejects partial or unsafe calculation responses', () => {
    expect(
      normalizeSmartTargetingCapacityCalculation({
        ...calculation,
        usable_unique_audience_count: Number.MAX_SAFE_INTEGER + 1,
      })
    ).toBeNull();
    expect(
      normalizeSmartTargetingCapacityCalculation({
        ...calculation,
        calculation_id: 0,
      })
    ).toBeNull();
  });

  it('recognizes Campaign update errors that require capacity attention', () => {
    expect(
      isSmartTargetingCapacityRecalculationError(
        'SMART_TARGETING_EXACT_CAPACITY_REQUIRED'
      )
    ).toBe(true);
    expect(
      isSmartTargetingCapacityRecalculationError(
        'SMART_TARGETING_CAPACITY_PENDING'
      )
    ).toBe(true);
    expect(
      isSmartTargetingCapacityRecalculationError(
        'SMART_TARGETING_EXECUTION_CALCULATION_REQUIRED'
      )
    ).toBe(false);
    expect(isSmartTargetingCapacityRecalculationError('INVALID_STATE')).toBe(
      false
    );
    expect(
      isSmartTargetingCapacityRecalculationError('INSUFFICIENT_CAPACITY')
    ).toBe(false);
  });
});
