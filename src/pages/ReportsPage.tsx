import React, { useEffect, useState, useRef, useMemo } from 'react';
import { apiService } from '../services/api';
import { getApiErrorMessage } from '../utils/errorHandler';
import {
  AudienceTargetingMethod,
  CampaignPlatform,
  GetCampaignResponse,
  ListSMSCampaignsParams,
} from '../types/campaign';
import { useAuth } from '../hooks/useAuth';
import { useCampaign } from '../hooks/useCampaign';
import { useNavigation } from '../contexts/NavigationContext';
import { useLanguage } from '../hooks/useLanguage';
import FiltersBar, { ReportsOrderBy } from './reports/components/FiltersBar';
import CampaignsTable from './reports/components/CampaignsTable';
import ReportDetailsModal from './reports/components/ReportDetailsModal';
import BulkHideActionBar from './reports/components/BulkHideActionBar';
import BulkUnhideActionBar from './reports/components/BulkUnhideActionBar';
import BulkClickReportActionBar from './reports/components/BulkClickReportActionBar';
import { useHideCampaigns } from './reports/hooks/useHideCampaigns';
import { useUnhideCampaigns } from './reports/hooks/useUnhideCampaigns';
import { useCampaignAudienceClickReportExport } from './reports/hooks/useCampaignAudienceClickReportExport';
import { getReportsCopy } from './reports/translations';
import { useToast } from '../hooks/useToast';
import { normalizeCampaignResponseToDraft } from '../utils/campaignCreationDraft';

type CampaignPhaseFilter = ListSMSCampaignsParams['phase'] | '';

const isAudienceTargetingMethod = (
  value: unknown
): value is AudienceTargetingMethod =>
  value === 'standard' || value === 'smart_targeting' || value === 'excel';

const ReportsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const { showError } = useToast();
  const { language } = useLanguage();
  const copy = useMemo(() => getReportsCopy(language), [language]);
  const { replaceCampaignData } = useCampaign();
  const { navigate } = useNavigation();
  const [items, setItems] = useState<GetCampaignResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);
  const [orderBy, setOrderBy] = useState<ReportsOrderBy>('newest');

  const [campaignTitleInput, setCampaignTitleInput] = useState('');
  const [campaignTitleFilter, setCampaignTitleFilter] = useState('');
  const campaignTitleDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [bundleIdFilter, setBundleIdFilter] = useState<number | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<CampaignPhaseFilter>('');
  const [platformFilter, setPlatformFilter] = useState<CampaignPlatform | ''>(
    ''
  );
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [bulkHideMode, setBulkHideMode] = useState(false);
  const [bulkUnhideMode, setBulkUnhideMode] = useState(false);
  const [bulkClickReportMode, setBulkClickReportMode] = useState(false);
  const [showHiddenCampaigns, setShowHiddenCampaigns] = useState(false);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<number[]>([]);
  const bulkClickReportFilterKey = [
    bundleIdFilter,
    campaignTitleFilter,
    phaseFilter,
    platformFilter,
    startDateFilter,
    endDateFilter,
    showHiddenCampaigns,
  ].join('|');
  const bulkClickReportFilterKeyRef = useRef(bulkClickReportFilterKey);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<GetCampaignResponse | null>(null);

  // Guards for double-invocation (StrictMode) and concurrent fetches
  const isFetchingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const fixRestartInFlightRef = useRef(false);

  const { hideCampaigns, isSubmitting: isHidingCampaigns } = useHideCampaigns({
    copy,
    onHidden: hiddenCampaignIds => {
      const hiddenCampaignIdSet = new Set(hiddenCampaignIds);
      setItems(prevItems =>
        prevItems.map(item =>
          item.id != null && hiddenCampaignIdSet.has(item.id)
            ? { ...item, hidden: true }
            : item
        )
      );
      setSelectedCampaignIds([]);
      setBulkHideMode(false);
    },
  });

  const { unhideCampaigns, isSubmitting: isUnhidingCampaigns } =
    useUnhideCampaigns({
      copy,
      onUnhidden: unhiddenCampaignIds => {
        const unhiddenCampaignIdSet = new Set(unhiddenCampaignIds);
        setItems(prevItems =>
          prevItems.map(item =>
            item.id != null && unhiddenCampaignIdSet.has(item.id)
              ? { ...item, hidden: false }
              : item
          )
        );
        setSelectedCampaignIds([]);
        setBulkUnhideMode(false);
      },
    });

  const {
    exportClickReport: exportCampaignAudienceClickReport,
    isExporting: isExportingCampaignAudienceClickReport,
  } = useCampaignAudienceClickReportExport(copy);

  // Track previous filter values to skip stale-page fetch when filters reset pagination
  const prevFiltersRef = useRef({
    orderBy,
    campaignTitleFilter,
    bundleIdFilter,
    phaseFilter,
    platformFilter,
    startDateFilter,
    endDateFilter,
  });

  // Initialize filters from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phaseParam = params.get('phase');
    const bundleIdParam = params.get('bundleId');

    if (phaseParam === 'test' || phaseParam === 'execution') {
      setPhaseFilter(phaseParam);
    }

    if (bundleIdParam) {
      const bundleId = Number(bundleIdParam);
      if (Number.isFinite(bundleId) && bundleId > 0) {
        setBundleIdFilter(bundleId);
      }
    }
  }, []);

  // Fetch campaigns whenever page/order/filter change
  useEffect(() => {
    if (!accessToken) {
      abortRef.current?.abort();
      abortRef.current = null;
      isFetchingRef.current = false;
      setItems([]);
      setSelected(null);
      setSelectedCampaignIds([]);
      setLoading(false);
      setError(null);
      setHasMore(true);
      return;
    }

    // When filters change while page > 1, skip: the reset effect will set page=1 and re-trigger
    const prev = prevFiltersRef.current;
    const filtersChanged =
      prev.orderBy !== orderBy ||
      prev.campaignTitleFilter !== campaignTitleFilter ||
      prev.bundleIdFilter !== bundleIdFilter ||
      prev.phaseFilter !== phaseFilter ||
      prev.platformFilter !== platformFilter ||
      prev.startDateFilter !== startDateFilter ||
      prev.endDateFilter !== endDateFilter;
    prevFiltersRef.current = {
      orderBy,
      campaignTitleFilter,
      bundleIdFilter,
      phaseFilter,
      platformFilter,
      startDateFilter,
      endDateFilter,
    };
    if (filtersChanged && page > 1) return;

    if (
      startDateFilter &&
      endDateFilter &&
      new Date(startDateFilter).getTime() > new Date(endDateFilter).getTime()
    ) {
      setError(copy.invalidDateRange);
      setLoading(false);
      setHasMore(false);
      isFetchingRef.current = false;
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchCampaigns = async () => {
      try {
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);
        apiService.setAccessToken(accessToken);

        const params: ListSMSCampaignsParams = {
          page,
          limit,
          orderby: orderBy,
        };
        if (campaignTitleFilter.trim()) {
          params.campaign_title = campaignTitleFilter.trim();
        }
        if (bundleIdFilter) params.bundle_id = bundleIdFilter;
        if (phaseFilter) params.phase = phaseFilter;
        if (platformFilter) params.platform = platformFilter;
        if (startDateFilter) params.start_date = startDateFilter;
        if (endDateFilter) params.end_date = endDateFilter;

        const res = await apiService.listCampaigns(params, controller.signal);
        if (controller.signal.aborted) return;

        if (res.success && res.data) {
          const newItems = res.data.items || [];
          setItems(prev => {
            if (page === 1) return newItems;
            const existingUuids = new Set(prev.map(item => item.uuid));
            return [
              ...prev,
              ...newItems.filter(item => !existingUuids.has(item.uuid)),
            ];
          });
          if (
            res.data.pagination &&
            typeof res.data.pagination.total_pages === 'number'
          ) {
            setHasMore(page < res.data.pagination.total_pages);
          } else {
            setHasMore(newItems.length === limit);
          }
        } else {
          const msg = res.message || 'Failed to load campaigns';
          setError(msg);
          setHasMore(false);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg =
          err instanceof Error ? err.message : 'Failed to load campaigns';
        setError(msg);
        setHasMore(false);
      } finally {
        if (abortRef.current === controller) {
          setLoading(false);
          isFetchingRef.current = false;
        }
      }
    };

    fetchCampaigns();

    return () => {
      controller.abort();
    };
  }, [
    accessToken,
    page,
    orderBy,
    campaignTitleFilter,
    bundleIdFilter,
    phaseFilter,
    platformFilter,
    startDateFilter,
    endDateFilter,
    copy.invalidDateRange,
  ]);

  useEffect(() => {
    if (!accessToken) return;
    setItems([]);
    setHasMore(true);
    setPage(1);
  }, [
    orderBy,
    campaignTitleFilter,
    bundleIdFilter,
    phaseFilter,
    platformFilter,
    startDateFilter,
    endDateFilter,
    accessToken,
  ]);

  const handleCampaignTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;
    setCampaignTitleInput(val);
    if (campaignTitleDebounceRef.current) {
      clearTimeout(campaignTitleDebounceRef.current);
    }
    campaignTitleDebounceRef.current = setTimeout(() => {
      setCampaignTitleFilter(val);
    }, 1000);
  };

  const handleTableScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (loading || !hasMore || isFetchingRef.current) return;

    const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
    const threshold = 200; // px from the table viewport's bottom
    if (scrollTop + clientHeight < scrollHeight - threshold) return;

    // Prevent multiple scroll events from requesting the same next page before
    // the effect that performs the request has started.
    isFetchingRef.current = true;
    setPage(prev => prev + 1);
  };

  const handleLoadMore = () => {
    if (loading || !hasMore || isFetchingRef.current) return;
    isFetchingRef.current = true;
    setPage(prev => prev + 1);
  };

  useEffect(
    () => () => {
      if (campaignTitleDebounceRef.current) {
        clearTimeout(campaignTitleDebounceRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (
      !bulkHideMode &&
      !bulkUnhideMode &&
      !bulkClickReportMode &&
      selectedCampaignIds.length > 0
    ) {
      setSelectedCampaignIds([]);
    }
  }, [
    bulkHideMode,
    bulkUnhideMode,
    bulkClickReportMode,
    selectedCampaignIds.length,
  ]);

  useEffect(() => {
    if (bulkClickReportFilterKeyRef.current === bulkClickReportFilterKey) {
      return;
    }

    bulkClickReportFilterKeyRef.current = bulkClickReportFilterKey;
    if (!bulkClickReportMode) return;

    setBulkClickReportMode(false);
    setSelectedCampaignIds([]);
  }, [bulkClickReportFilterKey, bulkClickReportMode]);

  useEffect(() => {
    const visibleCampaignIds = new Set(
      items
        .map(item => item.id)
        .filter(
          (campaignId): campaignId is number => typeof campaignId === 'number'
        )
    );

    setSelectedCampaignIds(prevSelectedIds => {
      if (prevSelectedIds.length === 0) {
        return prevSelectedIds;
      }

      const nextSelectedIds = prevSelectedIds.filter(campaignId =>
        visibleCampaignIds.has(campaignId)
      );

      return nextSelectedIds.length === prevSelectedIds.length
        ? prevSelectedIds
        : nextSelectedIds;
    });
  }, [items]);

  const openDetails = (c: GetCampaignResponse) => {
    setSelected(c);
    setShowModal(true);
  };

  const handleToggleCampaignSelection = (
    campaignId: number,
    selectedValue: boolean
  ) => {
    setSelectedCampaignIds(prevSelectedIds => {
      if (selectedValue) {
        return prevSelectedIds.includes(campaignId)
          ? prevSelectedIds
          : [...prevSelectedIds, campaignId];
      }

      return prevSelectedIds.filter(id => id !== campaignId);
    });
  };

  const handleBulkClickReportModeChange = (enabled: boolean) => {
    setBulkClickReportMode(enabled);
    if (enabled) {
      setSelectedCampaignIds([]);
    }
  };

  const truncateText = (text: string, max = 30) => {
    if (!text) return '-';
    const t = text.trim();
    return t.length <= max ? t : `${t.slice(0, max)}…`;
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const handleFixAndRestart = async () => {
    if (!selected || fixRestartInFlightRef.current) return;
    fixRestartInFlightRef.current = true;
    try {
      const audienceTargetingMethod = isAudienceTargetingMethod(
        selected.audience_targeting_method
      )
        ? selected.audience_targeting_method
        : selected.target_audience_excel_file_uuid != null
          ? 'excel'
          : 'standard';
      let selectedTagIds: number[] = [];
      let selectedRawCapacity = 0;

      if (audienceTargetingMethod === 'smart_targeting') {
        apiService.setAccessToken(accessToken || null);
        const response = await apiService.getCampaignSmartTargetingSelection(
          selected.uuid
        );
        if (!response.success || !response.data) {
          showError(
            getApiErrorMessage(
              response,
              language,
              language === 'fa'
                ? 'بازیابی انتخاب هدف‌گیری هوشمند ناموفق بود.'
                : 'Failed to restore the Smart Targeting selection.'
            )
          );
          return;
        }

        selectedTagIds = Array.from(
          new Set(
            (response.data.selected_tag_ids || []).filter(
              id => Number.isInteger(id) && id > 0
            )
          )
        );
        selectedRawCapacity = Math.max(
          0,
          response.data.summary?.selected_raw_capacity ?? 0
        );
      }

      const draft = normalizeCampaignResponseToDraft(selected, {
        id: null,
        uuid: '',
        clearSchedule: true,
        smartTargetingSelection: {
          selectedTagIds,
          selectedRawCapacity,
        },
        smartTargetingSelectionDirty:
          audienceTargetingMethod === 'smart_targeting' &&
          selectedTagIds.length > 0,
      });
      replaceCampaignData(draft, 1);
      navigate('/campaign-creation');
      closeModal();
    } catch {
      showError(
        language === 'fa'
          ? 'راه‌اندازی مجدد کمپین ناموفق بود.'
          : 'Failed to restart the campaign.'
      );
    } finally {
      fixRestartInFlightRef.current = false;
    }
  };

  const formatReportDateTime = (iso?: string) => {
    if (!iso) return '-';
    try {
      const jsDate = new Date(iso);
      if (language === 'en') {
        // Use user's local system time (server returns UTC)
        return jsDate.toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      }
      // For FA: convert UTC to Tehran time then format in Shamsi
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        timeZone: 'Asia/Tehran',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(jsDate);
    } catch {
      return '-';
    }
  };

  const displayedItems = bulkUnhideMode
    ? items.filter(item => item.hidden)
    : bulkHideMode
      ? items.filter(item => !item.hidden)
      : showHiddenCampaigns
        ? items
        : items.filter(item => !item.hidden);

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto flex w-full max-w-[1920px] flex-col px-2 py-8 sm:px-3 lg:px-4'>
        <FiltersBar
          language={language === 'fa' ? 'fa' : 'en'}
          campaignTitleInput={campaignTitleInput}
          onCampaignTitleChange={handleCampaignTitleChange}
          orderBy={orderBy}
          onOrderChange={setOrderBy}
          bundleIdFilter={bundleIdFilter}
          onBundleIdChange={setBundleIdFilter}
          phaseFilter={phaseFilter}
          onPhaseChange={setPhaseFilter}
          platformFilter={platformFilter}
          onPlatformChange={setPlatformFilter}
          startDate={startDateFilter}
          onStartDateChange={setStartDateFilter}
          endDate={endDateFilter}
          onEndDateChange={setEndDateFilter}
          bulkHideMode={bulkHideMode}
          onBulkHideModeChange={setBulkHideMode}
          bulkUnhideMode={bulkUnhideMode}
          onBulkUnhideModeChange={setBulkUnhideMode}
          bulkClickReportMode={bulkClickReportMode}
          onBulkClickReportModeChange={handleBulkClickReportModeChange}
          showHiddenCampaigns={showHiddenCampaigns}
          onShowHiddenCampaignsChange={setShowHiddenCampaigns}
          accessToken={accessToken}
          copy={copy}
        />

        {error && (
          <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-center'>
            {error}
          </div>
        )}

        <CampaignsTable
          items={displayedItems}
          copy={copy}
          formatDateTime={formatReportDateTime}
          onTableScroll={handleTableScroll}
          onDetails={openDetails}
          truncateText={truncateText}
          bulkHideMode={bulkHideMode}
          bulkUnhideMode={bulkUnhideMode}
          bulkClickReportMode={bulkClickReportMode}
          selectedCampaignIds={selectedCampaignIds}
          onToggleCampaignSelection={handleToggleCampaignSelection}
        />

        {bulkHideMode ? (
          <BulkHideActionBar
            copy={copy}
            selectedCount={selectedCampaignIds.length}
            isSubmitting={isHidingCampaigns}
            onSubmit={() => hideCampaigns(selectedCampaignIds)}
          />
        ) : null}

        {bulkUnhideMode ? (
          <BulkUnhideActionBar
            copy={copy}
            selectedCount={selectedCampaignIds.length}
            isSubmitting={isUnhidingCampaigns}
            onSubmit={() => unhideCampaigns(selectedCampaignIds)}
          />
        ) : null}

        {bulkClickReportMode ? (
          <BulkClickReportActionBar
            copy={copy}
            selectedCount={selectedCampaignIds.length}
            isSubmitting={isExportingCampaignAudienceClickReport}
            onSubmit={() =>
              exportCampaignAudienceClickReport(selectedCampaignIds)
            }
          />
        ) : null}

        {loading && (
          <div className='text-center text-gray-600 mt-4'>{copy.loading}</div>
        )}
        {hasMore && !loading && (
          <div className='mt-4 text-center'>
            <button
              type='button'
              onClick={handleLoadMore}
              className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50'
            >
              {copy.loadMore}
            </button>
          </div>
        )}
        {!hasMore && !loading && items.length > 0 && (
          <div className='text-center text-gray-400 text-sm mt-4'>
            {copy.noMore}
          </div>
        )}
      </div>

      {showModal && selected && (
        <ReportDetailsModal
          campaign={selected}
          onClose={closeModal}
          onFixAndRestart={handleFixAndRestart}
          formatDateTime={formatReportDateTime}
          copy={copy}
        />
      )}
    </div>
  );
};

export default ReportsPage;
