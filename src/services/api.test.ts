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

describe('campaign audience click-report export API', () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(AbortSignal, 'timeout', {
      configurable: true,
      value: jestGlobals.fn(() => new AbortController().signal),
    });
    apiService.setAccessToken('access-token');
    jestGlobals.restoreAllMocks();
  });

  it('posts one normalized campaign ID payload with auth and downloads Excel', async () => {
    const report = new Blob(['report'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const fetchMock = jestGlobals.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(report, {
        status: 200,
        headers: {
          'content-type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'content-disposition':
            'attachment; filename="campaign_audience_click_report.xlsx"',
        },
      })
    );

    const response = await apiService.exportCampaignAudienceClickReport([
      17, 4, 17, -1,
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/campaigns/audience-click-report'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ campaign_ids: [17, 4] }),
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
          'content-type': 'application/json',
        }),
      })
    );
    expect(AbortSignal.timeout).toHaveBeenCalledWith(130000);
    expect(response).toMatchObject({
      success: true,
      filename: 'campaign_audience_click_report.xlsx',
    });
    expect(response.blob).toBeInstanceOf(Blob);
  });

  it('does not make a request when no valid campaign IDs are supplied', async () => {
    const fetchMock = jestGlobals.spyOn(globalThis, 'fetch');

    const response = await apiService.exportCampaignAudienceClickReport([
      0, -2,
    ]);

    expect(response).toEqual({
      success: false,
      message: 'CAMPAIGN_IDS_REQUIRED',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [400, 'CAMPAIGN_IDS_LIMIT_EXCEEDED', 'CAMPAIGN_IDS_LIMIT_EXCEEDED'],
    [401, 'MISSING_CUSTOMER_ID', 'UNAUTHORIZED'],
    [404, 'AUDIENCE_REPORT_NOT_AVAILABLE', 'AUDIENCE_REPORT_NOT_AVAILABLE'],
    [413, 'CAMPAIGN_REPORT_TOO_LARGE', 'CAMPAIGN_REPORT_TOO_LARGE'],
    [
      500,
      'CAMPAIGN_AUDIENCE_CLICK_REPORT_EXPORT_FAILED',
      'CAMPAIGN_AUDIENCE_CLICK_REPORT_EXPORT_FAILED',
    ],
  ])(
    'normalizes HTTP %s export failures',
    async (status, code, expectedCode) => {
      jestGlobals.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ error: { code } }), {
          status,
          headers: { 'content-type': 'application/json' },
        })
      );

      const response = await apiService.exportCampaignAudienceClickReport([17]);

      expect(response).toEqual({ success: false, message: expectedCode });
    }
  );

  it('rejects a successful non-Excel response as invalid', async () => {
    jestGlobals.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('not an Excel report', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      })
    );

    await expect(
      apiService.exportCampaignAudienceClickReport([17])
    ).resolves.toEqual({
      success: false,
      message: 'INVALID_RESPONSE',
    });
  });

  it.each([
    [new TypeError('Failed to fetch'), 'NETWORK_ERROR'],
    [new DOMException('Aborted', 'AbortError'), 'TIMEOUT_ERROR'],
    [new DOMException('Timed out', 'TimeoutError'), 'TIMEOUT_ERROR'],
  ])('normalizes connection failures', async (error, expectedCode) => {
    jestGlobals.spyOn(globalThis, 'fetch').mockRejectedValue(error);

    await expect(
      apiService.exportCampaignAudienceClickReport([17])
    ).resolves.toEqual({
      success: false,
      message: expectedCode,
    });
  });
});
