import React, { useCallback, useEffect, useRef } from 'react';
import { DollarSign } from 'lucide-react';
import { useCampaign } from '../../../hooks/useCampaign';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuth } from '../../../hooks/useAuth';
import StepHeader from '../../ui/StepHeader';
import Button from '../../ui/Button';
import BudgetInputCard from './BudgetInputCard';
import BudgetSelector from './BudgetSelector';
import MessageCountCard from './MessageCountCard';
import { useMessageCount } from './useMessageCount';
import { usePlatformSettingsList } from '../../../hooks/usePlatformSettingsList';
import { budgetI18n } from './budgetTranslations';
import TestMessageSection from './TestMessageSection';
import SmartTargetingTestSamplingPreview from '../segment/SmartTargetingTestSamplingPreview';
import { campaignLevelI18n } from '../segment/segmentTranslations';
import {
  getSmartTargetingTestPreviewInputKey,
  isCurrentSmartTargetingTestPreview,
} from '../../../utils/smartTargetingTestPreview';
import { apiService } from '../../../services/api';
import { serializeCampaignPayload } from '../../../utils/campaignUtils';
import { SmartTargetingTestSamplingPreviewResponse } from '../../../types/campaign';

const BudgetStep: React.FC = () => {
  const { campaignData, updateBudget, updateLevel } = useCampaign();
  const platform = campaignData.segment.platform || 'sms';
  const audienceTargetingMethod =
    campaignData.segment.audienceTargetingMethod ??
    (campaignData.segment.targetAudienceExcelFileUuid != null
      ? 'excel'
      : 'standard');
  const hideCapacityCount =
    audienceTargetingMethod === 'excel' ||
    (audienceTargetingMethod === 'smart_targeting' &&
      campaignData.segment.phase === 'test');
  const isSmartTargetingTest =
    audienceTargetingMethod === 'smart_targeting' &&
    campaignData.segment.phase === 'test';
  const { language } = useLanguage();
  const t = budgetI18n[language as keyof typeof budgetI18n] || budgetI18n.en;
  const segmentCopy =
    campaignLevelI18n[language as keyof typeof campaignLevelI18n] ||
    campaignLevelI18n.en;
  const { accessToken } = useAuth();
  const { items: activePlatformSettings } = usePlatformSettingsList(
    accessToken,
    platform === 'sms' ? 'bale' : platform
  );
  const currencyLabel = language === 'en' ? 'Toman' : 'تومان';
  const MIN_TEXT_BUDGET = 100000;
  const MAX_BUDGET = 160000000;
  const BUDGET_STEP = 100000;

  // Debouncing ref for budget field
  const budgetDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const campaignDataRef = useRef(campaignData);
  campaignDataRef.current = campaignData;

  // Calculate message count
  const {
    messageCount,
    maxMessageCount,
    isLoading: isLoadingMessageCount,
    isQueued: isQueuedMessageCount,
    error: messageCountError,
    calculateDebounced,
    resetMessageCount,
  } = useMessageCount(campaignData);

  useEffect(() => {
    if (isSmartTargetingTest) return;
    if (campaignData.budget.estimatedMessages === messageCount) return;
    updateBudget({ estimatedMessages: messageCount });
  }, [
    campaignData.budget.estimatedMessages,
    isSmartTargetingTest,
    messageCount,
    updateBudget,
  ]);
  const hasCalculationInputs =
    campaignData.budget.totalBudget >= MIN_TEXT_BUDGET &&
    campaignData.budget.totalBudget <= MAX_BUDGET &&
    ((platform === 'sms' && !!campaignData.content.lineNumber) ||
      (platform !== 'sms' && !!campaignData.content.platformSettingsId));

  const handleTotalBudgetChange = (value: number) => {
    const numeric = Number.isFinite(value) ? value : 0;
    const normalized = Math.max(0, Math.floor(numeric));
    updateBudget({ totalBudget: normalized });
    if (
      normalized >= MIN_TEXT_BUDGET &&
      normalized <= MAX_BUDGET &&
      ((platform === 'sms' && campaignData.content.lineNumber) ||
        (platform !== 'sms' && campaignData.content.platformSettingsId))
    ) {
      calculateDebounced(campaignData.content.lineNumber, normalized);
    } else {
      resetMessageCount();
    }
    if (budgetDebounceRef.current) {
      clearTimeout(budgetDebounceRef.current);
    }
  };

  const handlePercentBudgetChange = useCallback(
    (percent: number, amount: number) => {
      if (percent <= 0) {
        resetMessageCount();
        updateBudget({ totalBudget: 0, estimatedMessages: undefined });
        return;
      }
      const rounded = Math.max(0, Math.floor(amount / 1000) * 1000);
      updateBudget({ totalBudget: rounded });
      if (
        rounded >= MIN_TEXT_BUDGET &&
        rounded <= MAX_BUDGET &&
        ((platform === 'sms' && campaignData.content.lineNumber) ||
          (platform !== 'sms' && campaignData.content.platformSettingsId))
      ) {
        calculateDebounced(campaignData.content.lineNumber, rounded);
      } else {
        resetMessageCount();
      }
    },
    [
      MAX_BUDGET,
      campaignData.content.lineNumber,
      campaignData.content.platformSettingsId,
      calculateDebounced,
      platform,
      resetMessageCount,
      updateBudget,
    ]
  );

  const handleReset = () => {
    if (budgetDebounceRef.current) {
      clearTimeout(budgetDebounceRef.current);
      budgetDebounceRef.current = null;
    }
    resetMessageCount();
    updateBudget({
      totalBudget: 0,
      estimatedMessages: undefined,
    });
  };

  const prepareTestPreview = useCallback(
    async (signal?: AbortSignal) => {
      const current = campaignDataRef.current;
      if (!current.uuid.trim()) {
        return { success: false, errorCode: 'INVALID_CAMPAIGN_UUID' };
      }
      apiService.setAccessToken(accessToken || null);
      const response = await apiService.updateCampaign(
        current.uuid,
        serializeCampaignPayload(current, {
          includeContent: true,
          includeBudget: false,
          finalize: false,
        }),
        signal
      );
      return response.success
        ? { success: true, uuid: current.uuid }
        : {
            success: false,
            errorCode: response.error?.code || 'CAMPAIGN_UPDATE_FAILED',
          };
    },
    [accessToken]
  );

  const handleTestConfigurationPersisted = useCallback(
    (tagIds: number[], selectedRawCapacity: number) => {
      updateLevel({
        selectedTagIds: tagIds,
        smartTargetingSelectedRawCapacity: selectedRawCapacity,
        smartTargetingSelectionDirty: false,
        smartTargetingScoreClassesDirty: false,
        smartTargetingTestSamplingInputsDirty: false,
      });
    },
    [updateLevel]
  );

  const handleTestPreviewChange = useCallback(
    (
      preview: SmartTargetingTestSamplingPreviewResponse,
      campaignUuid: string
    ) => {
      const current = campaignDataRef.current;
      if (current.uuid.trim() !== campaignUuid.trim()) return;
      updateLevel({
        smartTargetingTestPreview: preview,
        smartTargetingTestPreviewInputKey: getSmartTargetingTestPreviewInputKey(
          campaignUuid,
          current.segment
        ),
        smartTargetingTestPreviewStale: false,
      });
      updateBudget({
        totalBudget: preview.campaign_cost,
        estimatedMessages: preview.effective_audience_count,
      });
    },
    [updateBudget, updateLevel]
  );

  const handleTestPreviewInvalidated = useCallback(() => {
    updateLevel({
      smartTargetingTestPreview: null,
      smartTargetingTestPreviewInputKey: null,
      smartTargetingTestPreviewStale: true,
    });
    updateBudget({ totalBudget: 0, estimatedMessages: undefined });
  }, [updateBudget, updateLevel]);

  return (
    <div className='space-y-8'>
      <StepHeader
        title={t.title}
        subtitle={''}
        icon={<DollarSign className='h-6 w-6 text-primary-600' />}
      />

      <div className='space-y-6'>
        {isSmartTargetingTest ? (
          <SmartTargetingTestSamplingPreview
            campaignUuid={campaignData.uuid || undefined}
            bundleId={campaignData.segment.bundleId}
            platform={campaignData.segment.platform}
            selectedTagIds={campaignData.segment.selectedTagIds || []}
            selectedRawCapacity={
              campaignData.segment.smartTargetingSelectedRawCapacity || 0
            }
            sampleSizePerTag={campaignData.segment.sampleSizePerTag ?? 0}
            selectedScoreClasses={
              campaignData.segment.smartTargetingScoreClasses || []
            }
            sortBy={campaignData.segment.smartTargetingSortBy || ''}
            sortDirection={
              campaignData.segment.smartTargetingSortDirection || 'desc'
            }
            preview={campaignData.segment.smartTargetingTestPreview}
            previewIsCurrent={isCurrentSmartTargetingTestPreview(campaignData)}
            previewIsStale={
              campaignData.segment.smartTargetingTestPreviewStale === true
            }
            configurationIsDirty={
              campaignData.segment.smartTargetingSelectionDirty === true ||
              campaignData.segment.smartTargetingScoreClassesDirty === true ||
              campaignData.segment.smartTargetingTestSamplingInputsDirty ===
                true
            }
            selectionOrderIsPending={
              campaignData.segment.smartTargetingSelectionOrderPending === true
            }
            prepareCampaign={prepareTestPreview}
            onConfigurationPersisted={handleTestConfigurationPersisted}
            onPreviewChange={handleTestPreviewChange}
            onPreviewInvalidated={handleTestPreviewInvalidated}
            copy={segmentCopy.smartTargeting.testPreview}
          />
        ) : (
          <>
            {/* Budget selector based on user balance */}
            <BudgetSelector
              accessToken={accessToken}
              initialPercent={10}
              onChange={handlePercentBudgetChange}
            />

            {/* Total Budget and Message Count side-by-side */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <BudgetInputCard
                value={campaignData.budget.totalBudget}
                onChange={handleTotalBudgetChange}
                title={t.campaignBudget}
                label={''}
                placeholder={t.budgetPlaceholder}
                helpText={t.budgetHelp}
                validationMessage={t.budgetValidation}
                currencyLabel={currencyLabel}
                budgetLabel={t.budget}
                min={MIN_TEXT_BUDGET}
                max={MAX_BUDGET}
                step={BUDGET_STEP}
              />

              <MessageCountCard
                messageCount={messageCount}
                maxMessageCount={maxMessageCount}
                isLoading={isLoadingMessageCount}
                isQueued={isQueuedMessageCount}
                error={messageCountError}
                title={t.estimatedMessages}
                calculatingLabel={t.calculatingMessageCount}
                messagesLabel={t.messages}
                enterBudgetText={t.enterBudgetToSee}
                sentLabel={t.sentCountLabel}
                capacityLabel={t.capacityCountLabel}
                showCapacity={!hideCapacityCount}
                idleText={
                  hasCalculationInputs ? t.calculateMessageCount : undefined
                }
              />
            </div>

            <div className='flex items-center'>
              <Button variant='outline' onClick={handleReset}>
                {t.reset}
              </Button>
            </div>
          </>
        )}

        <TestMessageSection activePlatformSettings={activePlatformSettings} />
      </div>
    </div>
  );
};

export default BudgetStep;
