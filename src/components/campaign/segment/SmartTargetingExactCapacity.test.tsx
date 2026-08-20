import React from 'react';
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest as jestGlobals,
} from '@jest/globals';
import type { Mocked } from 'jest-mock';
import { apiService } from '../../../services/api';
import { campaignLevelI18n } from './segmentTranslations';
import SmartTargetingExactCapacity from './SmartTargetingExactCapacity';

jestGlobals.mock('../../../services/api');
jestGlobals.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: 'access-token' }),
}));
jestGlobals.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

const mockedApiService = apiService as Mocked<typeof apiService>;
const copy = campaignLevelI18n.en.smartTargeting.exactCapacity;

const calculation = (overrides: Record<string, unknown> = {}) => ({
  calculation_id: 42,
  campaign_id: 7,
  bundle_id: 3,
  status: 'calculated',
  is_current: true,
  recalculation_required: false,
  selected_score_classes: ['A', 'B', 'C'],
  selected_tag_count: 1,
  raw_audience_count: 1500,
  eligible_unique_audience_count_before_approved_campaign_deduction: 900,
  approved_campaign_audience_deduction: 100,
  usable_unique_audience_count: 800,
  created_at: '2026-08-03T10:00:00Z',
  ...overrides,
});

const defaultProps = () => ({
  campaignUuid: 'campaign-uuid',
  selectedTagIds: [10],
  selectedRawCapacity: 1500,
  selectionIsDirty: false,
  selectedScoreClasses: [],
  scoreClassesAreDirty: false,
  initialCalculation: null,
  onSelectionPersisted: jestGlobals.fn(),
  onScoreClassesChange: jestGlobals.fn(),
  onCalculationChange: jestGlobals.fn(),
  copy,
});

describe('SmartTargetingExactCapacity', () => {
  beforeEach(() => {
    jestGlobals.clearAllMocks();
    mockedApiService.getCurrentSmartTargetingCapacityCalculation.mockResolvedValue(
      {
        success: false,
        message: 'not found',
        error: { code: 'NOT_FOUND' },
      }
    );
  });

  afterEach(() => {
    jestGlobals.useRealTimers();
  });

  it('persists the full dirty selection before starting a calculation', async () => {
    const props = { ...defaultProps(), selectionIsDirty: true };
    mockedApiService.replaceCampaignSmartTargetingSelection.mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        selected_tag_ids: [10],
        summary: { selected_tag_count: 1, selected_raw_capacity: 1500 },
      },
    });
    mockedApiService.startSmartTargetingCapacityCalculation.mockResolvedValue({
      success: true,
      message: 'accepted',
      data: calculation({
        status: 'calculating',
        raw_audience_count: null,
        eligible_unique_audience_count_before_approved_campaign_deduction: null,
        approved_campaign_audience_deduction: null,
        usable_unique_audience_count: null,
      }) as any,
    });

    render(<SmartTargetingExactCapacity {...props} />);
    const calculateButton = screen.getByRole('button', {
      name: copy.calculate,
    });
    await waitFor(() =>
      expect((calculateButton as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(
        mockedApiService.replaceCampaignSmartTargetingSelection
      ).toHaveBeenCalledWith(
        'campaign-uuid',
        { tag_ids: [10] },
        expect.any(AbortSignal)
      );
    });
    await waitFor(() => {
      expect(
        mockedApiService.startSmartTargetingCapacityCalculation
      ).toHaveBeenCalledWith(
        'campaign-uuid',
        { score_classes: ['A', 'B', 'C'] },
        expect.any(AbortSignal)
      );
    });
    expect(props.onSelectionPersisted).toHaveBeenCalledWith([10], 1500);
    expect(await screen.findByText(copy.calculationInProgress)).toBeTruthy();
  });

  it('keeps a historical calculation stale while a forced fresh calculation is required', async () => {
    const props = {
      ...defaultProps(),
      forceFreshCalculation: true,
      invalidatedCalculationId: 42,
    };
    mockedApiService.getCurrentSmartTargetingCapacityCalculation.mockResolvedValue(
      {
        success: true,
        message: 'ok',
        data: calculation() as any,
      }
    );

    render(<SmartTargetingExactCapacity {...props} />);

    expect(await screen.findByText(copy.recalculationRequired)).toBeTruthy();
    await waitFor(() =>
      expect(props.onCalculationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          calculation_id: 42,
          is_current: false,
          recalculation_required: true,
        }),
        'lookup'
      )
    );
  });

  it('does not accept a different calculation returned by a background lookup as fresh', async () => {
    const props = {
      ...defaultProps(),
      forceFreshCalculation: true,
      invalidatedCalculationId: 42,
    };
    mockedApiService.getCurrentSmartTargetingCapacityCalculation.mockResolvedValue(
      {
        success: true,
        message: 'ok',
        data: calculation({ calculation_id: 43 }) as any,
      }
    );

    render(<SmartTargetingExactCapacity {...props} />);

    await waitFor(() =>
      expect(props.onCalculationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          calculation_id: 43,
          is_current: false,
          recalculation_required: true,
        }),
        'lookup'
      )
    );
  });

  it('continues polling a pending historical calculation while fresh capacity is required', async () => {
    const props = {
      ...defaultProps(),
      forceFreshCalculation: true,
      invalidatedCalculationId: 42,
    };
    mockedApiService.getCurrentSmartTargetingCapacityCalculation.mockResolvedValue(
      {
        success: true,
        message: 'ok',
        data: calculation({
          calculation_id: 43,
          status: 'calculating',
          is_current: false,
          raw_audience_count: null,
          eligible_unique_audience_count_before_approved_campaign_deduction:
            null,
          approved_campaign_audience_deduction: null,
          usable_unique_audience_count: null,
        }) as any,
      }
    );

    render(<SmartTargetingExactCapacity {...props} />);

    expect(await screen.findByText(copy.calculationInProgress)).toBeTruthy();
    await waitFor(() =>
      expect(props.onCalculationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          calculation_id: 43,
          status: 'calculating',
          recalculation_required: false,
        }),
        'lookup'
      )
    );
  });

  it('preserves ordered Test tags while using the shared score-class selection', async () => {
    const props = {
      ...defaultProps(),
      selectedTagIds: [20, 10],
      selectedRawCapacity: 2500,
      selectionIsDirty: true,
      selectedScoreClasses: ['A'] as Array<'A'>,
      preserveSelectionOrder: true,
      showScoreClassSelector: false,
      syncScoreClassesFromCalculation: false,
    };
    mockedApiService.replaceCampaignSmartTargetingSelection.mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        selected_tag_ids: [20, 10],
        summary: { selected_tag_count: 2, selected_raw_capacity: 2500 },
      },
    });
    mockedApiService.startSmartTargetingCapacityCalculation.mockResolvedValue({
      success: true,
      message: 'accepted',
      data: calculation({
        status: 'calculating',
        selected_score_classes: ['A'],
        selected_tag_count: 2,
        raw_audience_count: null,
        eligible_unique_audience_count_before_approved_campaign_deduction: null,
        approved_campaign_audience_deduction: null,
        usable_unique_audience_count: null,
      }) as any,
    });

    render(<SmartTargetingExactCapacity {...props} />);

    expect(screen.queryByRole('checkbox')).toBeNull();
    const calculateButton = screen.getByRole('button', {
      name: copy.calculate,
    });
    await waitFor(() =>
      expect((calculateButton as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(calculateButton);

    await waitFor(() =>
      expect(
        mockedApiService.replaceCampaignSmartTargetingSelection
      ).toHaveBeenCalledWith(
        'campaign-uuid',
        { tag_ids: [20, 10] },
        expect.any(AbortSignal)
      )
    );
    expect(props.onSelectionPersisted).toHaveBeenCalledWith([20, 10], 2500);
    expect(props.onScoreClassesChange).not.toHaveBeenCalled();
  });

  it('restores and displays every backend capacity value, including zero', async () => {
    mockedApiService.getCurrentSmartTargetingCapacityCalculation.mockResolvedValue(
      {
        success: true,
        message: 'ok',
        data: calculation({ usable_unique_audience_count: 0 }) as any,
      }
    );

    render(<SmartTargetingExactCapacity {...defaultProps()} />);

    expect(await screen.findByText(copy.zeroCapacity)).toBeTruthy();
    expect(screen.getByText(copy.eligibleBeforeDeduction)).toBeTruthy();
    expect(screen.getByText(copy.approvedDeduction)).toBeTruthy();
    expect(screen.getByText(copy.exactUsableCapacity)).toBeTruthy();
    expect(screen.getByText(`0 ${copy.audiences}`)).toBeTruthy();
  });

  it('marks a restored result stale and hides its usable value after tags change', async () => {
    mockedApiService.getCurrentSmartTargetingCapacityCalculation.mockResolvedValue(
      {
        success: true,
        message: 'ok',
        data: calculation() as any,
      }
    );
    const props = defaultProps();
    const { rerender } = render(<SmartTargetingExactCapacity {...props} />);

    expect(await screen.findByText(`800 ${copy.audiences}`)).toBeTruthy();
    rerender(
      <SmartTargetingExactCapacity
        {...props}
        selectedTagIds={[10, 20]}
        selectionIsDirty
      />
    );

    expect(await screen.findByText(copy.recalculationMessage)).toBeTruthy();
    expect(screen.queryByText(`800 ${copy.audiences}`)).toBeNull();
  });

  it('disables calculation until an unsaved Campaign has complete data', () => {
    const props = defaultProps();
    render(<SmartTargetingExactCapacity {...props} campaignUuid={undefined} />);

    expect(
      (
        screen.getByRole('button', {
          name: copy.calculate,
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(screen.getByText(copy.completeCampaignDataFirst)).toBeTruthy();
  });

  it('creates an unsaved Campaign once and then starts its calculation', async () => {
    const props = defaultProps();
    const ensureCampaignCreated = jestGlobals.fn(async () => ({
      success: true,
      uuid: 'created-campaign-uuid',
      created: true,
    }));
    mockedApiService.startSmartTargetingCapacityCalculation.mockResolvedValue({
      success: true,
      message: 'accepted',
      data: calculation({ status: 'calculating' }) as any,
    });

    render(
      <SmartTargetingExactCapacity
        {...props}
        campaignUuid={undefined}
        canCreateCampaign
        ensureCampaignCreated={ensureCampaignCreated}
      />
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: copy.calculate,
      })
    );

    await waitFor(() => expect(ensureCampaignCreated).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        mockedApiService.startSmartTargetingCapacityCalculation
      ).toHaveBeenCalledWith(
        'created-campaign-uuid',
        { score_classes: ['A', 'B', 'C'] },
        expect.any(AbortSignal)
      )
    );
    expect(
      mockedApiService.replaceCampaignSmartTargetingSelection
    ).not.toHaveBeenCalled();
    expect(props.onSelectionPersisted).toHaveBeenCalledWith([10], 1500);
  });

  it('prepares an existing Campaign before starting its calculation', async () => {
    const props = { ...defaultProps(), selectionIsDirty: true };
    const ensureCampaignCreated = jestGlobals.fn(async () => ({
      success: true,
      uuid: 'campaign-uuid',
      created: false,
      selectionPersisted: true,
    }));
    mockedApiService.startSmartTargetingCapacityCalculation.mockResolvedValue({
      success: true,
      message: 'accepted',
      data: calculation({ status: 'calculating' }) as any,
    });

    render(
      <SmartTargetingExactCapacity
        {...props}
        ensureCampaignCreated={ensureCampaignCreated}
      />
    );
    const button = screen.getByRole('button', { name: copy.calculate });
    await waitFor(() =>
      expect((button as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(button);

    await waitFor(() =>
      expect(ensureCampaignCreated).toHaveBeenCalledWith(
        expect.any(AbortSignal)
      )
    );
    await waitFor(() =>
      expect(
        mockedApiService.startSmartTargetingCapacityCalculation
      ).toHaveBeenCalled()
    );
    expect(
      mockedApiService.replaceCampaignSmartTargetingSelection
    ).not.toHaveBeenCalled();
    expect(props.onSelectionPersisted).toHaveBeenCalledWith([10], 1500);
  });

  it('polls every ten seconds and stops on completion', async () => {
    jestGlobals.useFakeTimers();
    mockedApiService.getCurrentSmartTargetingCapacityCalculation
      .mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: calculation({
          status: 'calculating',
          is_current: false,
          recalculation_required: true,
          raw_audience_count: null,
          eligible_unique_audience_count_before_approved_campaign_deduction:
            null,
          approved_campaign_audience_deduction: null,
          usable_unique_audience_count: null,
        }) as any,
      })
      .mockResolvedValue({
        success: true,
        message: 'ok',
        data: calculation() as any,
      });
    mockedApiService.getSmartTargetingCapacityCalculationById.mockResolvedValue(
      {
        success: true,
        message: 'ok',
        data: calculation() as any,
      }
    );

    render(<SmartTargetingExactCapacity {...defaultProps()} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    act(() => jestGlobals.advanceTimersByTime(9_999));
    expect(
      mockedApiService.getSmartTargetingCapacityCalculationById
    ).not.toHaveBeenCalled();

    await act(async () => {
      jestGlobals.advanceTimersByTime(1);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(
      mockedApiService.getSmartTargetingCapacityCalculationById
    ).toHaveBeenCalledTimes(1);
    expect(screen.getByText(`800 ${copy.audiences}`)).toBeTruthy();

    await act(async () => {
      jestGlobals.advanceTimersByTime(60_000);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(
      mockedApiService.getSmartTargetingCapacityCalculationById
    ).toHaveBeenCalledTimes(1);
  });

  it('replaces the calculate button while exact capacity is calculating', async () => {
    mockedApiService.getCurrentSmartTargetingCapacityCalculation.mockResolvedValue(
      {
        success: true,
        message: 'ok',
        data: calculation({
          status: 'calculating',
          raw_audience_count: null,
          eligible_unique_audience_count_before_approved_campaign_deduction:
            null,
          approved_campaign_audience_deduction: null,
          usable_unique_audience_count: null,
        }) as any,
      }
    );

    render(<SmartTargetingExactCapacity {...defaultProps()} />);

    expect(
      await screen.findByTestId('smart-targeting-capacity-spinner')
    ).toBeTruthy();
    const indicator = screen.getByRole('button', { name: copy.calculating });
    expect(indicator.getAttribute('aria-busy')).toBe('true');
    expect(screen.queryByRole('button', { name: copy.calculate })).toBeNull();
  });

  it('shows the loading icon while the calculation request is still starting', async () => {
    let resolveStart: (value: any) => void = () => {};
    mockedApiService.startSmartTargetingCapacityCalculation.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveStart = resolve;
        })
    );

    render(<SmartTargetingExactCapacity {...defaultProps()} />);
    const button = screen.getByRole('button', { name: copy.calculate });
    await waitFor(() =>
      expect((button as HTMLButtonElement).disabled).toBe(false)
    );

    fireEvent.click(button);

    const startingButton = await screen.findByRole('button', {
      name: copy.starting,
    });
    expect(startingButton.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByTestId('smart-targeting-capacity-spinner')).toBeTruthy();

    await act(async () => {
      resolveStart({
        success: false,
        message: 'failed',
        error: { code: 'SMART_TARGETING_CAPACITY_FAILED' },
      });
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(
        (
          screen.getByRole('button', {
            name: copy.calculate,
          }) as HTMLButtonElement
        ).disabled
      ).toBe(false)
    );
    expect(screen.queryByTestId('smart-targeting-capacity-spinner')).toBeNull();
  });

  it.each(['stale', 'expired', 'calculated', 'not_calculated', 'failed'])(
    'shows the calculate button when exact-capacity status is %s',
    async status => {
      mockedApiService.getCurrentSmartTargetingCapacityCalculation.mockResolvedValue(
        {
          success: true,
          message: 'ok',
          data: calculation({ status }) as any,
        }
      );

      render(<SmartTargetingExactCapacity {...defaultProps()} />);

      const button = await screen.findByRole('button', {
        name: copy.calculate,
      });
      await waitFor(() =>
        expect(button.getAttribute('aria-busy')).toBe('false')
      );
      expect((button as HTMLButtonElement).disabled).toBe(false);
      expect(
        screen.queryByTestId('smart-targeting-capacity-spinner')
      ).toBeNull();
    }
  );

  it('re-enables calculation after a terminal polling error', async () => {
    jestGlobals.useFakeTimers();
    mockedApiService.getCurrentSmartTargetingCapacityCalculation.mockResolvedValue(
      {
        success: true,
        message: 'ok',
        data: calculation({
          status: 'calculating',
          raw_audience_count: null,
          eligible_unique_audience_count_before_approved_campaign_deduction:
            null,
          approved_campaign_audience_deduction: null,
          usable_unique_audience_count: null,
        }) as any,
      }
    );
    mockedApiService.getSmartTargetingCapacityCalculationById.mockResolvedValue(
      {
        success: false,
        message: 'not found',
        error: { code: 'SMART_TARGETING_CAPACITY_CALCULATION_NOT_FOUND' },
      }
    );

    render(<SmartTargetingExactCapacity {...defaultProps()} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      jestGlobals.advanceTimersByTime(10_000);
      await Promise.resolve();
      await Promise.resolve();
    });

    const button = screen.getByRole('button', { name: copy.calculate });
    expect((button as HTMLButtonElement).disabled).toBe(false);
    expect(screen.queryByTestId('smart-targeting-capacity-spinner')).toBeNull();
  });

  it('periodically refreshes a completed result and applies backend invalidation', async () => {
    jestGlobals.useFakeTimers();
    mockedApiService.getCurrentSmartTargetingCapacityCalculation
      .mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: calculation() as any,
      })
      .mockResolvedValue({
        success: true,
        message: 'ok',
        data: calculation({
          status: 'recalculation_required',
          is_current: false,
          recalculation_required: true,
        }) as any,
      });

    render(<SmartTargetingExactCapacity {...defaultProps()} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText(`800 ${copy.audiences}`)).toBeTruthy();

    await act(async () => {
      jestGlobals.advanceTimersByTime(10_000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(
      mockedApiService.getCurrentSmartTargetingCapacityCalculation
    ).toHaveBeenCalledTimes(2);
    expect(screen.getByText(copy.recalculationMessage)).toBeTruthy();
    expect(screen.queryByText(`800 ${copy.audiences}`)).toBeNull();
  });

  it('adopts a pending calculation returned by a duplicate start conflict', async () => {
    mockedApiService.startSmartTargetingCapacityCalculation.mockResolvedValue({
      success: false,
      message: 'pending',
      error: {
        code: 'SMART_TARGETING_CAPACITY_PENDING',
        details: calculation({
          status: 'calculating',
          raw_audience_count: null,
          eligible_unique_audience_count_before_approved_campaign_deduction:
            null,
          approved_campaign_audience_deduction: null,
          usable_unique_audience_count: null,
        }),
      },
    });
    const props = defaultProps();

    render(<SmartTargetingExactCapacity {...props} />);
    const button = screen.getByRole('button', { name: copy.calculate });
    await waitFor(() =>
      expect((button as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(button);

    expect(await screen.findByText(copy.calculationInProgress)).toBeTruthy();
    expect(props.onCalculationChange).toHaveBeenCalledWith(
      expect.objectContaining({ calculation_id: 42, status: 'calculating' }),
      'lookup'
    );
  });
});
