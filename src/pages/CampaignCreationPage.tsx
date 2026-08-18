import React, { useEffect } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useCampaign } from '../hooks/useCampaign';
import { useNavigation } from '../contexts/NavigationContext';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';
import { getApiErrorMessage, getErrorMessage } from '../utils/errorHandler';
import {
  serializeCampaignPayload,
  validateCampaignContent,
} from '../utils/campaignUtils';
import { useCampaignValidation } from '../hooks/useCampaignValidation';
import CampaignSegmentStep from '../components/campaign/CampaignSegmentStep';
import CampaignContentStep from '../components/campaign/CampaignContentStep';
import CampaignBudgetStep from '../components/campaign/CampaignBudgetStep';
import CampaignPaymentStep from '../components/campaign/CampaignPaymentStep';
import { budgetI18n } from '../components/campaign/budget/budgetTranslations';
import { contentI18n } from '../components/campaign/content/contentTranslations';
import Button from '../components/ui/Button';
import Stepper from '../components/ui/Stepper';
import {
  CampaignStep,
  CreateCampaignPayload,
  UpdateSMSCampaignRequest,
} from '../types/campaign';
import {
  isSmartTargetingCapacityRecalculationError,
  normalizeSmartTargetingCapacityCalculation,
} from '../utils/smartTargetingCapacity';

const CampaignCreationPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, language } = useLanguage();
  const { accessToken, user } = useAuth();
  const budgetCopy =
    budgetI18n[language as keyof typeof budgetI18n] || budgetI18n.en;
  const contentCopy =
    contentI18n[language as keyof typeof contentI18n] || contentI18n.en;
  const {
    currentStep,
    campaignData,
    error,
    nextStep,
    previousStep,
    goToStep,
    updateLevel,
    updateBudget,
    ensureCampaignCreated,
    resetCampaign,
  } = useCampaign();
  const { showError, showSuccess } = useToast();
  const { navigate } = useNavigation();
  const [isFinishing, setIsFinishing] = React.useState(false);
  const [isAdvancing, setIsAdvancing] = React.useState(false);
  const advancingRef = React.useRef(false);
  const finishingRef = React.useRef(false);

  // Use the validation hook
  const validation = useCampaignValidation(
    campaignData,
    currentStep,
    user?.account_type === 'marketing_agency'
  );

  // Campaign data is now retained when navigating away and returning
  // Only reset when campaign is actually finished (see handleFinish function)

  // Scroll to top whenever the step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    if (validation.isStepAccessible(currentStep)) return;
    for (let step = 1; step < currentStep; step += 1) {
      if (!validation.isStepCompleted(step)) {
        goToStep(step);
        return;
      }
    }
  }, [currentStep, goToStep, validation]);

  // Campaign UUID will be created when user clicks "next" on the segment page (step 1)

  // Remove the useEffect that automatically calls API on mount
  // This was causing infinite loops and unnecessary API calls

  // Ensure API service has token to avoid race on hard refresh
  useEffect(() => {
    if (accessToken) {
      apiService.setAccessToken(accessToken);
    }
  }, [accessToken]);

  const handleCampaignUpdateError = (
    response: {
      success: boolean;
      message?: string;
      error?: { code?: string; details?: unknown };
    },
    fallbackMessage: string
  ) => {
    const errorCode = response.error?.code;
    const isSmartTargeting =
      campaignData.segment.audienceTargetingMethod === 'smart_targeting';
    const smartTargetingTestErrorCodes = new Set([
      'SMART_TARGETING_TEST_PREVIEW_REQUIRED',
      'SMART_TARGETING_TEST_NO_SATISFIED_TAGS',
      'SMART_TARGETING_SAMPLE_SIZE_REQUIRED',
      'SMART_TARGETING_SAMPLE_SIZE_INVALID',
      'SMART_TARGETING_TEST_AUDIENCE_COUNT_OVERFLOW',
      'CAMPAIGN_COST_OVERFLOW',
    ]);
    if (
      isSmartTargeting &&
      campaignData.segment.phase === 'test' &&
      errorCode &&
      smartTargetingTestErrorCodes.has(errorCode)
    ) {
      const availabilityMustBeCheckedAgain =
        errorCode === 'SMART_TARGETING_TEST_PREVIEW_REQUIRED' ||
        errorCode === 'SMART_TARGETING_TEST_NO_SATISFIED_TAGS';
      if (availabilityMustBeCheckedAgain) {
        updateLevel({
          smartTargetingTestPreview: null,
          smartTargetingTestPreviewInputKey: null,
          smartTargetingTestPreviewStale: true,
        });
        updateBudget({ totalBudget: 0, estimatedMessages: undefined });
      }
      goToStep(availabilityMustBeCheckedAgain ? 3 : 1);
      showError(getErrorMessage(errorCode, language, fallbackMessage));
      return;
    }
    if (
      isSmartTargeting &&
      isSmartTargetingCapacityRecalculationError(errorCode)
    ) {
      const pendingCalculation = normalizeSmartTargetingCapacityCalculation(
        response.error?.details
      );
      if (pendingCalculation) {
        updateLevel({
          smartTargetingCapacityCalculation: pendingCalculation,
          smartTargetingScoreClasses: pendingCalculation.selected_score_classes,
          smartTargetingScoreClassesDirty: false,
          smartTargetingTestSamplingInputsDirty: false,
          smartTargetingExactCapacityRequired: true,
        });
      } else if (campaignData.segment.smartTargetingCapacityCalculation) {
        updateLevel({
          smartTargetingCapacityCalculation: {
            ...campaignData.segment.smartTargetingCapacityCalculation,
            status: 'recalculation_required',
            is_current: false,
            recalculation_required: true,
          },
          smartTargetingExactCapacityRequired: true,
        });
      } else {
        updateLevel({ smartTargetingExactCapacityRequired: true });
      }
      goToStep(1);
      showError(
        getErrorMessage(
          errorCode,
          language,
          getErrorMessage('SMART_TARGETING_EXACT_CAPACITY_REQUIRED', language)
        )
      );
      return;
    }

    showError(getApiErrorMessage(response, language, fallbackMessage));
  };

  const handleNextStep = async () => {
    if (advancingRef.current) return;
    const liveContentValidation =
      currentStep >= 2
        ? validateCampaignContent(
            campaignData.content,
            campaignData.segment.platform
          )
        : { isValid: true, error: null };
    if (
      !validation.canProceedToNextStep(currentStep) ||
      !liveContentValidation.isValid
    ) {
      const message =
        liveContentValidation.error ||
        validation.getStepErrors(currentStep)[0] ||
        'Please complete the current step';
      showError(message);
      return;
    }

    advancingRef.current = true;
    setIsAdvancing(true);

    try {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {}

      apiService.setAccessToken(accessToken);

      if (currentStep === 1) {
        const hasExistingCampaign = Boolean(campaignData.uuid.trim());

        if (hasExistingCampaign) {
          if (!campaignData.uuid) {
            showError(t('common.error') || 'Campaign ID not found');
            return;
          }
          const updatePayload: UpdateSMSCampaignRequest =
            serializeCampaignPayload(campaignData, {
              includeContent: false,
              includeBudget: false,
              finalize: false,
            });
          const response = await apiService.updateCampaign(
            campaignData.uuid,
            updatePayload
          );
          if (!response.success) {
            handleCampaignUpdateError(response, 'Failed to save campaign');
            return;
          }
        } else {
          const payload: CreateCampaignPayload =
            serializeCampaignPayload(campaignData);
          const response = await ensureCampaignCreated(() =>
            apiService.createCampaign(payload)
          );
          if (
            !response.success ||
            !response.data ||
            typeof response.data.uuid !== 'string' ||
            !response.data.uuid.trim() ||
            !Number.isInteger(response.data.id) ||
            response.data.id <= 0
          ) {
            const errorMessage = getApiErrorMessage(
              response,
              language,
              'Failed to create campaign'
            );
            showError(errorMessage);
            return;
          }
        }
        updateLevel({ smartTargetingSelectionDirty: false });
        nextStep();
        return;
      }

      if (currentStep === 2) {
        if (!campaignData.uuid) {
          showError(t('common.error') || 'Campaign ID not found');
          return;
        }
        const updatePayload: UpdateSMSCampaignRequest =
          serializeCampaignPayload(campaignData, {
            includeContent: true,
            includeBudget: false,
            finalize: false,
          });
        const response = await apiService.updateCampaign(
          campaignData.uuid,
          updatePayload
        );
        if (!response.success) {
          handleCampaignUpdateError(
            response,
            'Failed to save campaign content'
          );
          return;
        }
        nextStep();
        return;
      }

      if (currentStep === 3) {
        if (!campaignData.uuid) {
          showError(t('common.error') || 'Campaign ID not found');
          return;
        }
        const updatePayload: UpdateSMSCampaignRequest =
          serializeCampaignPayload(campaignData, {
            includeContent: true,
            includeBudget: true,
            finalize: false,
          });
        const response = await apiService.updateCampaign(
          campaignData.uuid,
          updatePayload
        );
        if (!response.success) {
          handleCampaignUpdateError(response, 'Failed to save campaign budget');
          return;
        }
        nextStep();
        return;
      }

      nextStep();
    } catch {
      showError('Network error - please try again');
    } finally {
      advancingRef.current = false;
      setIsAdvancing(false);
    }
  };

  const handlePreviousStep = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
    previousStep();
  };

  const handleStepClick = async (step: number) => {
    if (step !== currentStep) {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {}
    }

    if (step < currentStep) {
      // Mirror backward navigation behavior from the footer controls.
      goToStep(step);
    } else if (step === currentStep + 1) {
      // Reuse the same API-backed progression flow as the footer "Next" button.
      await handleNextStep();
    }

    // If step > currentStep + 1, don't allow skipping ahead
  };

  const handleFinish = async () => {
    if (finishingRef.current) return;
    const liveContentValidation = validateCampaignContent(
      campaignData.content,
      campaignData.segment.platform
    );
    if (!validation.canFinishCampaign() || !liveContentValidation.isValid) {
      const invalidStep = [1, 2, 3, 4].find(
        step => !validation.isStepCompleted(step)
      );
      showError(
        liveContentValidation.error ||
          (invalidStep
            ? validation.getStepErrors(invalidStep)[0]
            : undefined) ||
          'Please complete every campaign step'
      );
      return;
    }

    finishingRef.current = true;
    setIsFinishing(true);
    try {
      // Call API to update campaign
      if (!campaignData.uuid) {
        throw new Error('Campaign UUID not found');
      }

      apiService.setAccessToken(accessToken);

      const updateData: UpdateSMSCampaignRequest = serializeCampaignPayload(
        campaignData,
        {
          includeContent: true,
          includeBudget: true,
          finalize: true,
        }
      );

      const response = await apiService.updateCampaign(
        campaignData.uuid,
        updateData
      );

      if (!response.success) {
        const errorCode = response.error?.code;
        if (errorCode === 'SCHEDULE_TIME_TOO_SOON') {
          showError(t('campaign.errors.scheduleTimeTooSoon'));
          return;
        }
        if (errorCode === 'INVALID_SCHEDULE_TIME') {
          showError(t('campaign.errors.invalidScheduleTime'));
          return;
        }
        handleCampaignUpdateError(response, 'Failed to update campaign');
        return;
      }

      // Clear campaign data from localStorage completely
      localStorage.removeItem('campaign_creation_data');
      localStorage.removeItem('campaign_creation_step');

      // Reset campaign state in React context as well
      resetCampaign();

      // Show success message and navigate to dashboard
      const successMessage =
        language === 'fa'
          ? 'کمپین با موفقیت تکمیل شد.'
          : 'Campaign completed successfully!';
      showSuccess(successMessage);
      navigate('/dashboard');
    } catch {
      // Show error message but DO NOT redirect to dashboard
      // This prevents infinite loops and allows user to see the error
      showError(
        language === 'fa'
          ? 'تکمیل کمپین ناموفق بود. لطفاً دوباره تلاش کنید.'
          : 'Failed to complete campaign. Please try again.'
      );

      // DO NOT redirect to dashboard on error
      // User stays on payment page to see the error message
    } finally {
      finishingRef.current = false;
      setIsFinishing(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <CampaignSegmentStep />;
      case 2:
        return <CampaignContentStep />;
      case 3:
        return <CampaignBudgetStep />;
      case 4:
        return <CampaignPaymentStep />;
      default:
        return <CampaignSegmentStep />;
    }
  };

  // Create step configuration for the stepper
  const steps: CampaignStep[] = [
    {
      id: 1,
      title: t('campaign.steps.segment.title'),
      isCompleted: validation.isStepCompleted(1),
      isAccessible: validation.isStepAccessible(1),
    },
    {
      id: 2,
      title: contentCopy.title,
      isCompleted: validation.isStepCompleted(2),
      isAccessible: validation.isStepAccessible(2),
    },
    {
      id: 3,
      title: budgetCopy.title,
      isCompleted: validation.isStepCompleted(3),
      isAccessible: validation.isStepAccessible(3),
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              <Button
                variant='ghost'
                onClick={() => (window.location.href = '/dashboard')}
                className={`flex items-center text-gray-600 hover:text-gray-900 transition-colors ${
                  isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
                }`}
              >
                <ChevronLeft className='h-5 w-5' />
                <span>{t('dashboard.title')}</span>
              </Button>
            </div>

            <div className='flex items-center space-x-4'>
              <h1 className='text-xl font-semibold text-gray-900'>
                {/* {t('campaign.title')} */}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Main Content */}
      {/* <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-md p-4'>
            <p className='text-sm text-red-600'>{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className='mb-8'>{renderCurrentStep()}</div>

        {/* Navigation Buttons */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            {currentStep > 1 && (
              <Button
                variant='outline'
                onClick={handlePreviousStep}
                className={`flex items-center ${
                  isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
                }`}
              >
                {/* <ChevronLeft className="h-4 w-4" /> */}
                {t('common.previous')}
              </Button>
            )}
          </div>

          <div className='flex items-center space-x-4'>
            {currentStep < 4 ? (
              <Button
                onClick={handleNextStep}
                disabled={
                  isAdvancing || !validation.canProceedToNextStep(currentStep)
                }
                className={`flex items-center ${
                  isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
                }`}
              >
                {t('common.next')}
                {/* <ChevronRight className="h-4 w-4" /> */}
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!validation.canFinishCampaign() || isFinishing}
                className={`flex items-center ${
                  isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
                }`}
              >
                <Check className='h-4 w-4' />
                {isFinishing ? t('common.loading') : t('common.finish2')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreationPage;
