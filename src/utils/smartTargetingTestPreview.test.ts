import { describe, expect, it } from '@jest/globals';
import { CampaignData } from '../types/campaign';
import {
  doesSmartTargetingTestSamplingMatchInputs,
  getSmartTargetingTestPreviewFromCalculation,
  getSmartTargetingTestPreviewInputKey,
  hasUsableSmartTargetingTestPreview,
  isSmartTargetingTestSamplingActive,
  isCurrentSmartTargetingTestPreview,
  normalizeSmartTargetingTestSamplingCalculation,
  normalizeSmartTargetingTestPreview,
} from './smartTargetingTestPreview';

const preview = {
  sample_size_per_tag: 600,
  tag_sampling_order: [30, 10, 20],
  satisfied_tags: [
    {
      tag_id: 30,
      tag_display_name: 'High intent',
      selection_order: 0,
      satisfied: true,
      available_count: 900,
    },
    {
      tag_id: 20,
      tag_display_name: 'Recent buyers',
      selection_order: 2,
      satisfied: true,
      available_count: 700,
    },
  ],
  unsatisfied_tags: [
    {
      tag_id: 10,
      tag_display_name: 'Dormant customers',
      selection_order: 1,
      satisfied: false,
      available_count: 599,
    },
  ],
  satisfied_tag_count: 2,
  effective_audience_count: 1200,
  campaign_cost: 84000,
};

const campaign = (): CampaignData => {
  const value: CampaignData = {
    id: 7,
    uuid: 'campaign-uuid',
    segment: {
      campaignTitle: 'Test Campaign',
      level1: '',
      level2s: [],
      level3s: [],
      platform: 'sms',
      audienceTargetingMethod: 'smart_targeting',
      selectedTagIds: [30, 10, 20],
      smartTargetingScoreClasses: ['A', 'B'],
      smartTargetingSortBy: 'tag_capacity',
      smartTargetingSortDirection: 'desc',
      sampleSizePerTag: 600,
      smartTargetingTestPreview: preview,
      smartTargetingTestPreviewStale: false,
      bundleId: 12,
      phase: 'test',
    },
    content: {
      insertLink: false,
      link: '',
      text: 'Message',
      shortLinkDomain: null,
      lineNumber: '3000',
    },
    budget: { totalBudget: 84000 },
    payment: { paymentMethod: '', termsAccepted: false },
  };
  value.segment.smartTargetingTestPreviewInputKey =
    getSmartTargetingTestPreviewInputKey(value.uuid, value.segment);
  return value;
};

describe('Smart Targeting Test preview helpers', () => {
  it('normalizes an all-or-nothing preview and preserves sampling order', () => {
    expect(normalizeSmartTargetingTestPreview(preview)).toEqual(preview);
  });

  it('accepts one-based selection positions from the backend', () => {
    const oneBasedPreview = {
      ...preview,
      satisfied_tags: preview.satisfied_tags.map(item => ({
        ...item,
        selection_order: item.selection_order + 1,
      })),
      unsatisfied_tags: preview.unsatisfied_tags.map(item => ({
        ...item,
        selection_order: item.selection_order + 1,
      })),
    };

    expect(normalizeSmartTargetingTestPreview(oneBasedPreview)).toEqual(
      oneBasedPreview
    );
  });

  it('rejects inconsistent effective counts and duplicate tag order', () => {
    expect(
      normalizeSmartTargetingTestPreview({
        ...preview,
        effective_audience_count: 1199,
      })
    ).toBeNull();
    expect(
      normalizeSmartTargetingTestPreview({
        ...preview,
        tag_sampling_order: [30, 10, 10],
      })
    ).toBeNull();
  });

  it('rejects results whose selection positions or availability contradict the sampling order', () => {
    expect(
      normalizeSmartTargetingTestPreview({
        ...preview,
        satisfied_tags: [
          { ...preview.satisfied_tags[0], selection_order: 1 },
          preview.satisfied_tags[1],
        ],
      })
    ).toBeNull();
    expect(
      normalizeSmartTargetingTestPreview({
        ...preview,
        unsatisfied_tags: [
          { ...preview.unsatisfied_tags[0], available_count: 600 },
        ],
      })
    ).toBeNull();
  });

  it('invalidates a preview when ordered tags or active sort changes', () => {
    const value = campaign();
    expect(isCurrentSmartTargetingTestPreview(value)).toBe(true);
    expect(hasUsableSmartTargetingTestPreview(value)).toBe(true);

    value.segment.selectedTagIds = [10, 30, 20];
    expect(isCurrentSmartTargetingTestPreview(value)).toBe(false);

    value.segment.selectedTagIds = [30, 10, 20];
    value.segment.smartTargetingSortDirection = 'asc';
    expect(isCurrentSmartTargetingTestPreview(value)).toBe(false);
  });

  it('normalizes a non-calculating asynchronous status without treating it as active', () => {
    const normalized = normalizeSmartTargetingTestSamplingCalculation({
      calculation_id: 91,
      campaign_id: 7,
      bundle_id: 12,
      status: 'QUEUED',
      is_current: true,
      recalculation_required: false,
      sample_size_per_tag: 600,
      tag_sampling_order: [30, 10, 20],
      selected_score_classes: ['b', 'A'],
      created_at: '2026-08-16T10:00:00Z',
    });

    expect(normalized).toMatchObject({
      calculation_id: 91,
      status: 'queued',
      selected_score_classes: ['A', 'B'],
    });
    expect(isSmartTargetingTestSamplingActive(normalized)).toBe(false);
    expect(
      normalized &&
        doesSmartTargetingTestSamplingMatchInputs(
          normalized,
          [30, 10, 20],
          600,
          ['A', 'B']
        )
    ).toBe(true);
  });

  it('extracts a completed preview while preserving valid zero values', () => {
    const normalized = normalizeSmartTargetingTestSamplingCalculation({
      calculation_id: 91,
      campaign_id: 7,
      bundle_id: 12,
      status: 'completed',
      is_current: true,
      recalculation_required: false,
      sample_size_per_tag: 600,
      tag_sampling_order: [30],
      selected_score_classes: ['A'],
      satisfied_tags: [
        {
          tag_id: 30,
          tag_display_name: 'High intent',
          selection_order: 0,
          satisfied: true,
          available_count: 900,
        },
      ],
      satisfied_tag_count: 1,
      effective_audience_count: 600,
      campaign_cost: 0,
      created_at: '2026-08-16T10:00:00Z',
    });

    expect(getSmartTargetingTestPreviewFromCalculation(normalized)).toEqual({
      sample_size_per_tag: 600,
      tag_sampling_order: [30],
      satisfied_tags: [
        {
          tag_id: 30,
          tag_display_name: 'High intent',
          selection_order: 0,
          satisfied: true,
          available_count: 900,
        },
      ],
      unsatisfied_tags: [],
      satisfied_tag_count: 1,
      effective_audience_count: 600,
      campaign_cost: 0,
    });
  });

  it('rejects unsafe calculation IDs and incomplete completed results', () => {
    const active = {
      calculation_id: 91,
      campaign_id: 7,
      bundle_id: 12,
      status: 'completed',
      is_current: true,
      recalculation_required: false,
      sample_size_per_tag: 600,
      tag_sampling_order: [30],
      selected_score_classes: ['A'],
      created_at: '2026-08-16T10:00:00Z',
    };

    expect(
      normalizeSmartTargetingTestSamplingCalculation({
        ...active,
        calculation_id: Number.MAX_SAFE_INTEGER + 1,
      })
    ).toBeNull();
    expect(
      getSmartTargetingTestPreviewFromCalculation(
        normalizeSmartTargetingTestSamplingCalculation(active)
      )
    ).toBeNull();
  });
});
