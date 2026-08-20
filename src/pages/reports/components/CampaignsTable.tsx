import React, { useRef, useState } from 'react';
import { GetCampaignResponse } from '../../../types/campaign';
import { ReportsCopy } from '../translations';
import { useCancelCampaign } from '../hooks/useCancelCampaign';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { apiService } from '../../../services/api';
import { ROUTES } from '../../../config/routes';
import {
  normalizeCampaignResponseToDraft,
  prepareCampaignCreationDraft,
} from '../../../utils/campaignCreationDraft';
import type { SmartTargetingDraftSelection } from '../../../utils/campaignCreationDraft';
import {
  formatPercentValue,
  toNumericValue,
} from './reportDetails/reportDetailsUtils';

const getAggregatedTotalSent = (campaign: GetCampaignResponse): string => {
  const aggregated = toNumericValue(campaign.statistics?.aggregatedTotalSent);
  if (aggregated !== null) return String(aggregated);

  return '-';
};

const getAudienceDisplayValue = (
  campaign: GetCampaignResponse,
  copy: ReportsCopy
): string => {
  if (campaign.audience_targeting_method === 'smart_targeting') {
    return copy.modal.segmentationMethodSmartTargeting;
  }
  if (
    campaign.audience_targeting_method === 'excel' ||
    campaign.target_audience_excel_file_uuid
  ) {
    return copy.modal.segmentationMethodExcelFile;
  }

  if (Array.isArray(campaign.level3s) && campaign.level3s.length > 0) {
    return campaign.level3s.join(', ');
  }

  return typeof campaign.level3s === 'string' ? campaign.level3s : '-';
};

const TITLE_MAX_LENGTH = 40;
const LEVEL3_MAX_LENGTH = 36;

interface CampaignsTableProps {
  items: GetCampaignResponse[];
  copy: ReportsCopy;
  formatDateTime: (iso?: string) => string;
  onTableScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  onDetails: (campaign: GetCampaignResponse) => void;
  truncateText: (text: string, max?: number) => string;
  bulkHideMode: boolean;
  bulkUnhideMode: boolean;
  bulkClickReportMode: boolean;
  selectedCampaignIds: number[];
  onToggleCampaignSelection: (campaignId: number, selected: boolean) => void;
}

const CampaignsTable: React.FC<CampaignsTableProps> = ({
  items,
  copy,
  formatDateTime,
  onTableScroll,
  onDetails,
  truncateText,
  bulkHideMode,
  bulkUnhideMode,
  bulkClickReportMode,
  selectedCampaignIds,
  onToggleCampaignSelection,
}) => {
  const bulkSelectionMode =
    bulkHideMode || bulkUnhideMode || bulkClickReportMode;
  const selectionColumnLabel = bulkClickReportMode
    ? copy.bulkClickReport.selectionColumn
    : bulkUnhideMode
      ? copy.bulkUnhide.selectionColumn
      : copy.bulkHide.selectionColumn;
  const statusLabel = (status: string) => copy.statuses[status] || status;
  const { cancelCampaign, cancelling, cancelled } = useCancelCampaign(copy);
  const { accessToken } = useAuth();
  const { showError, showSuccess } = useToast();
  const [cloning, setCloning] = useState<Record<string, boolean>>({});
  const [resuming, setResuming] = useState<Record<string, boolean>>({});
  const cloningUuidsRef = useRef(new Set<string>());
  const resumingUuidsRef = useRef(new Set<string>());

  const canClone = (campaign: GetCampaignResponse) =>
    Boolean(campaign.uuid?.trim());
  const canResume = (status: string) =>
    status === 'initiated' || status === 'in-progress';

  const loadSmartTargetingSelection = async (
    campaign: GetCampaignResponse,
    fallbackError: string
  ): Promise<SmartTargetingDraftSelection | undefined> => {
    if (campaign.audience_targeting_method !== 'smart_targeting') {
      return undefined;
    }
    if (!accessToken) {
      throw new Error(fallbackError);
    }

    apiService.setAccessToken(accessToken);
    const response = await apiService.getCampaignSmartTargetingSelection(
      campaign.uuid
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || fallbackError);
    }

    return {
      selectedTagIds: Array.from(
        new Set(
          (response.data.selected_tag_ids || []).filter(
            tagId => Number.isInteger(tagId) && tagId > 0
          )
        )
      ),
      selectedRawCapacity:
        typeof response.data.summary?.selected_raw_capacity === 'number' &&
        Number.isFinite(response.data.summary.selected_raw_capacity)
          ? Math.max(0, response.data.summary.selected_raw_capacity)
          : 0,
    };
  };

  const handleClone = async (campaign: GetCampaignResponse) => {
    if (cloningUuidsRef.current.has(campaign.uuid)) return;
    if (!canClone(campaign)) {
      showError(copy.clone.notAllowed);
      return;
    }
    const ok = window.confirm(copy.clone.confirm);
    if (!ok) return;
    if (!accessToken) {
      showError(copy.clone.error);
      return;
    }
    cloningUuidsRef.current.add(campaign.uuid);
    setCloning(prev => ({ ...prev, [campaign.uuid]: true }));
    try {
      apiService.setAccessToken(accessToken);
      const smartTargetingSelection = await loadSmartTargetingSelection(
        campaign,
        copy.clone.error
      );
      const cloneRes = await apiService.cloneCampaign(campaign.uuid);
      if (
        !cloneRes.success ||
        typeof cloneRes.data?.uuid !== 'string' ||
        !cloneRes.data.uuid.trim() ||
        !Number.isInteger(cloneRes.data.id) ||
        cloneRes.data.id <= 0
      ) {
        throw new Error(cloneRes.message || copy.clone.error);
      }
      const clonedDraft = normalizeCampaignResponseToDraft(campaign, {
        id: cloneRes.data.id,
        uuid: cloneRes.data.uuid,
        clearSchedule: true,
        smartTargetingSelection,
        smartTargetingSelectionDirty: false,
      });
      prepareCampaignCreationDraft(clonedDraft);
      showSuccess(copy.clone.success);
      window.location.href = ROUTES.CAMPAIGN_CREATION.path;
    } catch (e) {
      const message = e instanceof Error ? e.message : copy.clone.error;
      showError(message);
    } finally {
      cloningUuidsRef.current.delete(campaign.uuid);
      setCloning(prev => ({ ...prev, [campaign.uuid]: false }));
    }
  };

  const handleResume = async (campaign: GetCampaignResponse) => {
    if (resumingUuidsRef.current.has(campaign.uuid)) return;
    if (!canResume(campaign.status)) {
      showError(copy.resume.notAllowed);
      return;
    }
    const confirmed = window.confirm(copy.resume.confirm);
    if (!confirmed) return;
    if (!accessToken) {
      showError(copy.resume.error);
      return;
    }
    resumingUuidsRef.current.add(campaign.uuid);
    setResuming(prev => ({ ...prev, [campaign.uuid]: true }));
    try {
      const smartTargetingSelection = await loadSmartTargetingSelection(
        campaign,
        copy.resume.error
      );
      let draft;
      if (campaign.status === 'in-progress') {
        apiService.setAccessToken(accessToken);
        const cloneResponse = await apiService.cloneCampaign(campaign.uuid);
        if (
          !cloneResponse.success ||
          typeof cloneResponse.data?.uuid !== 'string' ||
          !cloneResponse.data.uuid.trim() ||
          !Number.isInteger(cloneResponse.data.id) ||
          cloneResponse.data.id <= 0
        ) {
          throw new Error(cloneResponse.message || copy.resume.error);
        }
        draft = normalizeCampaignResponseToDraft(campaign, {
          id: cloneResponse.data.id,
          uuid: cloneResponse.data.uuid,
          clearSchedule: true,
          smartTargetingSelection,
          smartTargetingSelectionDirty: false,
        });
      } else {
        draft = normalizeCampaignResponseToDraft(campaign, {
          smartTargetingSelection,
          smartTargetingSelectionDirty: false,
        });
      }
      prepareCampaignCreationDraft(draft);
      showSuccess(copy.resume.success);
      window.location.href = ROUTES.CAMPAIGN_CREATION.path;
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.resume.error;
      showError(message);
    } finally {
      resumingUuidsRef.current.delete(campaign.uuid);
      setResuming(prev => ({ ...prev, [campaign.uuid]: false }));
    }
  };

  const th =
    'px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500';
  const td = 'px-4 py-3 text-center text-sm text-gray-900 align-top';
  const actionButtonCls =
    'w-full rounded px-3 py-1 text-sm text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50';
  const selectedCampaignIdSet = new Set(selectedCampaignIds);

  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div className='p-6'>
        <div className='h-[32rem] overflow-auto' onScroll={onTableScroll}>
          <table className='min-w-full table-fixed divide-y divide-gray-200'>
            <colgroup>
              {bulkSelectionMode ? <col className='w-16' /> : null}
              <col className='w-40' />
              <col className='w-44' />
              <col className='w-28' />
              <col className='w-52' />
              <col className='w-28' />
              <col className='w-28' />
              <col className='w-40' />
              <col className='w-32' />
              <col className='w-72' />
            </colgroup>
            <thead className='sticky top-0 z-10 bg-gray-50'>
              <tr>
                {bulkSelectionMode ? (
                  <th className={th}>{selectionColumnLabel}</th>
                ) : null}
                <th className={th}>{copy.table.bundleTitle}</th>
                <th className={th}>{copy.table.campaignTitle}</th>
                <th className={th}>{copy.table.platform}</th>
                <th className={th}>{copy.table.level3}</th>
                <th className={th}>{copy.table.aggregatedTotalSent}</th>
                <th className={th}>{copy.table.clickRate}</th>
                <th className={th}>{copy.table.scheduledAt}</th>
                <th className={th}>{copy.table.status}</th>
                <th className={th}>{copy.table.actions}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {items.map(campaign => {
                const audienceValue = getAudienceDisplayValue(campaign, copy);
                const isClickReportEligible = Boolean(campaign.adlink?.trim());

                return (
                  <tr key={campaign.uuid} className='hover:bg-gray-50'>
                    {bulkSelectionMode ? (
                      <td className={td}>
                        {campaign.id ? (
                          <input
                            type='checkbox'
                            checked={selectedCampaignIdSet.has(campaign.id)}
                            disabled={
                              bulkClickReportMode && !isClickReportEligible
                            }
                            onChange={event =>
                              onToggleCampaignSelection(
                                campaign.id as number,
                                event.target.checked
                              )
                            }
                            className='h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                            aria-label={
                              bulkClickReportMode && !isClickReportEligible
                                ? `${copy.bulkClickReport.ineligible} ${campaign.title || campaign.uuid}`
                                : `${selectionColumnLabel} ${campaign.title || campaign.uuid}`
                            }
                            title={
                              bulkClickReportMode && !isClickReportEligible
                                ? copy.bulkClickReport.ineligible
                                : undefined
                            }
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                    ) : null}
                    <td className={td}>
                      <span
                        className='block truncate'
                        title={campaign.bundle_title || '-'}
                      >
                        {campaign.bundle_title || '-'}
                      </span>
                    </td>
                    <td className={td}>
                      <span
                        className='block truncate font-medium text-gray-900'
                        title={campaign.title || '-'}
                      >
                        {truncateText(campaign.title || '', TITLE_MAX_LENGTH)}
                      </span>
                    </td>
                    <td className={td}>
                      {copy.platforms[campaign.platform ?? 'sms'] ??
                        campaign.platform ??
                        copy.platforms.sms}
                    </td>
                    <td className={td}>
                      <span className='block truncate' title={audienceValue}>
                        {truncateText(audienceValue, LEVEL3_MAX_LENGTH)}
                      </span>
                    </td>
                    <td className={td}>{getAggregatedTotalSent(campaign)}</td>
                    <td className={td}>
                      {formatPercentValue(campaign.click_rate)}
                    </td>
                    <td className={td}>
                      {formatDateTime(campaign.scheduleat)}
                    </td>
                    <td className={td}>
                      <span className='block font-medium text-gray-900'>
                        {statusLabel(campaign.status)}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm text-center align-top'>
                      <div className='flex flex-col gap-2'>
                        <button
                          type='button'
                          onClick={() => onDetails(campaign)}
                          className='w-full rounded border border-primary-200 bg-primary-50 px-3 py-1.5 font-medium text-primary-700 transition hover:border-primary-300 hover:bg-primary-100'
                        >
                          {copy.table.details}
                        </button>
                        {(campaign.status === 'waiting-for-approval' ||
                          campaign.status === 'approved') &&
                        campaign.id ? (
                          <button
                            type='button'
                            onClick={() => cancelCampaign(campaign)}
                            disabled={
                              cancelling[campaign.id] || cancelled[campaign.id]
                            }
                            className={`${actionButtonCls} bg-amber-600 hover:bg-amber-700`}
                          >
                            {cancelled[campaign.id]
                              ? copy.modal.cancelled
                              : cancelling[campaign.id]
                                ? copy.modal.cancelling
                                : copy.modal.cancel}
                          </button>
                        ) : null}

                        {canClone(campaign) ? (
                          <button
                            type='button'
                            onClick={() => handleClone(campaign)}
                            disabled={cloning[campaign.uuid]}
                            className={`${actionButtonCls} bg-blue-600 hover:bg-blue-700`}
                          >
                            {cloning[campaign.uuid]
                              ? copy.loading
                              : copy.clone.button}
                          </button>
                        ) : null}

                        {canResume(campaign.status) ? (
                          <button
                            type='button'
                            onClick={() => handleResume(campaign)}
                            disabled={resuming[campaign.uuid]}
                            className={`${actionButtonCls} bg-emerald-600 hover:bg-emerald-700`}
                          >
                            {resuming[campaign.uuid]
                              ? copy.loading
                              : copy.resume.button}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignsTable;
