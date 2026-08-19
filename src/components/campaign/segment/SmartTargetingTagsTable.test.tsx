import React, { useState } from 'react';
import '@testing-library/jest-dom';
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
import type { Mocked } from 'jest-mock';
import SmartTargetingTagsTable from './SmartTargetingTagsTable';
import { campaignLevelI18n } from './segmentTranslations';
import { apiService } from '../../../services/api';

jestGlobals.mock('../../../services/api');

jestGlobals.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

jestGlobals.mock('../../../utils/errorHandler', () => ({
  getApiErrorMessage: (
    _response: unknown,
    _language: string,
    fallback: string
  ) => fallback,
}));

const copy = campaignLevelI18n.en.smartTargeting;
const mockedApiService = apiService as Mocked<typeof apiService>;

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const tag = (
  id: number,
  title: string,
  capacity: number,
  usedInBundle = false
) => ({
  tag_id: id,
  tag_display_title: title,
  used_in_bundle: usedInBundle,
  tag_capacity: capacity,
  bundle_persona_fit_score: null,
  evaluation_run_id: null,
  fit_level: null,
  relation_type: null,
  test_phase_avg_ctr: null,
  total_test_selected_count: null,
  total_test_sent_count: null,
  total_test_delivered_count: null,
  total_test_click_count: null,
  selected_count: null,
  sent_count: null,
  delivered_count: null,
  click_count: null,
  test_campaign_ctr: null,
  overall_avg_ctr: null,
  selected: false,
});

const tags = (from: number, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const id = from + index;
    return tag(id, `Tag ${id}`, id);
  });

const response = (
  items: ReturnType<typeof tag>[],
  page = 1,
  totalItems = items.length,
  totalPages = 1,
  selectedTagIds: number[] = [],
  selectedRawCapacity = 0
) => ({
  success: true,
  message: 'ok',
  data: {
    items,
    pagination: {
      page,
      limit: 20,
      total_items: totalItems,
      total_pages: totalPages,
    },
    selected_tag_ids: selectedTagIds,
    summary: {
      selected_tag_count: selectedTagIds.length,
      selected_raw_capacity: selectedRawCapacity,
    },
    evaluation_available: false,
    effective_sort_by: '',
    effective_sort_direction: '',
  },
});

const click = async (element: HTMLElement) => {
  // The local Testing Library setup does not wrap harness state updates.
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    fireEvent.click(element);
  });
};

const change = async (element: HTMLElement, value: string) => {
  // The local Testing Library setup does not wrap harness state updates.
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    fireEvent.change(element, { target: { value } });
  });
};

const SelectionHarness: React.FC<{
  campaignUuid?: string;
  useCampaignEndpoints?: boolean;
  initialTagIds?: number[];
  selectionIsDirty?: boolean;
  preserveSelectionOrder?: boolean;
}> = ({
  campaignUuid,
  useCampaignEndpoints = false,
  initialTagIds = [],
  selectionIsDirty = false,
  preserveSelectionOrder = false,
}) => {
  const [selectedTagIds, setSelectedTagIds] = useState(initialTagIds);
  const [selectedRawCapacity, setSelectedRawCapacity] = useState(0);
  const [orderPending, setOrderPending] = useState(false);

  return (
    <>
      <SmartTargetingTagsTable
        bundleId={12}
        campaignUuid={campaignUuid}
        useCampaignEndpoints={useCampaignEndpoints}
        selectedTagIds={selectedTagIds}
        selectedRawCapacity={selectedRawCapacity}
        selectionIsDirty={selectionIsDirty}
        preserveSelectionOrder={preserveSelectionOrder}
        onSelectionOrderSyncChange={setOrderPending}
        onSelectionChange={(ids, capacity) => {
          setSelectedTagIds(ids);
          setSelectedRawCapacity(capacity);
        }}
        copy={copy}
      />
      <output data-testid='selection'>{selectedTagIds.join(',')}</output>
      <output data-testid='order-pending'>{String(orderPending)}</output>
    </>
  );
};

describe('SmartTargetingTagsTable', () => {
  beforeEach(() => {
    jestGlobals.clearAllMocks();
  });

  it('marks tags that are used in the bundle with an accessible package icon', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockResolvedValue(
      response(
        [tag(1, 'Bundle tag', 10, true), tag(2, 'Other tag', 20)],
        1,
        2,
        1
      ) as any
    );

    render(<SelectionHarness />);

    const headers = await screen.findAllByRole('columnheader');
    expect(headers.map(header => header.textContent)).toEqual([
      copy.columns.selection,
      copy.columns.usedInBundle,
      copy.columns.tagDisplayTitle,
      copy.columns.tagCapacity,
      copy.columns.bundlePersonaFitScore,
      copy.columns.testPhaseAvgCtr,
      copy.columns.overallAvgCtr,
    ]);

    const indicator = screen.getByLabelText(copy.usedInBundleTooltip);
    expect(indicator.getAttribute('title')).toBe(copy.usedInBundleTooltip);
    expect(indicator.querySelector('svg')).toBeTruthy();
  });

  it('hides the bundle indicator for false, missing, or malformed values', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockResolvedValue(
      response(
        [
          tag(1, 'Not used', 10),
          { ...tag(2, 'Missing flag', 20), used_in_bundle: undefined },
          { ...tag(3, 'Malformed flag', 30), used_in_bundle: 'true' },
        ] as any,
        1,
        3,
        1
      ) as any
    );

    render(<SelectionHarness />);

    await screen.findByRole('checkbox', { name: 'Not used' });
    expect(screen.queryByLabelText(copy.usedInBundleTooltip)).toBeNull();
  });

  it('keeps manual selections when pagination changes', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockImplementation(
      async (_bundleId, params) =>
        Promise.resolve(
          params.page === 1
            ? response([tag(1, 'First tag', 10)], 1, 2, 2)
            : response([tag(2, 'Second tag', 20)], 2, 2, 2)
        ) as any
    );

    render(<SelectionHarness />);

    const first = await screen.findByRole('checkbox', { name: 'First tag' });
    await click(first);
    const nextButton = screen.getByRole('button', {
      name: copy.pagination.next,
    });
    await waitFor(() =>
      expect((nextButton as HTMLButtonElement).disabled).toBe(false)
    );
    await click(nextButton);

    const second = await screen.findByRole('checkbox', {
      name: 'Second tag',
    });
    await click(second);
    const previousButton = screen.getByRole('button', {
      name: copy.pagination.previous,
    });
    await waitFor(() =>
      expect((previousButton as HTMLButtonElement).disabled).toBe(false)
    );
    await click(previousButton);

    await waitFor(() => {
      expect(
        (
          screen.getByRole('checkbox', {
            name: 'First tag',
          }) as HTMLInputElement
        ).checked
      ).toBe(true);
    });
    expect(screen.getByTestId('selection').textContent).toContain('1,2');
  });

  it('clears the selected tags locally without reloading tag pages', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockResolvedValue(
      response(
        [tag(1, 'First tag', 10), tag(2, 'Second tag', 20)],
        1,
        2,
        1
      ) as any
    );

    render(<SelectionHarness initialTagIds={[1, 2]} />);

    await screen.findByRole('checkbox', { name: 'First tag' });
    const requestCountBeforeReset =
      mockedApiService.listBundleSmartTargetingTags.mock.calls.length;

    await click(screen.getByRole('button', { name: copy.resetSelection }));

    expect(screen.getByTestId('selection').textContent).toBe('');
    expect(
      mockedApiService.listBundleSmartTargetingTags.mock.calls.length
    ).toBe(requestCountBeforeReset);
  });

  it('keeps ordering pending until selected tags match the active table order', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockResolvedValue(
      response(
        [tag(2, 'Second tag', 20), tag(1, 'First tag', 10)],
        1,
        2,
        1,
        [1, 2],
        30
      ) as any
    );

    render(<SelectionHarness initialTagIds={[1, 2]} preserveSelectionOrder />);

    await waitFor(() =>
      expect(screen.getByTestId('order-pending').textContent).toBe('true')
    );
    await waitFor(() =>
      expect(screen.getByTestId('selection').textContent).toBe('2,1')
    );
    expect(screen.getByTestId('order-pending').textContent).toBe('false');
  });

  it('keeps order synchronization active while search text changes', async () => {
    let resolveOrderRequest: (value: any) => void = () => {};
    let orderSignal: AbortSignal | undefined;
    mockedApiService.listBundleSmartTargetingTags.mockImplementation(
      async (_bundleId, params, signal) => {
        if (params.page_size === 100) {
          orderSignal = signal;
          return new Promise(resolve => {
            resolveOrderRequest = resolve;
          });
        }
        return response(
          [tag(1, 'First tag', 10), tag(2, 'Second tag', 20)],
          1,
          2,
          1,
          [1, 2],
          30
        ) as any;
      }
    );

    render(<SelectionHarness initialTagIds={[1, 2]} preserveSelectionOrder />);

    await waitFor(() => expect(orderSignal).toBeDefined());
    await change(
      screen.getByRole('searchbox', { name: copy.searchLabel }),
      'First'
    );
    expect(orderSignal?.aborted).toBe(false);

    await act(async () => {
      resolveOrderRequest(
        response(
          [tag(1, 'First tag', 10), tag(2, 'Second tag', 20)],
          1,
          2,
          1,
          [1, 2],
          30
        )
      );
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(screen.getByTestId('order-pending').textContent).toBe('false')
    );
  });

  it('loads and appends the next page when the table viewport is scrolled', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockImplementation(
      async (_bundleId, params) =>
        Promise.resolve(
          params.page === 1
            ? response([tag(1, 'First tag', 10)], 1, 2, 2)
            : response([tag(2, 'Second tag', 20)], 2, 2, 2)
        ) as any
    );

    render(<SelectionHarness />);
    await screen.findByRole('checkbox', { name: 'First tag' });

    const viewport = screen.getByRole('region', { name: copy.title });
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 500 },
      scrollHeight: { configurable: true, value: 1000 },
      scrollTop: { configurable: true, value: 400 },
    });
    fireEvent.scroll(viewport);

    await screen.findByRole('checkbox', { name: 'Second tag' });
    expect(screen.getByRole('checkbox', { name: 'First tag' })).toBeTruthy();
  });

  it('uses the bundle endpoint for an unsaved Smart Targeting context', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockResolvedValue(
      response([tag(1, 'Bundle tag', 10)]) as any
    );

    render(
      <SelectionHarness
        campaignUuid='campaign-uuid'
        useCampaignEndpoints={false}
      />
    );

    await screen.findByRole('checkbox', { name: 'Bundle tag' });
    expect(mockedApiService.listBundleSmartTargetingTags).toHaveBeenCalled();
    expect(
      mockedApiService.listCampaignSmartTargetingTags
    ).not.toHaveBeenCalled();
  });

  it('omits an empty capacity filter and sends an entered capacity', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockResolvedValue(
      response([tag(1, 'Bundle tag', 10)]) as any
    );

    render(<SelectionHarness />);
    await screen.findByRole('checkbox', { name: 'Bundle tag' });

    expect(
      mockedApiService.listBundleSmartTargetingTags.mock.calls[0]?.[1]
    ).toEqual(expect.objectContaining({ capacity: undefined }));

    await change(
      screen.getByRole('spinbutton', { name: copy.capacityLabel }),
      '100'
    );

    await waitFor(() =>
      expect(
        mockedApiService.listBundleSmartTargetingTags
      ).toHaveBeenLastCalledWith(
        12,
        expect.objectContaining({ capacity: 100, page: 1 }),
        expect.any(AbortSignal)
      )
    );
  });

  it('hydrates an authoritative empty persisted selection for a clean edit', async () => {
    const onSelectionChange = jestGlobals.fn();
    mockedApiService.listCampaignSmartTargetingTags.mockResolvedValue(
      response([tag(1, 'Persisted tag', 10)]) as any
    );

    render(
      <SmartTargetingTagsTable
        bundleId={12}
        campaignUuid='campaign-uuid'
        useCampaignEndpoints
        selectedTagIds={[1]}
        selectedRawCapacity={10}
        selectionIsDirty={false}
        onSelectionChange={onSelectionChange}
        copy={copy}
      />
    );

    await waitFor(() => {
      expect(onSelectionChange).toHaveBeenCalledWith([], 0, 'server');
    });
  });

  it('preserves an unsaved selection when the persisted response differs', async () => {
    const onSelectionChange = jestGlobals.fn();
    mockedApiService.listCampaignSmartTargetingTags.mockResolvedValue(
      response([tag(1, 'Dirty tag', 10)]) as any
    );

    render(
      <SmartTargetingTagsTable
        bundleId={12}
        campaignUuid='campaign-uuid'
        useCampaignEndpoints
        selectedTagIds={[1]}
        selectedRawCapacity={10}
        selectionIsDirty
        onSelectionChange={onSelectionChange}
        copy={copy}
      />
    );

    const checkbox = await screen.findByRole('checkbox', { name: 'Dirty tag' });
    expect((checkbox as HTMLInputElement).checked).toBe(true);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('uses the current search text for auto-selection before debounce completes', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockImplementation(
      async (_bundleId, params) =>
        Promise.resolve(
          params.search === 'Beta'
            ? response([tag(2, 'Beta tag', 20)])
            : response([tag(1, 'Initial tag', 10)])
        ) as any
    );

    render(<SelectionHarness />);
    await screen.findByRole('checkbox', { name: 'Initial tag' });

    await change(
      screen.getByRole('searchbox', { name: copy.searchLabel }),
      'Beta'
    );
    await change(
      screen.getByRole('spinbutton', {
        name: copy.autoSelectLabel,
      }),
      '1'
    );
    await click(screen.getByRole('button', { name: copy.autoSelectButton }));

    await waitFor(() => {
      expect(
        mockedApiService.listBundleSmartTargetingTags
      ).toHaveBeenCalledWith(
        12,
        expect.objectContaining({ search: 'Beta', page: 1 }),
        expect.any(AbortSignal)
      );
    });
    expect(screen.getByTestId('selection').textContent).toContain('2');
  });

  it('auto-selects tags when pagination reports total instead of total_items', async () => {
    const legacyPaginationResponse = response([tag(1, 'Available tag', 10)]);
    legacyPaginationResponse.data.pagination = {
      page: 1,
      limit: 20,
      total: 1,
      total_pages: 1,
    } as any;
    mockedApiService.listBundleSmartTargetingTags.mockResolvedValue(
      legacyPaginationResponse as any
    );

    render(<SelectionHarness />);
    await screen.findByRole('checkbox', { name: 'Available tag' });

    await change(
      screen.getByRole('spinbutton', { name: copy.autoSelectLabel }),
      '1'
    );
    await click(screen.getByRole('button', { name: copy.autoSelectButton }));

    await waitFor(() => {
      expect(screen.getByTestId('selection').textContent).toBe('1');
    });
    expect(screen.queryByText(copy.autoCountTooLarge)).toBeNull();
  });

  it('collects all required bundle pages for auto-selection', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockImplementation(
      async (_bundleId, params) =>
        Promise.resolve(
          params.page === 1
            ? response(tags(1, 100), 1, 101, 2)
            : response(tags(101, 1), 2, 101, 2)
        ) as any
    );

    render(<SelectionHarness />);
    await screen.findByRole('checkbox', { name: 'Tag 1' });

    await change(
      screen.getByRole('spinbutton', { name: copy.autoSelectLabel }),
      '101'
    );
    await click(screen.getByRole('button', { name: copy.autoSelectButton }));

    await waitFor(() => {
      expect(
        mockedApiService.listBundleSmartTargetingTags
      ).toHaveBeenCalledWith(
        12,
        expect.objectContaining({ page: 2, page_size: 100 }),
        expect.any(AbortSignal)
      );
    });
    expect(screen.getByTestId('selection').textContent).toContain('101');
  });

  it('uses the campaign auto-selection endpoint for a saved Smart Targeting campaign', async () => {
    mockedApiService.listCampaignSmartTargetingTags
      .mockResolvedValueOnce(response([tag(1, 'Persisted tag', 10)]) as any)
      .mockResolvedValue(
        response([tag(1, 'Persisted tag', 10)], 1, 1, 1, [1], 10) as any
      );
    mockedApiService.autoSelectCampaignSmartTargetingTags.mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        selected_tag_ids: [1],
        summary: {
          selected_tag_count: 1,
          selected_raw_capacity: 10,
        },
      },
    } as any);

    render(
      <SelectionHarness campaignUuid='campaign-uuid' useCampaignEndpoints />
    );
    await screen.findByRole('checkbox', { name: 'Persisted tag' });

    await change(
      screen.getByRole('spinbutton', { name: copy.capacityLabel }),
      '100'
    );
    await change(
      screen.getByRole('spinbutton', { name: copy.autoSelectLabel }),
      '1'
    );
    await click(screen.getByRole('button', { name: copy.autoSelectButton }));

    await waitFor(() => {
      expect(
        mockedApiService.autoSelectCampaignSmartTargetingTags
      ).toHaveBeenCalledWith(
        'campaign-uuid',
        expect.objectContaining({ count: 1, search: '', capacity: 100 }),
        expect.any(AbortSignal)
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('selection').textContent).toContain('1');
    });
  });

  it('keeps the campaign auto-selection when the following tag list is stale', async () => {
    mockedApiService.listCampaignSmartTargetingTags.mockResolvedValue(
      response([tag(1, 'Persisted tag', 10)]) as any
    );
    mockedApiService.autoSelectCampaignSmartTargetingTags.mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        selected_tag_ids: [1],
        summary: {
          selected_tag_count: 1,
          selected_raw_capacity: 10,
        },
      },
    } as any);

    render(
      <SelectionHarness campaignUuid='campaign-uuid' useCampaignEndpoints />
    );
    await screen.findByRole('checkbox', { name: 'Persisted tag' });

    await change(
      screen.getByRole('spinbutton', { name: copy.autoSelectLabel }),
      '1'
    );
    await click(screen.getByRole('button', { name: copy.autoSelectButton }));

    await waitFor(() => {
      expect(screen.getByTestId('selection').textContent).toBe('1');
    });
    expect(
      (
        screen.getByRole('checkbox', {
          name: 'Persisted tag',
        }) as HTMLInputElement
      ).checked
    ).toBe(true);
    await waitFor(() =>
      expect(
        mockedApiService.listCampaignSmartTargetingTags.mock.calls.length
      ).toBeGreaterThan(1)
    );
    expect(screen.getByTestId('selection').textContent).toBe('1');
  });

  it('reorders selected Test tags to the active table sort order', async () => {
    mockedApiService.listBundleSmartTargetingTags.mockImplementation(
      async (_bundleId, params) =>
        Promise.resolve(
          response(
            params.sort_by === 'tag_capacity'
              ? [tag(2, 'Second tag', 20), tag(1, 'First tag', 10)]
              : [tag(1, 'First tag', 10), tag(2, 'Second tag', 20)],
            1,
            2,
            1,
            [1, 2],
            30
          )
        ) as any
    );

    render(
      <SelectionHarness
        initialTagIds={[1, 2]}
        preserveSelectionOrder
        selectionIsDirty
      />
    );
    await screen.findByRole('checkbox', { name: 'First tag' });
    await change(
      screen.getByRole('combobox', { name: copy.sortByLabel }),
      'tag_capacity'
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('selection').textContent).toBe('2,1');
      },
      { timeout: 2000 }
    );
  });
});
