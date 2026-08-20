import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { CampaignData, CampaignPayment } from '../../../types/campaign';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useLanguage } from '../../../hooks/useLanguage';
import { paymentI18n } from './paymentTranslations';
import { isCurrentUsableSmartTargetingCapacity } from '../../../utils/smartTargetingCapacity';
import {
  hasUsableSmartTargetingTestPreview,
  isCurrentSmartTargetingTestPreview,
} from '../../../utils/smartTargetingTestPreview';

export const useCostCalculation = (
  campaignData: CampaignData,
  onUpdatePayment: (data: Partial<CampaignPayment>) => void
) => {
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [messageCount, setMessageCount] = useState<number | undefined>(
    undefined
  );
  const [lastCalculation, setLastCalculation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();
  const { language } = useLanguage();
  const t = paymentI18n[language as keyof typeof paymentI18n] || paymentI18n.en;
  const { showToast } = useToast();

  const triggeredKeyRef = useRef<string | null>(null);
  const inFlightKeyRef = useRef<string | null>(null);
  const requestSequenceRef = useRef(0);
  const latestCampaignDataRef = useRef(campaignData);
  latestCampaignDataRef.current = campaignData;

  useEffect(() => {
    apiService.setAccessToken(accessToken || null);
    requestSequenceRef.current += 1;
    triggeredKeyRef.current = null;
    inFlightKeyRef.current = null;
    setTotal(undefined);
    setMessageCount(undefined);
    setLastCalculation(0);
    setIsLoading(false);
    setError(null);
    onUpdatePayment({
      total: undefined,
      finalCost: undefined,
      hasEnoughBalance: undefined,
    });
  }, [accessToken, onUpdatePayment]);

  const calculateCosts = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    const platform = campaignData.segment.platform || 'sms';
    const audienceTargetingMethod =
      campaignData.segment.audienceTargetingMethod ??
      (campaignData.segment.targetAudienceExcelFileUuid != null
        ? 'excel'
        : 'standard');
    const title = campaignData.segment.campaignTitle;
    const level1 = campaignData.segment.level1;
    const level2s = campaignData.segment.level2s || [];
    const level3s = campaignData.segment.level3s || [];
    const target_audience_excel_file_uuid =
      campaignData.segment.targetAudienceExcelFileUuid || null;
    const tags = campaignData.segment.tags || [];
    const selectedTagIds = campaignData.segment.selectedTagIds || [];
    const exactCapacity =
      campaignData.segment.smartTargetingCapacityCalculation;
    const isSmartTargetingTest =
      audienceTargetingMethod === 'smart_targeting' &&
      campaignData.segment.phase === 'test';
    const currentTestPreview = isCurrentSmartTargetingTestPreview(campaignData)
      ? campaignData.segment.smartTargetingTestPreview
      : null;
    const hasValidSmartTargetingSelection =
      selectedTagIds.length > 0 &&
      selectedTagIds.every(tagId => Number.isInteger(tagId) && tagId > 0);
    const hasCurrentExactCapacity =
      campaignData.segment.smartTargetingSelectionDirty !== true &&
      campaignData.segment.smartTargetingScoreClassesDirty !== true &&
      campaignData.segment.smartTargetingExactCapacityRequired !== true &&
      isCurrentUsableSmartTargetingCapacity(
        exactCapacity,
        selectedTagIds,
        campaignData.segment.smartTargetingScoreClasses
      );
    const adlink = campaignData.content.insertLink
      ? campaignData.content.link
      : '';
    const content = campaignData.content.text;
    const scheduleat = campaignData.content.scheduleAt;
    const line_number = campaignData.content.lineNumber;
    const platform_settings_id = campaignData.content.platformSettingsId;
    const budget = campaignData.budget.totalBudget;
    const campaignId = campaignData.id;
    const validCampaignId =
      typeof campaignId === 'number' &&
      Number.isInteger(campaignId) &&
      campaignId > 0
        ? campaignId
        : null;
    const clearDerivedPayment = () => {
      if (
        campaignData.payment.total !== undefined ||
        campaignData.payment.finalCost !== undefined ||
        campaignData.payment.hasEnoughBalance !== undefined
      ) {
        onUpdatePayment({
          total: undefined,
          finalCost: undefined,
          hasEnoughBalance: undefined,
        });
      }
    };
    const clearCalculation = () => {
      requestSequenceRef.current += 1;
      inFlightKeyRef.current = null;
      triggeredKeyRef.current = null;
      setTotal(undefined);
      setMessageCount(undefined);
      setLastCalculation(0);
      setIsLoading(false);
      setError(null);
      clearDerivedPayment();
    };

    const hasAudienceSelection =
      audienceTargetingMethod === 'smart_targeting'
        ? hasValidSmartTargetingSelection
        : audienceTargetingMethod === 'excel'
          ? typeof target_audience_excel_file_uuid === 'string' &&
            target_audience_excel_file_uuid.trim().length > 0
          : !!level1?.trim() &&
            level2s.length > 0 &&
            level3s.length > 0 &&
            tags.length > 0 &&
            (campaignData.segment.audienceGrades?.length ?? 0) > 0;

    const budgetIsValid = isSmartTargetingTest
      ? hasUsableSmartTargetingTestPreview(campaignData) &&
        Number.isSafeInteger(budget) &&
        budget >= 0 &&
        budget === currentTestPreview?.campaign_cost
      : Number.isSafeInteger(budget) && budget > 0;
    if (
      isSmartTargetingTest &&
      !hasUsableSmartTargetingTestPreview(campaignData)
    ) {
      clearCalculation();
      setError(t.testPreviewRequiredForCostCalculation);
      return;
    }
    if (!title || !hasAudienceSelection || !content || !budgetIsValid) {
      clearCalculation();
      return;
    }
    if (
      audienceTargetingMethod === 'smart_targeting' &&
      !isSmartTargetingTest &&
      !hasCurrentExactCapacity
    ) {
      clearCalculation();
      setError(t.exactCapacityRequiredForCostCalculation);
      return;
    }
    if (
      audienceTargetingMethod === 'smart_targeting' &&
      !isSmartTargetingTest &&
      exactCapacity?.usable_unique_audience_count === 0
    ) {
      clearCalculation();
      setError(t.zeroExactCapacity);
      return;
    }
    if (
      audienceTargetingMethod === 'smart_targeting' &&
      !isSmartTargetingTest &&
      hasCurrentExactCapacity &&
      (!Number.isSafeInteger(campaignData.budget.estimatedMessages) ||
        (campaignData.budget.estimatedMessages ?? 0) >
          (exactCapacity?.usable_unique_audience_count ?? 0))
    ) {
      clearCalculation();
      setError(t.requestedAudienceExceedsExactCapacity);
      return;
    }
    if (!isSmartTargetingTest && validCampaignId === null) {
      clearCalculation();
      const errorMessage = t.campaignIdRequiredForCostCalculation;
      setError(errorMessage);
      showToast('error', errorMessage);
      return;
    }

    if (platform === 'sms' && !line_number) {
      clearCalculation();
      return;
    }

    if (platform !== 'sms' && !platform_settings_id) {
      clearCalculation();
      return;
    }

    // Build selection key to avoid duplicates
    const selectionKey = [
      platform,
      audienceTargetingMethod,
      title,
      level1,
      [...level2s].sort().join(','),
      [...level3s].sort().join(','),
      target_audience_excel_file_uuid || '',
      [...tags].sort().join(','),
      (isSmartTargetingTest
        ? selectedTagIds
        : [...selectedTagIds].sort((a, b) => a - b)
      ).join(','),
      [...(campaignData.segment.smartTargetingScoreClasses || [])]
        .sort()
        .join(','),
      exactCapacity ? String(exactCapacity.calculation_id) : '',
      exactCapacity?.usable_unique_audience_count !== undefined
        ? String(exactCapacity.usable_unique_audience_count)
        : '',
      isSmartTargetingTest
        ? String(campaignData.segment.sampleSizePerTag ?? '')
        : '',
      isSmartTargetingTest
        ? String(currentTestPreview?.effective_audience_count ?? '')
        : '',
      isSmartTargetingTest
        ? String(currentTestPreview?.campaign_cost ?? '')
        : '',
      [...(campaignData.segment.audienceGrades || [])].sort().join(','),
      campaignData.content.insertLink ? 'link:on' : 'link:off',
      adlink || '',
      campaignData.content.shortLinkDomain || '',
      content,
      scheduleat || '',
      line_number || '',
      platform_settings_id ? String(platform_settings_id) : '',
      String(budget),
    ].join('|');

    if (
      triggeredKeyRef.current === selectionKey ||
      inFlightKeyRef.current === selectionKey
    ) {
      return;
    }
    const requestSequence = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestSequence;
    inFlightKeyRef.current = selectionKey;
    triggeredKeyRef.current = null;

    setIsLoading(true);
    setError(null);
    setTotal(undefined);
    setMessageCount(undefined);
    setLastCalculation(0);
    clearDerivedPayment();

    if (isSmartTargetingTest && currentTestPreview) {
      const previewCost = currentTestPreview.campaign_cost;
      const effectiveAudience = currentTestPreview.effective_audience_count;
      setTotal(previewCost);
      setMessageCount(effectiveAudience);
      setLastCalculation(Date.now());
      onUpdatePayment({
        total: previewCost,
        finalCost: previewCost,
      });
      triggeredKeyRef.current = selectionKey;
      inFlightKeyRef.current = null;
      setIsLoading(false);
      return;
    }

    if (validCampaignId === null) {
      clearCalculation();
      setError(t.campaignIdRequiredForCostCalculation);
      return;
    }

    try {
      const response = await apiService.calculateCampaignCost({
        campaign_id: validCampaignId,
        budget,
      });
      if (requestSequenceRef.current !== requestSequence) return;

      // A reservation poll may have invalidated the exact-capacity snapshot
      // while this cost request was in flight. Never apply an old cost result
      // (or its capacity error) to that newer, stale campaign state.
      const latestCampaignData = latestCampaignDataRef.current;
      const latestTargetingMethod =
        latestCampaignData.segment.audienceTargetingMethod ??
        (latestCampaignData.segment.targetAudienceExcelFileUuid != null
          ? 'excel'
          : 'standard');
      const latestIsSmartTargetingExecution =
        latestTargetingMethod === 'smart_targeting' &&
        latestCampaignData.segment.phase === 'execution';
      const latestHasCurrentExactCapacity =
        latestCampaignData.segment.smartTargetingSelectionDirty !== true &&
        latestCampaignData.segment.smartTargetingScoreClassesDirty !== true &&
        latestCampaignData.segment.smartTargetingExactCapacityRequired !==
          true &&
        isCurrentUsableSmartTargetingCapacity(
          latestCampaignData.segment.smartTargetingCapacityCalculation,
          latestCampaignData.segment.selectedTagIds,
          latestCampaignData.segment.smartTargetingScoreClasses
        );
      if (
        latestIsSmartTargetingExecution &&
        !latestHasCurrentExactCapacity
      ) {
        clearDerivedPayment();
        setError(t.exactCapacityRequiredForCostCalculation);
        return;
      }

      const totalCost = response.data?.total_cost;
      const targetMessages = response.data?.msg_target;
      if (
        response.success &&
        response.data &&
        typeof totalCost === 'number' &&
        Number.isFinite(totalCost) &&
        totalCost >= 0 &&
        typeof targetMessages === 'number' &&
        Number.isInteger(targetMessages) &&
        targetMessages > 0
      ) {
        setTotal(totalCost);
        setMessageCount(targetMessages);
        setLastCalculation(Date.now());
        onUpdatePayment({
          total: totalCost,
          finalCost: totalCost,
        });
        triggeredKeyRef.current = selectionKey;
      } else {
        clearDerivedPayment();
        setError(
          response.success
            ? 'Invalid cost calculation response.'
            : response.message || 'Failed to calculate costs.'
        );
      }
    } catch {
      if (requestSequenceRef.current !== requestSequence) return;
      clearDerivedPayment();
      setError('Failed to calculate costs due to an unexpected error.');
    } finally {
      if (requestSequenceRef.current === requestSequence) {
        setIsLoading(false);
        inFlightKeyRef.current = null;
      }
    }
  }, [accessToken, campaignData, onUpdatePayment, showToast, t]);

  return {
    total,
    messageCount,
    lastCalculation,
    isLoading,
    error,
    calculateCosts,
  };
};
