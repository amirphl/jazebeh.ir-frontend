import { useEffect, useRef } from 'react';
import { CampaignData, CampaignSegment } from '../../../types/campaign';
import { serializeCampaignPayload } from '../../../utils/campaignUtils';
import { apiService } from '../../../services/api';

interface SmartTargetingTestSamplingSyncOptions {
  campaignData: CampaignData;
  accessToken?: string | null;
  enabled: boolean;
  updateLevel: (data: Partial<CampaignSegment>) => void;
  showError: (message: string) => void;
}

/**
 * Persists a changed Smart Targeting Test configuration, then starts exactly
 * one server-side sampling calculation for that persisted configuration.
 */
export const useSmartTargetingTestSamplingSync = ({
  campaignData,
  accessToken,
  enabled,
  updateLevel,
  showError,
}: SmartTargetingTestSamplingSyncOptions): void => {
  const sequenceRef = useRef(0);

  useEffect(() => {
    const tagIds = campaignData.segment.selectedTagIds ?? [];
    const sampleSize = campaignData.segment.sampleSizePerTag ?? 0;
    const canStartCalculation =
      tagIds.length > 0 &&
      Number.isSafeInteger(sampleSize) &&
      sampleSize > 0 &&
      !campaignData.segment.smartTargetingSelectionOrderPending;

    if (
      !enabled ||
      !campaignData.uuid.trim() ||
      campaignData.segment.smartTargetingTestSamplingInputsDirty !== true ||
      campaignData.segment.smartTargetingSelectionOrderPending === true
    ) {
      return;
    }

    const sequence = sequenceRef.current + 1;
    sequenceRef.current = sequence;
    const controller = new AbortController();
    let calculationStarted = false;

    const isCurrent = () =>
      !controller.signal.aborted && sequenceRef.current === sequence;

    void (async () => {
      apiService.setAccessToken(accessToken || null);
      const campaignResponse = await apiService.updateCampaign(
        campaignData.uuid,
        serializeCampaignPayload(campaignData, {
          includeContent: true,
          includeBudget: false,
          finalize: false,
        }),
        controller.signal
      );
      if (!isCurrent()) return;
      if (!campaignResponse.success) {
        showError(
          campaignResponse.message || 'Failed to save the test configuration'
        );
        return;
      }

      const selectionResponse =
        await apiService.replaceCampaignSmartTargetingSelection(
          campaignData.uuid,
          { tag_ids: tagIds },
          controller.signal
        );
      if (!isCurrent()) return;
      if (!selectionResponse.success || !selectionResponse.data) {
        showError(
          selectionResponse.message ||
            'Failed to save the Smart Targeting selection'
        );
        return;
      }

      const persistedTagIds = selectionResponse.data.selected_tag_ids;
      const selectionMatches =
        persistedTagIds.length === tagIds.length &&
        persistedTagIds.every((tagId, index) => tagId === tagIds[index]);
      if (!selectionMatches) {
        showError('The Smart Targeting selection was not saved in order');
        return;
      }

      const persistedConfiguration: Partial<CampaignSegment> = {
        selectedTagIds: persistedTagIds,
        smartTargetingSelectedRawCapacity: Math.max(
          0,
          selectionResponse.data.summary?.selected_raw_capacity ?? 0
        ),
        smartTargetingSelectionDirty: false,
        smartTargetingScoreClassesDirty: false,
        smartTargetingTestSamplingInputsDirty: false,
      };

      // An empty selection is valid persisted state, but cannot produce a job.
      if (!canStartCalculation) {
        updateLevel(persistedConfiguration);
        return;
      }

      calculationStarted = true;
      const calculationPromise =
        apiService.startSmartTargetingTestSamplingCalculation(
          campaignData.uuid,
          controller.signal
        );
      updateLevel(persistedConfiguration);
      const calculationResponse = await calculationPromise;
      if (!isCurrent()) return;
      if (!calculationResponse.success) {
        showError(
          calculationResponse.message || 'Failed to request test sampling'
        );
      }
    })().catch(() => {
      if (isCurrent()) showError('Failed to save the test configuration');
    });

    return () => {
      if (!calculationStarted) {
        if (sequenceRef.current === sequence) sequenceRef.current += 1;
        controller.abort();
      }
    };
  }, [accessToken, campaignData, enabled, showError, updateLevel]);
};
