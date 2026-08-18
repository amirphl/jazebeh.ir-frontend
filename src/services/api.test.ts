import {
  beforeEach,
  describe,
  expect,
  it,
  jest as jestGlobals,
} from '@jest/globals';
import { apiService } from './api';

describe('campaign creation API safety', () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(AbortSignal, 'timeout', {
      configurable: true,
      value: jestGlobals.fn(() => new AbortController().signal),
    });
    apiService.setAccessToken('access-token');
    jestGlobals.restoreAllMocks();
  });

  it('does not adopt another Campaign after an ambiguous POST response', async () => {
    const fetchMock = jestGlobals
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const response = await apiService.createCampaign({
      title: 'New sending',
      platform: 'sms',
      audience_targeting_method: 'smart_targeting',
      selected_tag_ids: [10],
      audience_grades: [],
      bundle_id: 12,
      phase: 'execution',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response).toMatchObject({
      success: false,
      error: { code: 'NETWORK_ERROR' },
    });
  });

  it('serializes an optional Smart Targeting capacity filter only when present', async () => {
    const fetchMock = jestGlobals.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    await apiService.listCampaignSmartTargetingTags('campaign-uuid', {
      page: 1,
      page_size: 20,
    });
    await apiService.listBundleSmartTargetingTags(12, {
      page: 1,
      page_size: 20,
      capacity: 0,
    });

    const campaignRequestUrl = String(fetchMock.mock.calls[0]?.[0]);
    const bundleRequestUrl = String(fetchMock.mock.calls[1]?.[0]);
    expect(campaignRequestUrl).not.toContain('capacity=');
    expect(bundleRequestUrl).toContain('capacity=0');
  });

  it('includes the capacity filter when auto-selecting campaign tags', async () => {
    const fetchMock = jestGlobals.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    await apiService.autoSelectCampaignSmartTargetingTags('campaign-uuid', {
      count: 5,
      capacity: 100,
    });

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      count: 5,
      capacity: 100,
    });
  });

  it('submits the Smart Targeting Test sampling job without a request body', async () => {
    const fetchMock = jestGlobals.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: 'ok',
          data: {
            calculation_id: 91,
            campaign_id: 7,
            bundle_id: 12,
            status: 'queued',
            is_current: true,
            recalculation_required: false,
            sample_size_per_tag: 600,
            tag_sampling_order: [2],
            selected_score_classes: ['A', 'B', 'C'],
            created_at: '2026-08-16T10:00:00Z',
          },
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    );

    const response =
      await apiService.startSmartTargetingTestSamplingCalculation(
        'campaign-uuid'
      );

    expect(response.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/campaigns/campaign-uuid/smart-targeting/test-sampling-preview'
      ),
      expect.objectContaining({ method: 'POST' })
    );
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBeUndefined();
    expect(AbortSignal.timeout).toHaveBeenCalledWith(30000);
  });

  it('allows an empty Smart Targeting selection to be saved', async () => {
    const fetchMock = jestGlobals.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    await apiService.replaceCampaignSmartTargetingSelection('campaign-uuid', {
      tag_ids: [],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/campaigns/campaign-uuid/smart-targeting/selection'
      ),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ tag_ids: [] }),
      })
    );
  });

  it('validates sampling calculation IDs before polling', async () => {
    const fetchMock = jestGlobals.spyOn(globalThis, 'fetch');

    const response =
      await apiService.getSmartTargetingTestSamplingCalculationById(
        'campaign-uuid',
        Number.MAX_SAFE_INTEGER + 1
      );

    expect(response).toMatchObject({
      success: false,
      error: { code: 'INVALID_CALCULATION_ID' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches current and by-ID sampling status without HTTP caching', async () => {
    const fetchMock = jestGlobals.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
    );

    await apiService.getCurrentSmartTargetingTestSamplingCalculation(
      'campaign uuid'
    );
    await apiService.getSmartTargetingTestSamplingCalculationById(
      'campaign uuid',
      91
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(
        '/campaigns/campaign%20uuid/smart-targeting/test-sampling-preview'
      ),
      expect.objectContaining({ method: 'GET', cache: 'no-store' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(
        '/campaigns/campaign%20uuid/smart-targeting/test-sampling-preview/91'
      ),
      expect.objectContaining({ method: 'GET', cache: 'no-store' })
    );
  });
});
