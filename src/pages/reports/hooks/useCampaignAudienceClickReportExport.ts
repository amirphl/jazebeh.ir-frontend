import { useCallback, useRef, useState } from 'react';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { downloadBlob } from '../../wallet/utils/download';
import { ReportsCopy } from '../translations';

const FALLBACK_FILENAME = 'campaign_audience_click_report.xlsx';

const getExportErrorMessage = (code: string | undefined, copy: ReportsCopy) => {
  switch ((code || '').trim().toUpperCase()) {
    case 'MISSING_ACCESS_TOKEN':
    case 'MISSING_CUSTOMER_ID':
    case 'UNAUTHORIZED':
      return copy.bulkClickReport.errors.unauthorized;
    case 'FORBIDDEN':
      return copy.bulkClickReport.errors.forbidden;
    case 'CAMPAIGN_IDS_REQUIRED':
    case 'CAMPAIGN_IDS_LIMIT_EXCEEDED':
    case 'CAMPAIGN_ID_INVALID':
    case 'CAMPAIGN_IDS_DUPLICATE':
    case 'INVALID_REQUEST':
    case 'VALIDATION_ERROR':
      return copy.bulkClickReport.errors.invalidSelection;
    case 'AUDIENCE_REPORT_NOT_AVAILABLE':
    case 'CAMPAIGN_NOT_FOUND':
    case 'NOT_FOUND':
      return copy.bulkClickReport.errors.notFound;
    case 'CAMPAIGN_REPORT_TOO_LARGE':
      return copy.bulkClickReport.errors.tooLarge;
    case 'TIMEOUT_ERROR':
      return copy.bulkClickReport.errors.timeout;
    case 'NETWORK_ERROR':
      return copy.bulkClickReport.errors.network;
    case 'INVALID_RESPONSE':
      return copy.bulkClickReport.errors.invalidResponse;
    default:
      return copy.bulkClickReport.errors.fallback;
  }
};

export const useCampaignAudienceClickReportExport = (copy: ReportsCopy) => {
  const { accessToken } = useAuth();
  const { showError, showSuccess } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const isExportingRef = useRef(false);

  const exportClickReport = useCallback(
    async (campaignIds: number[]) => {
      if (isExportingRef.current) return false;

      const normalizedCampaignIds = Array.from(
        new Set(
          (Array.isArray(campaignIds) ? campaignIds : []).filter(
            id => Number.isInteger(id) && Number.isFinite(id) && id > 0
          )
        )
      );

      if (normalizedCampaignIds.length === 0) {
        showError(copy.bulkClickReport.errors.emptySelection);
        return false;
      }

      if (!accessToken) {
        showError(copy.bulkClickReport.errors.unauthorized);
        return false;
      }

      isExportingRef.current = true;
      setIsExporting(true);
      try {
        apiService.setAccessToken(accessToken);
        const response = await apiService.exportCampaignAudienceClickReport(
          normalizedCampaignIds
        );

        if (!response.success || !response.blob) {
          showError(getExportErrorMessage(response.message, copy));
          return false;
        }

        downloadBlob(response.blob, response.filename || FALLBACK_FILENAME);
        showSuccess(copy.bulkClickReport.success);
        return true;
      } catch {
        showError(copy.bulkClickReport.errors.fallback);
        return false;
      } finally {
        isExportingRef.current = false;
        setIsExporting(false);
      }
    },
    [accessToken, copy, showError, showSuccess]
  );

  return { exportClickReport, isExporting };
};
