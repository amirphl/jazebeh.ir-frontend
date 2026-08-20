import { describe, expect, it } from '@jest/globals';
import { createCampaignCreationDraft } from './campaignCreationDraft';
import {
  getSmartTargetingExecutionCalculationInputKey,
  isNonRetryableSmartTargetingExecutionPollError,
  isSmartTargetingExecutionCalculationReady,
  isSmartTargetingExecutionCalculationStale,
  normalizeSmartTargetingExecutionCalculation,
} from './smartTargetingExecutionCalculation';

const calculation = {
  calculation_id: 91,
  campaign_id: 7,
  bundle_id: 12,
  requested_audience_count: 1200,
  status: 'ready',
  is_current: true,
  recalculation_required: false,
  created_at: '2026-09-19T10:00:00Z',
};

describe('Smart Targeting execution calculations', () => {
  it('normalizes a ready current calculation and rejects malformed data', () => {
    const normalized = normalizeSmartTargetingExecutionCalculation(calculation);
    expect(normalized).toEqual(calculation);
    expect(isSmartTargetingExecutionCalculationReady(normalized)).toBe(true);
    expect(
      normalizeSmartTargetingExecutionCalculation({
        ...calculation,
        calculation_id: 0,
      })
    ).toBeNull();
  });

  it('does not consider a pending non-current calculation stale', () => {
    expect(
      isSmartTargetingExecutionCalculationStale({
        ...calculation,
        status: 'pending',
        is_current: false,
      })
    ).toBe(false);
    expect(
      isSmartTargetingExecutionCalculationStale({
        ...calculation,
        is_current: false,
      })
    ).toBe(true);
  });

  it('stops polling only permanently invalid execution-calculation requests', () => {
    expect(isNonRetryableSmartTargetingExecutionPollError('UNAUTHORIZED')).toBe(
      true
    );
    expect(isNonRetryableSmartTargetingExecutionPollError('NOT_FOUND')).toBe(
      true
    );
    expect(
      isNonRetryableSmartTargetingExecutionPollError('CAMPAIGN_NOT_FOUND')
    ).toBe(true);
    expect(
      isNonRetryableSmartTargetingExecutionPollError('CAMPAIGN_ACCESS_DENIED')
    ).toBe(true);
    expect(
      isNonRetryableSmartTargetingExecutionPollError('NETWORK_ERROR')
    ).toBe(false);
    expect(
      isNonRetryableSmartTargetingExecutionPollError('SERVICE_UNAVAILABLE')
    ).toBe(false);
  });

  it('changes its reservation fingerprint for every relevant input', () => {
    const draft = createCampaignCreationDraft({
      segment: {
        audienceTargetingMethod: 'smart_targeting',
        phase: 'execution',
        bundleId: 12,
        platform: 'sms',
        selectedTagIds: [3, 1],
        smartTargetingScoreClasses: ['A'],
      },
      content: { lineNumber: '3000' },
      budget: { totalBudget: 100000 },
    });
    const key = getSmartTargetingExecutionCalculationInputKey(draft);
    expect(
      getSmartTargetingExecutionCalculationInputKey({
        ...draft,
        budget: { ...draft.budget, totalBudget: 100001 },
      })
    ).not.toBe(key);
    expect(
      getSmartTargetingExecutionCalculationInputKey({
        ...draft,
        segment: { ...draft.segment, selectedTagIds: [1, 4] },
      })
    ).not.toBe(key);
  });
});
