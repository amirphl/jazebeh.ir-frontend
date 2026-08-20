import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  jest as jestGlobals,
} from '@jest/globals';
import { CampaignProvider, useCampaign } from './useCampaign';
import { LEVEL_SELECTION_KEY } from '../types/segment';
import { getSmartTargetingTestPreviewInputKey } from '../utils/smartTargetingTestPreview';
import { getSmartTargetingExecutionCalculationInputKey } from '../utils/smartTargetingExecutionCalculation';

const CampaignProbe = () => {
  const { campaignData, currentStep } = useCampaign();
  return (
    <output data-testid='campaign-state'>
      {JSON.stringify({ campaignData, currentStep })}
    </output>
  );
};

const ResetCampaignProbe = () => {
  const { campaignData, currentStep, resetCampaign } = useCampaign();
  return (
    <>
      <button type='button' onClick={resetCampaign}>
        Reset
      </button>
      <output data-testid='campaign-state'>
        {JSON.stringify({ campaignData, currentStep })}
      </output>
    </>
  );
};

const EnsureCampaignProbe = ({ create }: { create: () => Promise<any> }) => {
  const { campaignData, ensureCampaignCreated, isCampaignCreationPending } =
    useCampaign();
  return (
    <>
      <button type='button' onClick={() => void ensureCampaignCreated(create)}>
        Create A
      </button>
      <button type='button' onClick={() => void ensureCampaignCreated(create)}>
        Create B
      </button>
      <output data-testid='creation-state'>
        {JSON.stringify({
          uuid: campaignData.uuid,
          id: campaignData.id,
          pending: isCampaignCreationPending,
        })}
      </output>
    </>
  );
};

const TestPreviewInvalidationProbe = () => {
  const {
    campaignData,
    setCampaignUuid,
    updateLevel,
    updateContent,
    updateBudget,
  } = useCampaign();
  const applyPreview = () => {
    const sampleSize = campaignData.segment.sampleSizePerTag ?? 600;
    const preview = {
      sample_size_per_tag: sampleSize,
      tag_sampling_order: [2, 1],
      satisfied_tags: [
        {
          tag_id: 2,
          tag_display_name: 'High intent',
          selection_order: 0,
          satisfied: true,
          available_count: 900,
        },
      ],
      unsatisfied_tags: [
        {
          tag_id: 1,
          tag_display_name: 'Dormant customers',
          selection_order: 1,
          satisfied: false,
          available_count: 500,
        },
      ],
      satisfied_tag_count: 1,
      effective_audience_count: sampleSize,
      campaign_cost: 84000,
    };
    updateLevel({
      smartTargetingTestPreview: preview,
      smartTargetingTestPreviewInputKey: getSmartTargetingTestPreviewInputKey(
        campaignData.uuid,
        campaignData.segment
      ),
      smartTargetingTestPreviewStale: false,
    });
    updateBudget({ totalBudget: preview.campaign_cost });
  };

  return (
    <>
      <button
        type='button'
        onClick={() => {
          setCampaignUuid('campaign-uuid');
          updateLevel({
            audienceTargetingMethod: 'smart_targeting',
            phase: 'test',
            platform: 'sms',
            bundleId: 12,
            selectedTagIds: [2, 1],
            sampleSizePerTag: 600,
            smartTargetingSortBy: 'tag_capacity',
            smartTargetingSortDirection: 'desc',
          });
        }}
      >
        Configure Test
      </button>
      <button type='button' onClick={applyPreview}>
        Apply Preview
      </button>
      <button
        type='button'
        onClick={() => updateLevel({ sampleSizePerTag: 601 })}
      >
        Change Sample
      </button>
      <button
        type='button'
        onClick={() => updateContent({ text: 'Changed content' })}
      >
        Change Content
      </button>
      <button
        type='button'
        onClick={() => {
          updateLevel({
            audienceTargetingMethod: 'smart_targeting',
            phase: 'execution',
            selectedTagIds: [2, 1],
          });
          updateBudget({ totalBudget: 200000 });
        }}
      >
        Configure Execution
      </button>
      <button type='button' onClick={() => updateLevel({ phase: 'test' })}>
        Enter Test
      </button>
      <button
        type='button'
        onClick={() => setCampaignUuid('different-campaign-uuid')}
      >
        Change Campaign
      </button>
      <output data-testid='preview-state'>
        {JSON.stringify({
          preview: campaignData.segment.smartTargetingTestPreview,
          stale: campaignData.segment.smartTargetingTestPreviewStale,
          budget: campaignData.budget.totalBudget,
          uuid: campaignData.uuid,
        })}
      </output>
    </>
  );
};

const ExecutionReservationInvalidationProbe = () => {
  const { campaignData, setCampaignUuid, updateLevel, updateBudget } =
    useCampaign();
  const configureReservation = () => {
    setCampaignUuid('campaign-uuid');
    updateLevel({
      audienceTargetingMethod: 'smart_targeting',
      phase: 'execution',
      platform: 'sms',
      bundleId: 12,
      selectedTagIds: [2, 1],
      smartTargetingScoreClasses: ['A'],
    });
    updateBudget({ totalBudget: 100000 });
  };
  const applyReservation = () => {
    const inputKey =
      getSmartTargetingExecutionCalculationInputKey(campaignData);
    updateLevel({
      smartTargetingExecutionReservation: {
        phase: 'polling',
        input_key: inputKey,
        calculation: {
          calculation_id: 91,
          campaign_id: 7,
          bundle_id: 12,
          requested_audience_count: 1200,
          status: 'pending',
          is_current: false,
          recalculation_required: false,
          created_at: '2026-09-19T10:00:00Z',
        },
      },
    });
  };
  const applyExactCapacity = () => {
    const inputKey =
      getSmartTargetingExecutionCalculationInputKey(campaignData);
    updateLevel({
      smartTargetingCapacityCalculation: {
        calculation_id: 42,
        campaign_id: 7,
        bundle_id: 12,
        status: 'calculated',
        is_current: true,
        recalculation_required: false,
        selected_score_classes: ['A'],
        selected_tag_count: 2,
        usable_unique_audience_count: 1200,
        created_at: '2026-09-19T10:00:00Z',
      },
      smartTargetingExactCapacityInputKey: inputKey,
    });
  };
  return (
    <>
      <button type='button' onClick={configureReservation}>
        Configure Reservation
      </button>
      <button type='button' onClick={applyReservation}>
        Apply Reservation
      </button>
      <button type='button' onClick={applyExactCapacity}>
        Apply Exact Capacity
      </button>
      <button
        type='button'
        onClick={() => updateBudget({ totalBudget: 100001 })}
      >
        Change Reservation Budget
      </button>
      <button
        type='button'
        onClick={() => setCampaignUuid('replacement-campaign-uuid')}
      >
        Change Reservation Campaign
      </button>
      <output data-testid='execution-reservation-state'>
        {JSON.stringify(campaignData.segment)}
      </output>
    </>
  );
};

describe('CampaignProvider draft hydration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('normalizes malformed and legacy localStorage fields safely', async () => {
    localStorage.setItem('campaign_creation_step', '99');
    localStorage.setItem(
      'campaign_creation_data',
      JSON.stringify({
        id: 2.5,
        uuid: 123,
        level: {
          campaignTitle: 99,
          level1: 'Consumers',
          level2s: ['Retail', null],
          level3s: 'invalid',
          platform: 'invalid',
          audienceTargetingMethod: 'smart_targeting',
          selectedTagIds: [2, 2, -1, '4'],
          smartTargetingSelectedRawCapacity: -10,
          audienceGrades: ['A', 'D', 'A'],
          city: ['Tehran', null, ''],
          bundleId: -1,
          phase: 'invalid',
        },
        content: {
          insertLink: 'yes',
          link: 5,
          text: 'Visit jo1n.ir/xxxxxx',
          shortLinkDomain: '',
          platformSettingsId: -1,
          mediaUuid: 4,
        },
        budget: { totalBudget: Number.NaN },
        payment: {
          termsAccepted: 'yes',
          finalCost: 1000,
          total: 1000,
          hasEnoughBalance: true,
        },
      })
    );

    render(
      <CampaignProvider>
        <CampaignProbe />
      </CampaignProvider>
    );

    const state = JSON.parse(
      screen.getByTestId('campaign-state').textContent || '{}'
    );
    expect(state.currentStep).toBe(1);
    expect(state.campaignData.id).toBeUndefined();
    expect(state.campaignData).toMatchObject({
      uuid: '',
      segment: {
        campaignTitle: '',
        level1: 'Consumers',
        level2s: ['Retail'],
        level3s: [],
        platform: 'sms',
        audienceTargetingMethod: 'smart_targeting',
        selectedTagIds: [2, 4],
        smartTargetingSelectedRawCapacity: 0,
        audienceGrades: ['A'],
        city: ['Tehran'],
        bundleId: null,
        phase: 'execution',
      },
      content: {
        insertLink: false,
        link: '',
        text: 'Visit {YOUR_LINK}',
        shortLinkDomain: null,
        platformSettingsId: null,
        mediaUuid: null,
      },
      budget: { totalBudget: 0 },
      payment: {
        termsAccepted: false,
      },
    });
    expect(state.campaignData.payment.finalCost).toBeUndefined();
    expect(state.campaignData.payment.total).toBeUndefined();
    expect(state.campaignData.payment.hasEnoughBalance).toBeUndefined();

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem('campaign_creation_data') || '{}'
      );
      expect({
        finalCost: stored.payment.finalCost,
        estimatedMessages: stored.budget.estimatedMessages,
      }).toEqual({
        finalCost: undefined,
        estimatedMessages: undefined,
      });
    });
  });

  it('discards a persisted Smart Targeting Test cost when no preview is restored', () => {
    localStorage.setItem(
      'campaign_creation_data',
      JSON.stringify({
        uuid: 'campaign-uuid',
        segment: {
          campaignTitle: 'Test campaign',
          platform: 'sms',
          audienceTargetingMethod: 'smart_targeting',
          selectedTagIds: [2, 1],
          bundleId: 12,
          phase: 'test',
          sampleSizePerTag: 600,
        },
        budget: { totalBudget: 84000 },
      })
    );

    render(
      <CampaignProvider>
        <CampaignProbe />
      </CampaignProvider>
    );

    const state = JSON.parse(
      screen.getByTestId('campaign-state').textContent || '{}'
    );
    expect(state.campaignData.segment.smartTargetingTestPreview).toBeNull();
    expect(state.campaignData.budget.totalBudget).toBe(0);
  });

  it('restores a pending execution reservation for payment-page polling', () => {
    localStorage.setItem('campaign_creation_step', '4');
    localStorage.setItem(
      'campaign_creation_data',
      JSON.stringify({
        uuid: 'campaign-uuid',
        segment: {
          campaignTitle: 'Execution campaign',
          platform: 'sms',
          audienceTargetingMethod: 'smart_targeting',
          selectedTagIds: [2, 1],
          smartTargetingScoreClasses: ['A'],
          bundleId: 12,
          phase: 'execution',
          smartTargetingExecutionReservation: {
            phase: 'polling',
            input_key: '12|1,2|A|sms|3000|100000|execution',
            calculation: {
              calculation_id: 91,
              campaign_id: 7,
              bundle_id: 12,
              requested_audience_count: 1200,
              status: 'pending',
              is_current: false,
              recalculation_required: false,
              created_at: '2026-09-19T10:00:00Z',
            },
          },
        },
        content: { lineNumber: '3000' },
        budget: { totalBudget: 100000 },
      })
    );

    render(
      <CampaignProvider>
        <CampaignProbe />
      </CampaignProvider>
    );

    const state = JSON.parse(
      screen.getByTestId('campaign-state').textContent || '{}'
    );
    expect(state.currentStep).toBe(4);
    expect(state.campaignData.segment).toMatchObject({
      smartTargetingExecutionReservation: {
        phase: 'polling',
        input_key: '12|1,2|A|sms|3000|100000|execution',
        calculation: { calculation_id: 91 },
      },
    });
  });

  it('keeps all campaign storage cleared after resetting state', async () => {
    localStorage.setItem('campaign_creation_step', '3');
    localStorage.setItem(
      'campaign_creation_data',
      JSON.stringify({
        id: 7,
        uuid: 'campaign-uuid',
        segment: {
          campaignTitle: 'Draft campaign',
          level1: 'Consumers',
        },
      })
    );
    localStorage.setItem(LEVEL_SELECTION_KEY, '{"campaignTitle":"Draft"}');

    render(
      <CampaignProvider>
        <ResetCampaignProbe />
      </CampaignProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(localStorage.getItem('campaign_creation_data')).toBeNull();
    });

    const state = JSON.parse(
      screen.getByTestId('campaign-state').textContent || '{}'
    );
    expect(state.currentStep).toBe(1);
    expect(state.campaignData.uuid).toBe('');
    expect(state.campaignData.segment.campaignTitle).toBe('');
    expect(localStorage.getItem('campaign_creation_step')).toBeNull();
    expect(localStorage.getItem(LEVEL_SELECTION_KEY)).toBeNull();
  });

  it('shares concurrent campaign creation attempts and stores one identity', async () => {
    let resolveCreate: (value: any) => void = () => {};
    const create = jestGlobals.fn(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        })
    );
    render(
      <CampaignProvider>
        <EnsureCampaignProbe create={create} />
      </CampaignProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create B' }));
    expect(create).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCreate({
        success: true,
        message: 'created',
        data: {
          message: 'created',
          id: 12,
          uuid: 'created-uuid',
          status: 'initiated',
          created_at: '2026-08-08T00:00:00Z',
        },
      });
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('creation-state').textContent || '{}')
      ).toEqual({ uuid: 'created-uuid', id: 12, pending: false })
    );
  });

  it('clears Test preview count and cost when effective inputs change', async () => {
    render(
      <CampaignProvider>
        <TestPreviewInvalidationProbe />
      </CampaignProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Configure Test' }));
    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('preview-state').textContent || '{}').uuid
      ).toBe('campaign-uuid')
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply Preview' }));
    await waitFor(() => {
      const state = JSON.parse(
        screen.getByTestId('preview-state').textContent || '{}'
      );
      expect(state).toMatchObject({
        preview: { effective_audience_count: 600 },
        budget: 84000,
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Change Sample' }));
    await waitFor(() => {
      const state = JSON.parse(
        screen.getByTestId('preview-state').textContent || '{}'
      );
      expect(state).toMatchObject({
        preview: null,
        stale: true,
        budget: 0,
      });
    });
  });

  it('invalidates a Test preview after Campaign content changes', async () => {
    render(
      <CampaignProvider>
        <TestPreviewInvalidationProbe />
      </CampaignProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Configure Test' }));
    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('preview-state').textContent || '{}').uuid
      ).toBe('campaign-uuid')
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply Preview' }));
    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('preview-state').textContent || '{}')
          .preview
      ).not.toBeNull()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Change Content' }));
    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('preview-state').textContent || '{}')
      ).toMatchObject({ preview: null, stale: true, budget: 0 })
    );
  });

  it('clears an Execution budget when entering an unpreviewed Test phase', async () => {
    render(
      <CampaignProvider>
        <TestPreviewInvalidationProbe />
      </CampaignProvider>
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Configure Execution' })
    );
    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('preview-state').textContent || '{}')
          .budget
      ).toBe(200000)
    );

    fireEvent.click(screen.getByRole('button', { name: 'Enter Test' }));
    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('preview-state').textContent || '{}')
      ).toMatchObject({ preview: null, budget: 0 })
    );
  });

  it('invalidates a Test preview when the Campaign context changes', async () => {
    render(
      <CampaignProvider>
        <TestPreviewInvalidationProbe />
      </CampaignProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Configure Test' }));
    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('preview-state').textContent || '{}').uuid
      ).toBe('campaign-uuid')
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply Preview' }));
    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('preview-state').textContent || '{}')
          .preview
      ).not.toBeNull()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Change Campaign' }));
    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('preview-state').textContent || '{}')
      ).toMatchObject({
        preview: null,
        stale: true,
        budget: 0,
        uuid: 'different-campaign-uuid',
      })
    );
  });

  it('clears a persisted execution reservation when its budget changes', async () => {
    render(
      <CampaignProvider>
        <ExecutionReservationInvalidationProbe />
      </CampaignProvider>
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Configure Reservation' })
    );
    await waitFor(() =>
      expect(
        JSON.parse(
          screen.getByTestId('execution-reservation-state').textContent || '{}'
        ).bundleId
      ).toBe(12)
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply Reservation' }));
    await waitFor(() =>
      expect(
        JSON.parse(
          screen.getByTestId('execution-reservation-state').textContent || '{}'
        ).smartTargetingExecutionReservation
      ).toMatchObject({ calculation: { calculation_id: 91 } })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Change Reservation Budget' })
    );
    await waitFor(() =>
      expect(
        JSON.parse(
          screen.getByTestId('execution-reservation-state').textContent || '{}'
        )
      ).toMatchObject({
        smartTargetingExecutionReservation: null,
        smartTargetingExactCapacityRequired: true,
      })
    );
  });

  it('clears exact-capacity and execution state when the campaign UUID changes', async () => {
    render(
      <CampaignProvider>
        <ExecutionReservationInvalidationProbe />
      </CampaignProvider>
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Configure Reservation' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply Reservation' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Apply Exact Capacity' })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Change Reservation Campaign' })
    );
    await waitFor(() =>
      expect(
        JSON.parse(
          screen.getByTestId('execution-reservation-state').textContent || '{}'
        )
      ).toMatchObject({
        smartTargetingExecutionReservation: null,
        smartTargetingCapacityCalculation: null,
        smartTargetingExactCapacityInputKey: null,
        smartTargetingExactCapacityRequired: true,
        smartTargetingExactCapacityForceFreshCalculation: true,
      })
    );
  });

  it('invalidates exact capacity before the first execution reservation', async () => {
    render(
      <CampaignProvider>
        <ExecutionReservationInvalidationProbe />
      </CampaignProvider>
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Configure Reservation' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Apply Exact Capacity' })
    );
    await waitFor(() =>
      expect(
        JSON.parse(
          screen.getByTestId('execution-reservation-state').textContent || '{}'
        ).smartTargetingCapacityCalculation
      ).toMatchObject({ calculation_id: 42 })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Change Reservation Budget' })
    );
    await waitFor(() =>
      expect(
        JSON.parse(
          screen.getByTestId('execution-reservation-state').textContent || '{}'
        )
      ).toMatchObject({
        smartTargetingCapacityCalculation: null,
        smartTargetingExactCapacityInputKey: null,
        smartTargetingExactCapacityForceFreshCalculation: true,
        smartTargetingExactCapacityInvalidatedCalculationId: 42,
      })
    );
  });
});
