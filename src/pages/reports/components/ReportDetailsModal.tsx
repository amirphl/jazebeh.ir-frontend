import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { GetCampaignResponse } from '../../../types/campaign';
import { BundleListItem } from '../../../types/bundle';
import { ReportsCopy } from '../translations';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { downloadBlob } from '../../wallet/utils/download';
import { useCampaignClickReportExport } from '../hooks/useCampaignClickReportExport';
import {
  LINK_PLACEHOLDER,
  normalizeLinkPlaceholder,
} from '../../../utils/campaignUtils';
import ReportMediaPreview from './reportDetails/ReportMediaPreview';
import {
  ReportField,
  ReportFieldGrid,
  ReportModalShell,
  ReportSection,
} from './reportDetails/ReportModalPrimitives';
import {
  FALLBACK_VALUE,
  formatDisplayValue,
  formatNumberValue,
  formatPercentValue,
  getBundleCategoryValue,
  getBundleJobValue,
  getCampaignCostValue,
  getPhaseLabel,
  getPlatformChannelLabel,
  getRefundValue,
  getSegmentationMethod,
  joinValues,
  toNumericValue,
} from './reportDetails/reportDetailsUtils';

interface ReportDetailsModalProps {
  campaign: GetCampaignResponse;
  onClose: () => void;
  onFixAndRestart: () => void;
  formatDateTime: (iso?: string) => string;
  copy: ReportsCopy;
}

const STATUS_COLORS: Record<string, string> = {
  initiated: 'bg-slate-200 text-slate-800',
  'in-progress': 'bg-sky-100 text-sky-800',
  'waiting-for-approval': 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  running: 'bg-indigo-100 text-indigo-800',
  cancelled: 'bg-slate-200 text-slate-700',
  'cancelled-by-admin': 'bg-slate-200 text-slate-700',
  expired: 'bg-orange-100 text-orange-800',
  executed: 'bg-green-100 text-green-800',
};

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  campaign,
  onClose,
  onFixAndRestart,
  formatDateTime,
  copy,
}) => {
  const { accessToken } = useAuth();
  const { showError } = useToast();
  const [bundle, setBundle] = useState<BundleListItem | null>(null);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [smartTargetingSummary, setSmartTargetingSummary] = useState<{
    selectedTagCount: number;
    selectedRawCapacity: number;
  } | null>(null);
  const isExportingRef = useRef(false);
  const { exportClickReport, isExporting: isExportingClickReport } =
    useCampaignClickReportExport({ copy });

  useEffect(() => {
    if (!campaign.bundle_id || !accessToken) {
      setBundle(null);
      setBundleLoading(false);
      return;
    }

    let isActive = true;
    setBundleLoading(true);
    apiService.setAccessToken(accessToken);

    apiService
      .getBundle(campaign.bundle_id)
      .then(response => {
        if (!isActive) return;
        if (!response.success || !response.data?.item) {
          setBundle(null);
          return;
        }
        setBundle(response.data.item);
      })
      .catch(() => {
        if (isActive) setBundle(null);
      })
      .finally(() => {
        if (isActive) setBundleLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, campaign.bundle_id]);

  useEffect(() => {
    setSmartTargetingSummary(null);
    if (
      campaign.audience_targeting_method !== 'smart_targeting' ||
      !campaign.uuid ||
      !accessToken
    ) {
      return;
    }

    let isActive = true;
    apiService.setAccessToken(accessToken);
    apiService
      .getCampaignSmartTargetingSelection(campaign.uuid)
      .then(response => {
        if (!isActive || !response.success || !response.data) return;

        const selectedTagIds = Array.from(
          new Set(
            (response.data.selected_tag_ids || []).filter(
              tagId => Number.isInteger(tagId) && tagId > 0
            )
          )
        );
        const responseCount = response.data.summary?.selected_tag_count;
        const responseCapacity = response.data.summary?.selected_raw_capacity;
        setSmartTargetingSummary({
          selectedTagCount:
            typeof responseCount === 'number' &&
            Number.isInteger(responseCount) &&
            responseCount >= 0
              ? responseCount
              : selectedTagIds.length,
          selectedRawCapacity:
            typeof responseCapacity === 'number' &&
            Number.isFinite(responseCapacity)
              ? Math.max(0, responseCapacity)
              : 0,
        });
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, [accessToken, campaign.audience_targeting_method, campaign.uuid]);

  const hasTrackingResults = useMemo(() => {
    const value = campaign.statistics?.trackingResults;
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  }, [campaign.statistics]);

  const hasAdlink =
    typeof campaign.adlink === 'string' && campaign.adlink.trim() !== '';
  const segmentationMethod = getSegmentationMethod(campaign, copy);
  const platformDetails = getPlatformChannelLabel(campaign, copy);
  const totalRecords = toNumericValue(
    campaign.statistics?.aggregatedTotalRecords
  );
  const totalSent = toNumericValue(campaign.statistics?.aggregatedTotalSent);
  const totalClicks = toNumericValue(campaign.total_clicks);
  const campaignCost = getCampaignCostValue(campaign);
  const refund = getRefundValue(campaign);
  const audienceGrades = joinValues(campaign.audience_grades);
  const normalizedShortLinkDomain =
    typeof campaign.short_link_domain === 'string' &&
    campaign.short_link_domain.trim()
      ? campaign.short_link_domain.trim()
      : null;
  const shortLinkDomain =
    hasAdlink && normalizedShortLinkDomain
      ? normalizedShortLinkDomain
      : FALLBACK_VALUE;

  const renderedContent = useMemo(() => {
    if (!campaign.content) return FALLBACK_VALUE;
    const normalized = normalizeLinkPlaceholder(campaign.content);
    if (!hasAdlink) return normalized;

    const previewLink = normalizedShortLinkDomain
      ? `${normalizedShortLinkDomain}/xxxxxx`
      : campaign.adlink!.trim().replace(/\{uid\}/g, 'xxxxxx');
    return normalized.split(LINK_PLACEHOLDER).join(previewLink);
  }, [campaign.adlink, campaign.content, hasAdlink, normalizedShortLinkDomain]);

  const getExportErrorMessage = (message?: string): string => {
    const code = (message || '').trim().toUpperCase();
    if (code.includes('MISSING_CAMPAIGN_UUID'))
      return copy.modal.exportMissingCampaignUuid;
    if (code.includes('INVALID_CAMPAIGN_UUID'))
      return copy.modal.exportInvalidCampaignUuid;
    if (code.includes('UNAUTHORIZED')) return copy.modal.exportUnauthorized;
    if (code.includes('FORBIDDEN')) return copy.modal.exportForbidden;
    if (code.includes('NOT_FOUND')) return copy.modal.exportNotFound;
    return copy.modal.exportError;
  };

  const handleExportReport = async () => {
    if (isExportingRef.current) return;
    if (!campaign.uuid) {
      showError(copy.modal.exportMissingCampaignUuid);
      return;
    }

    isExportingRef.current = true;
    setIsExporting(true);
    try {
      apiService.setAccessToken(accessToken || null);
      const response = await apiService.exportCampaignReport(campaign.uuid);
      if (!response.success || !response.blob) {
        showError(getExportErrorMessage(response.message));
        return;
      }
      downloadBlob(
        response.blob,
        response.filename || `campaign_report_${campaign.uuid}.xlsx`
      );
    } catch {
      showError(copy.modal.exportError);
    } finally {
      isExportingRef.current = false;
      setIsExporting(false);
    }
  };

  return (
    <ReportModalShell
      title={campaign.title?.trim() || FALLBACK_VALUE}
      subtitle={campaign.uuid}
      badge={
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[campaign.status] ?? 'bg-slate-200 text-slate-800'}`}
        >
          {copy.statuses[campaign.status] || campaign.status}
        </span>
      }
      actions={
        <div className='flex items-center gap-2'>
          {campaign.status === 'rejected' ? (
            <button
              type='button'
              onClick={onFixAndRestart}
              className='rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100'
            >
              {copy.modal.fixAndRestart}
            </button>
          ) : null}
          {hasTrackingResults ? (
            <button
              type='button'
              onClick={handleExportReport}
              disabled={isExporting}
              className='rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isExporting
                ? copy.modal.exportingReport
                : copy.modal.exportReport}
            </button>
          ) : null}
          <button
            type='button'
            onClick={onClose}
            className='rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20'
            aria-label={copy.modal.close}
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      }
      footer={
        hasAdlink ? (
          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end'>
            <button
              type='button'
              onClick={() => exportClickReport(campaign.uuid)}
              disabled={isExportingClickReport}
              className='inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isExportingClickReport
                ? copy.modal.exportingClickReport
                : copy.modal.exportClickReport}
            </button>
          </div>
        ) : undefined
      }
    >
      <ReportSection title={copy.modal.comment}>
        <ReportFieldGrid>
          <ReportField
            label={copy.modal.comment}
            value={
              <p className='whitespace-pre-wrap'>
                {formatDisplayValue(campaign.comment)}
              </p>
            }
            fullWidth
          />
        </ReportFieldGrid>
      </ReportSection>

      <ReportSection
        title={copy.modal.bundleSection}
        description={bundleLoading ? copy.modal.bundleLoading : undefined}
      >
        <ReportFieldGrid>
          <ReportField
            label={copy.modal.bundleTitle}
            value={formatDisplayValue(bundle?.title || campaign.bundle_title)}
          />
          <ReportField
            label={copy.modal.bundleObjective}
            value={formatDisplayValue(bundle?.objective)}
          />
          <ReportField
            label={copy.modal.bundlePersona}
            value={formatDisplayValue(bundle?.target_audience_persona)}
          />
          <ReportField
            label={copy.modal.bundleTargetCustomerName}
            value={formatDisplayValue(bundle?.target_customer_name)}
          />
          <ReportField
            label={copy.modal.bundleCategory}
            value={getBundleCategoryValue(bundle)}
          />
          {/*
          <ReportField
            label={copy.modal.bundleJob}
            value={getBundleJobValue(bundle)}
          />
          */}
        </ReportFieldGrid>
      </ReportSection>

      <ReportSection title={copy.modal.campaignSection}>
        <ReportFieldGrid>
          <ReportField
            label={copy.table.campaignTitle}
            value={formatDisplayValue(campaign.title)}
          />
          <ReportField
            label={copy.modal.scheduleAt}
            value={formatDateTime(campaign.scheduleat)}
          />
          <ReportField
            label={copy.table.createdAt}
            value={formatDateTime(campaign.created_at)}
          />
          <ReportField
            label={copy.modal.updatedAt}
            value={formatDateTime(campaign.updated_at)}
          />
          <ReportField
            label={copy.table.status}
            value={copy.statuses[campaign.status] || campaign.status}
          />
          <ReportField
            label={copy.table.phase}
            value={getPhaseLabel(campaign.phase, copy)}
          />
        </ReportFieldGrid>
      </ReportSection>

      <ReportSection title={copy.modal.segmentationSection}>
        <ReportFieldGrid>
          <ReportField
            label={copy.modal.segmentationMethod}
            value={segmentationMethod}
          />
          {segmentationMethod === copy.modal.segmentationMethodLevels ? (
            <>
              <ReportField
                label={copy.modal.level1}
                value={formatDisplayValue(campaign.level1)}
              />
              <ReportField
                label={copy.modal.level2}
                value={joinValues(campaign.level2s)}
              />
              <ReportField
                label={copy.modal.level3v2}
                value={joinValues(campaign.level3s)}
              />
              <ReportField
                label={copy.modal.subsegments}
                value={joinValues(campaign.tags)}
              />
            </>
          ) : segmentationMethod ===
            copy.modal.segmentationMethodSmartTargeting ? (
            <>
              <ReportField
                label={copy.modal.selectedTagCount}
                value={
                  smartTargetingSummary
                    ? formatNumberValue(smartTargetingSummary.selectedTagCount)
                    : FALLBACK_VALUE
                }
              />
              <ReportField
                label={copy.modal.selectedRawCapacity}
                value={
                  smartTargetingSummary
                    ? formatNumberValue(
                        smartTargetingSummary.selectedRawCapacity
                      )
                    : FALLBACK_VALUE
                }
              />
            </>
          ) : segmentationMethod === copy.modal.segmentationMethodExcelFile ? (
            <ReportField
              label={copy.modal.excelFileUuid}
              value={formatDisplayValue(
                campaign.target_audience_excel_file_uuid
              )}
              fullWidth
            />
          ) : null}
          <ReportField
            label={copy.modal.segmentPriceFactor}
            value={formatNumberValue(campaign.segment_price_factor, {
              maximumFractionDigits: 2,
            })}
          />
          <ReportField
            label={copy.modal.audienceGrades}
            value={audienceGrades}
          />
          <ReportField
            label={copy.modal.sex}
            value={formatDisplayValue(campaign.sex)}
          />
          <ReportField
            label={copy.modal.cities}
            value={joinValues(campaign.city)}
          />
          {/*
          <ReportField
            label={copy.modal.bundleCategory}
            value={formatDisplayValue(campaign.job_category)}
          />
          <ReportField
            label={copy.modal.bundleJob}
            value={formatDisplayValue(campaign.job)}
          />
          */}
        </ReportFieldGrid>
      </ReportSection>

      <ReportSection title={copy.modal.platformSection}>
        <ReportFieldGrid>
          <ReportField
            label={copy.modal.platform}
            value={platformDetails.platformLabel}
          />
          <ReportField
            label={platformDetails.channelLabel}
            value={platformDetails.channelValue}
          />
          <ReportField
            label={platformDetails.priceLabel}
            value={platformDetails.priceValue}
          />
          {(campaign.platform ?? 'sms') !== 'sms' &&
          campaign.platform_settings_id ? (
            <ReportField
              label={`${copy.modal.platformSettingsName} ID`}
              value={formatNumberValue(campaign.platform_settings_id)}
            />
          ) : null}
        </ReportFieldGrid>
      </ReportSection>

      <ReportSection title={copy.modal.contentSection}>
        <ReportFieldGrid>
          <ReportField
            label={copy.table.text}
            value={
              <p className='whitespace-pre-wrap'>
                {renderedContent !== FALLBACK_VALUE
                  ? campaign.platform === 'sms' || !campaign.platform
                    ? `${renderedContent}\nلغو۱۱`
                    : renderedContent
                  : FALLBACK_VALUE}
              </p>
            }
            fullWidth
          />
          <ReportField
            label={copy.modal.attachedMedia}
            value={
              <ReportMediaPreview
                accessToken={accessToken}
                mediaUuid={campaign.media_uuid}
                labels={{
                  loading: copy.modal.mediaPreviewLoading,
                  empty: copy.modal.mediaPreviewEmpty,
                  failed: copy.modal.mediaPreviewFailed,
                }}
              />
            }
            fullWidth
          />
          <ReportField
            label={copy.table.adlink}
            value={
              hasAdlink ? (
                <a
                  href={campaign.adlink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary-700 underline decoration-primary-300 underline-offset-4'
                >
                  {campaign.adlink}
                </a>
              ) : (
                FALLBACK_VALUE
              )
            }
          />
          <ReportField
            label={copy.modal.shortLinkDomain}
            value={shortLinkDomain}
          />
        </ReportFieldGrid>
      </ReportSection>

      <ReportSection title={copy.modal.budgetSection}>
        <ReportFieldGrid>
          <ReportField
            label={copy.modal.budget}
            value={formatNumberValue(campaign.budget)}
          />
          <ReportField
            label={copy.modal.campaignCost}
            value={formatNumberValue(campaignCost, {
              maximumFractionDigits: 2,
            })}
          />
          <ReportField
            label={copy.modal.refund}
            value={formatNumberValue(refund, {
              maximumFractionDigits: 2,
            })}
          />
          <ReportField
            label={copy.modal.numAudience}
            value={formatNumberValue(campaign.num_audience)}
          />
        </ReportFieldGrid>
      </ReportSection>

      <ReportSection title={copy.modal.performanceSection}>
        <ReportFieldGrid>
          <ReportField
            label={copy.modal.totalSentRecords}
            value={formatNumberValue(totalRecords)}
          />
          <ReportField
            label={copy.modal.totalSentSuccessfully}
            value={formatNumberValue(totalSent)}
          />
          <ReportField
            label={copy.modal.totalClicks}
            value={formatNumberValue(totalClicks)}
          />
          <ReportField
            label={copy.modal.clickRate}
            value={formatPercentValue(campaign.click_rate)}
          />
        </ReportFieldGrid>
      </ReportSection>
    </ReportModalShell>
  );
};

export default ReportDetailsModal;
