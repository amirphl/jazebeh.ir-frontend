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
import type { ExecutionReservationState } from '../components/campaign/CampaignPaymentStep';
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
  isCurrentUsableSmartTargetingCapacity,
  isSmartTargetingCapacityActive,
  isSmartTargetingCapacityRecalculationError,
  normalizeSmartTargetingCapacityCalculation,
} from '../utils/smartTargetingCapacity';
import {
  getSmartTargetingExecutionCalculationInputKey,
  isSmartTargetingExecutionCalculationActive,
  isSmartTargetingExecutionCalculationReady,
  isSmartTargetingExecutionCalculationStale,
  isNonRetryableSmartTargetingExecutionPollError,
  normalizeSmartTargetingExecutionCalculation,
  SMART_TARGETING_EXECUTION_POLL_INTERVAL_MS,
} from '../utils/smartTargetingExecutionCalculation';

const isSmartTargetingExecutionCampaign = (
  data: Parameters<typeof serializeCampaignPayload>[0]
) =>
  data.segment.audienceTargetingMethod === 'smart_targeting' &&
  data.segment.phase === 'execution';

const isUnknownFinalizationFailure = (errorCode: string): boolean =>
  [
    '',
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'INVALID_RESPONSE',
    'REQUEST_FAILED',
  ].includes(errorCode);

const SMART_TARGETING_CAPACITY_PENDING_MAX_RETRIES = 12;

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
  const campaignDataRef = React.useRef(campaignData);
  const executionReservationAbortRef = React.useRef<AbortController | null>(
    null
  );
  campaignDataRef.current = campaignData;
  const isExecutionReservationLocked =
    isSmartTargetingExecutionCampaign(campaignData) &&
    (isFinishing ||
      ['saving', 'requesting', 'polling', 'ready', 'committing'].includes(
        campaignData.segment.smartTargetingExecutionReservation?.phase || 'idle'
      ));
  const persistedReservation =
    campaignData.segment.smartTargetingExecutionReservation;
  const displayedReservationState: ExecutionReservationState =
    persistedReservation?.phase || 'idle';
  const displayedReservationError =
    persistedReservation?.error_message ||
    (persistedReservation?.error_code
      ? getErrorMessage(
          persistedReservation.error_code,
          language,
          persistedReservation.error_code
        )
      : null);

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
    if (isExecutionReservationLocked) return;
    if (validation.isStepAccessible(currentStep)) return;
    for (let step = 1; step < currentStep; step += 1) {
      if (!validation.isStepCompleted(step)) {
        goToStep(step);
        return;
      }
    }
  }, [currentStep, goToStep, isExecutionReservationLocked, validation]);

  // Campaign UUID will be created when user clicks "next" on the segment page (step 1)

  // Remove the useEffect that automatically calls API on mount
  // This was causing infinite loops and unnecessary API calls

  // Ensure API service has token to avoid race on hard refresh
  useEffect(() => {
    if (accessToken) {
      apiService.setAccessToken(accessToken);
    }
  }, [accessToken]);

  const handleCampaignUpdateError = React.useCallback(
    (
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
            smartTargetingExecutionReservation: null,
            smartTargetingCapacityCalculation: pendingCalculation,
            smartTargetingScoreClasses:
              pendingCalculation.selected_score_classes,
            smartTargetingScoreClassesDirty: false,
            smartTargetingTestSamplingInputsDirty: false,
            smartTargetingExactCapacityRequired: true,
            smartTargetingExactCapacityInputKey: null,
            smartTargetingExactCapacityForceFreshCalculation: true,
            smartTargetingExactCapacityInvalidatedCalculationId:
              campaignData.segment.smartTargetingCapacityCalculation
                ?.calculation_id ?? null,
            smartTargetingExactCapacityFreshCalculationId: null,
          });
        } else if (campaignData.segment.smartTargetingCapacityCalculation) {
          updateLevel({
            smartTargetingExecutionReservation: null,
            smartTargetingCapacityCalculation: {
              ...campaignData.segment.smartTargetingCapacityCalculation,
              status: 'recalculation_required',
              is_current: false,
              recalculation_required: true,
            },
            smartTargetingExactCapacityRequired: true,
            smartTargetingExactCapacityInputKey: null,
            smartTargetingExactCapacityForceFreshCalculation: true,
            smartTargetingExactCapacityInvalidatedCalculationId:
              campaignData.segment.smartTargetingCapacityCalculation
                ?.calculation_id ?? null,
            smartTargetingExactCapacityFreshCalculationId: null,
          });
        } else {
          updateLevel({
            smartTargetingExecutionReservation: null,
            smartTargetingExactCapacityRequired: true,
            smartTargetingExactCapacityInputKey: null,
            smartTargetingExactCapacityForceFreshCalculation: true,
            smartTargetingExactCapacityInvalidatedCalculationId: null,
            smartTargetingExactCapacityFreshCalculationId: null,
          });
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
    },
    [
      campaignData.segment.audienceTargetingMethod,
      campaignData.segment.phase,
      campaignData.segment.smartTargetingCapacityCalculation,
      goToStep,
      language,
      showError,
      updateBudget,
      updateLevel,
    ]
  );

  const handleNextStep = async () => {
    if (isExecutionReservationLocked) return;
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
    if (isExecutionReservationLocked) return;
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
    previousStep();
  };

  const handleStepClick = async (step: number) => {
    if (isExecutionReservationLocked) return;
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

  const completeCampaignSuccessfully = React.useCallback(() => {
    localStorage.removeItem('campaign_creation_data');
    localStorage.removeItem('campaign_creation_step');
    resetCampaign();
    showSuccess(
      language === 'fa'
        ? 'کمپین با موفقیت تکمیل شد.'
        : 'Campaign completed successfully!'
    );
    navigate('/dashboard');
  }, [language, navigate, resetCampaign, showSuccess]);

  const returnToExactCapacity = React.useCallback(
    (message: string) => {
      executionReservationAbortRef.current?.abort();
      executionReservationAbortRef.current = null;
      const current = campaignDataRef.current;
      updateLevel({
        smartTargetingExecutionReservation: null,
        smartTargetingCapacityCalculation: null,
        smartTargetingExactCapacityInputKey: null,
        smartTargetingExactCapacityRequired: true,
        smartTargetingExactCapacityForceFreshCalculation: true,
        smartTargetingExactCapacityInvalidatedCalculationId:
          current.segment.smartTargetingCapacityCalculation?.calculation_id ??
          null,
        smartTargetingExactCapacityFreshCalculationId: null,
      });
      goToStep(1);
      showError(message);
    },
    [goToStep, showError, updateLevel]
  );

  const runExecutionReservation = React.useCallback(
    async (resume = false) => {
      if (finishingRef.current) return;
      const initialCampaign = campaignDataRef.current;
      if (!isSmartTargetingExecutionCampaign(initialCampaign)) return;

      const uuid = initialCampaign.uuid.trim();
      const title = initialCampaign.segment.campaignTitle.trim();
      const inputKey =
        getSmartTargetingExecutionCalculationInputKey(initialCampaign);
      if (!uuid || !title) {
        showError('Campaign ID not found');
        return;
      }
      const hasCurrentExactCapacity =
        initialCampaign.segment.smartTargetingSelectionDirty !== true &&
        initialCampaign.segment.smartTargetingScoreClassesDirty !== true &&
        initialCampaign.segment.smartTargetingExactCapacityRequired !== true &&
        initialCampaign.segment
          .smartTargetingExactCapacityForceFreshCalculation !== true &&
        initialCampaign.segment.smartTargetingExactCapacityInputKey ===
          inputKey &&
        isCurrentUsableSmartTargetingCapacity(
          initialCampaign.segment.smartTargetingCapacityCalculation,
          initialCampaign.segment.selectedTagIds,
          initialCampaign.segment.smartTargetingScoreClasses
        );
      if (!hasCurrentExactCapacity) {
        returnToExactCapacity(
          getErrorMessage(
            'SMART_TARGETING_EXACT_CAPACITY_REQUIRED',
            language,
            'Calculate the current exact Smart Targeting capacity before continuing.'
          )
        );
        return;
      }
      const matchesCurrentInputs = () =>
        getSmartTargetingExecutionCalculationInputKey(
          campaignDataRef.current
        ) === inputKey;
      const storedReservation =
        initialCampaign.segment.smartTargetingExecutionReservation;
      const storedCalculation = storedReservation?.calculation;
      let calculation =
        storedReservation?.input_key === inputKey && storedCalculation
          ? storedCalculation
          : null;
      // A failed job can be explicitly retried from the payment screen; it
      // must not be mistaken for a reusable reservation.
      if (calculation?.status === 'failed') {
        calculation = null;
      }
      const controller = new AbortController();
      executionReservationAbortRef.current?.abort();
      executionReservationAbortRef.current = controller;
      finishingRef.current = true;
      setIsFinishing(true);

      const persist = (
        nextCalculation: typeof calculation,
        phase:
          | 'saving'
          | 'requesting'
          | 'polling'
          | 'ready'
          | 'committing'
          | 'failed',
        errorCode?: string | null,
        errorMessage?: string | null
      ) => {
        updateLevel({
          smartTargetingExecutionReservation: {
            phase,
            input_key: inputKey,
            calculation: nextCalculation,
            error_code: errorCode ?? null,
            error_message: errorMessage ?? null,
          },
        });
      };
      const stopForChangedInputs = () => {
        if (matchesCurrentInputs()) return false;
        return true;
      };
      const waitForNextPoll = (delay: number) =>
        new Promise<void>(resolve => window.setTimeout(resolve, delay));
      let retryCount = 0;
      let confirmationPollRequired = false;

      try {
        apiService.setAccessToken(accessToken);
        if (
          resume &&
          storedReservation?.phase === 'requesting' &&
          !calculation
        ) {
          let recoveryRetries = 0;
          while (!controller.signal.aborted && !calculation) {
            const currentResponse =
              await apiService.getCurrentSmartTargetingExecutionCalculation(
                uuid,
                controller.signal
              );
            if (controller.signal.aborted || stopForChangedInputs()) return;
            const recovered = normalizeSmartTargetingExecutionCalculation(
              currentResponse.success ? currentResponse.data : null
            );
            if (recovered) {
              calculation = recovered;
              persist(calculation, 'polling');
              break;
            }
            if (
              isSmartTargetingCapacityRecalculationError(
                currentResponse.error?.code
              )
            ) {
              returnToExactCapacity(
                getErrorMessage(
                  currentResponse.error?.code,
                  language,
                  'Calculate the current exact Smart Targeting capacity before continuing.'
                )
              );
              return;
            }
            if (
              isNonRetryableSmartTargetingExecutionPollError(
                currentResponse.error?.code
              ) ||
              recoveryRetries >= SMART_TARGETING_CAPACITY_PENDING_MAX_RETRIES
            ) {
              persist(
                null,
                'failed',
                currentResponse.error?.code ||
                  'SMART_TARGETING_EXECUTION_CALCULATION_LOOKUP_FAILED',
                getApiErrorMessage(
                  currentResponse,
                  language,
                  'The audience reservation could not be recovered. Retry to continue.'
                )
              );
              return;
            }
            recoveryRetries += 1;
            persist(
              null,
              'requesting',
              currentResponse.error?.code ||
                'SMART_TARGETING_EXECUTION_CALCULATION_LOOKUP_FAILED',
              getErrorMessage(
                'SMART_TARGETING_EXECUTION_CALCULATION_LOOKUP_FAILED',
                language,
                'The audience reservation is being recovered. Retrying automatically.'
              )
            );
            await waitForNextPoll(SMART_TARGETING_EXECUTION_POLL_INTERVAL_MS);
          }
        }
        if (
          resume &&
          storedReservation?.phase === 'committing' &&
          calculation
        ) {
          const statusResponse =
            await apiService.getSmartTargetingExecutionCalculationById(
              uuid,
              calculation.calculation_id,
              controller.signal
            );
          if (controller.signal.aborted || stopForChangedInputs()) return;
          const refreshed = normalizeSmartTargetingExecutionCalculation(
            statusResponse.success ? statusResponse.data : null
          );
          if (refreshed?.status === 'committed') {
            completeCampaignSuccessfully();
            return;
          }
          if (isSmartTargetingExecutionCalculationStale(refreshed)) {
            returnToExactCapacity(
              getErrorMessage(
                'SMART_TARGETING_EXECUTION_CALCULATION_STALE',
                language,
                'The audience reservation is no longer current. Request a new audience reservation.'
              )
            );
            return;
          }
          if (refreshed?.status === 'failed') {
            persist(
              refreshed,
              'failed',
              refreshed.error_code,
              refreshed.error_message
            );
            return;
          }
          if (isSmartTargetingExecutionCalculationReady(refreshed)) {
            calculation = refreshed;
            confirmationPollRequired = true;
            persist(
              refreshed,
              'polling',
              'SMART_TARGETING_EXECUTION_CALCULATION_COMMIT_FAILED',
              getErrorMessage(
                'SMART_TARGETING_EXECUTION_CALCULATION_COMMIT_FAILED',
                language,
                'Confirming the reservation status before retrying finalization.'
              )
            );
          }
          if (
            refreshed &&
            !isSmartTargetingExecutionCalculationReady(refreshed)
          ) {
            calculation = refreshed;
          }
          if (!refreshed) {
            confirmationPollRequired = true;
            persist(
              calculation,
              'polling',
              statusResponse.error?.code ||
                'SMART_TARGETING_EXECUTION_CALCULATION_LOOKUP_FAILED',
              getApiErrorMessage(
                statusResponse,
                language,
                'The reservation status could not be confirmed. Retrying automatically.'
              )
            );
          }
        }
        if (
          !calculation &&
          (!resume || storedReservation?.phase === 'saving')
        ) {
          persist(null, 'saving');
          const selectedTagIds = Array.from(
            new Set(
              (initialCampaign.segment.selectedTagIds || []).filter(
                tagId => Number.isSafeInteger(tagId) && tagId > 0
              )
            )
          );
          const selectedTagKey = [...selectedTagIds]
            .sort((left, right) => left - right)
            .join(',');
          const selectionResponse =
            await apiService.replaceCampaignSmartTargetingSelection(
              uuid,
              { tag_ids: selectedTagIds },
              controller.signal
            );
          if (controller.signal.aborted || stopForChangedInputs()) return;
          const persistedTagIds =
            selectionResponse.data?.selected_tag_ids || [];
          const persistedTagKey = Array.from(
            new Set(
              persistedTagIds.filter(
                tagId => Number.isSafeInteger(tagId) && tagId > 0
              )
            )
          )
            .sort((left, right) => left - right)
            .join(',');
          if (
            !selectionResponse.success ||
            persistedTagKey !== selectedTagKey
          ) {
            persist(
              null,
              'failed',
              selectionResponse.error?.code ||
                'SMART_TARGETING_SELECTION_INVALID',
              getApiErrorMessage(
                selectionResponse,
                language,
                'Failed to save the Smart Targeting tag selection before requesting the audience reservation.'
              )
            );
            return;
          }
          updateLevel({
            smartTargetingSelectionDirty: false,
            smartTargetingSelectedRawCapacity: Math.max(
              0,
              selectionResponse.data?.summary?.selected_raw_capacity ?? 0
            ),
          });
          // The exact-capacity result already represents these campaign
          // inputs. Updating the full campaign here can advance the backend
          // input revision and make the execution reservation stale before it
          // has a chance to run. Only persist the tag selection, then request
          // the reservation against the current exact-capacity snapshot.
        }

        if (!calculation) {
          persist(null, 'requesting');
          let capacityPendingRetries = 0;
          let response =
            await apiService.startSmartTargetingExecutionCalculation(
              uuid,
              controller.signal
            );
          if (controller.signal.aborted || stopForChangedInputs()) return;
          while (
            response.error?.code === 'SMART_TARGETING_CAPACITY_PENDING' &&
            !controller.signal.aborted
          ) {
            if (
              capacityPendingRetries >=
              SMART_TARGETING_CAPACITY_PENDING_MAX_RETRIES
            ) {
              updateLevel({
                smartTargetingExecutionReservation: null,
                smartTargetingExactCapacityRequired: true,
              });
              goToStep(1);
              showError(
                getErrorMessage(
                  'SMART_TARGETING_CAPACITY_PENDING',
                  language,
                  'Exact capacity is still calculating. Continue from Segment once it finishes.'
                )
              );
              return;
            }
            capacityPendingRetries += 1;
            persist(
              null,
              'requesting',
              response.error.code,
              getErrorMessage(
                'SMART_TARGETING_CAPACITY_PENDING',
                language,
                'Preparing the required audience snapshot. Retrying automatically.'
              )
            );
            await waitForNextPoll(SMART_TARGETING_EXECUTION_POLL_INTERVAL_MS);
            if (controller.signal.aborted || stopForChangedInputs()) return;
            const capacityResponse =
              await apiService.getCurrentSmartTargetingCapacityCalculation(
                uuid,
                controller.signal
              );
            if (controller.signal.aborted || stopForChangedInputs()) return;
            const capacity = normalizeSmartTargetingCapacityCalculation(
              capacityResponse.success ? capacityResponse.data : null
            );
            if (capacity) {
              updateLevel({
                smartTargetingCapacityCalculation: capacity,
                smartTargetingExactCapacityRequired: true,
              });
            }
            if (capacity && isSmartTargetingCapacityActive(capacity)) {
              continue;
            }
            if (
              capacity &&
              !isCurrentUsableSmartTargetingCapacity(
                capacity,
                initialCampaign.segment.selectedTagIds,
                initialCampaign.segment.smartTargetingScoreClasses
              )
            ) {
              returnToExactCapacity(
                getErrorMessage(
                  'SMART_TARGETING_EXACT_CAPACITY_REQUIRED',
                  language,
                  'The exact capacity result is no longer usable. Recalculate it before continuing.'
                )
              );
              return;
            }
            response = await apiService.startSmartTargetingExecutionCalculation(
              uuid,
              controller.signal
            );
            if (controller.signal.aborted || stopForChangedInputs()) return;
          }
          calculation = normalizeSmartTargetingExecutionCalculation(
            response.success ? response.data : response.error?.details
          );
          if (!calculation) {
            const errorCode = response.error?.code || '';
            if (isSmartTargetingCapacityRecalculationError(errorCode)) {
              returnToExactCapacity(
                getErrorMessage(
                  errorCode,
                  language,
                  'The audience reservation could not be requested. Retry after correcting the campaign.'
                )
              );
              return;
            }
            persist(
              null,
              'failed',
              response.error?.code || null,
              getApiErrorMessage(
                response,
                language,
                'Failed to request the audience reservation'
              )
            );
            return;
          }
          persist(calculation, 'polling');
        }

        while (!controller.signal.aborted) {
          if (stopForChangedInputs()) return;
          if (isSmartTargetingExecutionCalculationStale(calculation)) {
            returnToExactCapacity(
              getErrorMessage(
                'SMART_TARGETING_EXECUTION_CALCULATION_STALE',
                language,
                'The audience reservation is no longer current. Request a new audience reservation.'
              )
            );
            return;
          }
          if (calculation.status === 'failed') {
            persist(
              calculation,
              'failed',
              calculation.error_code,
              calculation.error_message
            );
            return;
          }
          if (calculation.status === 'committed') {
            completeCampaignSuccessfully();
            return;
          }
          if (confirmationPollRequired) {
            persist(calculation, 'polling');
            await waitForNextPoll(SMART_TARGETING_EXECUTION_POLL_INTERVAL_MS);
            if (controller.signal.aborted || stopForChangedInputs()) return;
            const confirmationResponse =
              await apiService.getSmartTargetingExecutionCalculationById(
                uuid,
                calculation.calculation_id,
                controller.signal
              );
            if (controller.signal.aborted || stopForChangedInputs()) return;
            const confirmed = normalizeSmartTargetingExecutionCalculation(
              confirmationResponse.success ? confirmationResponse.data : null
            );
            if (!confirmed) {
              if (
                isNonRetryableSmartTargetingExecutionPollError(
                  confirmationResponse.error?.code
                )
              ) {
                persist(
                  null,
                  'failed',
                  confirmationResponse.error?.code || null,
                  getApiErrorMessage(
                    confirmationResponse,
                    language,
                    'The reservation status cannot be retrieved. Retry after correcting the campaign or signing in again.'
                  )
                );
                return;
              }
              retryCount += 1;
              persist(
                calculation,
                'polling',
                confirmationResponse.error?.code || null,
                getApiErrorMessage(
                  confirmationResponse,
                  language,
                  'The reservation status could not be confirmed. Retrying automatically.'
                )
              );
              continue;
            }
            retryCount = 0;
            calculation = confirmed;
            confirmationPollRequired = false;
            persist(calculation, 'polling');
            continue;
          }
          if (isSmartTargetingExecutionCalculationReady(calculation)) {
            persist(calculation, 'committing');
            const finalResponse = await apiService.updateCampaign(
              uuid,
              {
                title,
                finalize: true,
                execution_audience_calculation_id: calculation.calculation_id,
              },
              controller.signal
            );
            if (controller.signal.aborted || stopForChangedInputs()) return;
            if (!finalResponse.success) {
              const errorCode = finalResponse.error?.code || '';
              if (isSmartTargetingCapacityRecalculationError(errorCode)) {
                returnToExactCapacity(
                  getErrorMessage(
                    errorCode,
                    language,
                    'The audience reservation is no longer current. Request a new audience reservation.'
                  )
                );
                return;
              }
              if (
                errorCode === 'SMART_TARGETING_EXECUTION_CALCULATION_REQUIRED'
              ) {
                // Discard only the missing or unusable execution proposal so
                // Retry starts a new one.
                persist(
                  null,
                  'failed',
                  errorCode,
                  getApiErrorMessage(
                    finalResponse,
                    language,
                    'Request a new audience reservation and try again.'
                  )
                );
                return;
              }
              const statusResponse =
                await apiService.getSmartTargetingExecutionCalculationById(
                  uuid,
                  calculation.calculation_id,
                  controller.signal
                );
              if (controller.signal.aborted || stopForChangedInputs()) return;
              const refreshed = normalizeSmartTargetingExecutionCalculation(
                statusResponse.success ? statusResponse.data : null
              );
              if (refreshed?.status === 'committed') {
                completeCampaignSuccessfully();
                return;
              }
              if (isSmartTargetingExecutionCalculationStale(refreshed)) {
                returnToExactCapacity(
                  getErrorMessage(
                    'SMART_TARGETING_EXECUTION_CALCULATION_STALE',
                    language,
                    'The audience reservation is no longer current. Request a new audience reservation.'
                  )
                );
                return;
              }
              if (refreshed?.status === 'failed') {
                persist(
                  refreshed,
                  'failed',
                  refreshed.error_code,
                  refreshed.error_message
                );
                return;
              }
              if (
                refreshed &&
                (isSmartTargetingExecutionCalculationActive(refreshed) ||
                  isSmartTargetingExecutionCalculationReady(refreshed))
              ) {
                calculation = refreshed;
                if (!isUnknownFinalizationFailure(errorCode)) {
                  persist(
                    calculation,
                    'failed',
                    errorCode || null,
                    getApiErrorMessage(
                      finalResponse,
                      language,
                      'The reservation could not be committed. Retry to continue.'
                    )
                  );
                  return;
                }
                confirmationPollRequired = true;
                persist(
                  calculation,
                  'polling',
                  errorCode || null,
                  getApiErrorMessage(
                    finalResponse,
                    language,
                    'The reservation outcome is unknown. Confirming its status.'
                  )
                );
                continue;
              }
              persist(
                null,
                'failed',
                errorCode,
                getApiErrorMessage(
                  finalResponse,
                  language,
                  'Failed to confirm the audience reservation status'
                )
              );
              return;
            }
            completeCampaignSuccessfully();
            return;
          }

          persist(calculation, 'polling');
          await waitForNextPoll(
            Math.min(
              SMART_TARGETING_EXECUTION_POLL_INTERVAL_MS * (retryCount + 1),
              30_000
            )
          );
          if (controller.signal.aborted || stopForChangedInputs()) return;
          const pollResponse =
            await apiService.getSmartTargetingExecutionCalculationById(
              uuid,
              calculation.calculation_id,
              controller.signal
            );
          if (controller.signal.aborted || stopForChangedInputs()) return;
          const next = normalizeSmartTargetingExecutionCalculation(
            pollResponse.success ? pollResponse.data : null
          );
          if (!next) {
            if (
              isNonRetryableSmartTargetingExecutionPollError(
                pollResponse.error?.code
              )
            ) {
              persist(
                null,
                'failed',
                pollResponse.error?.code || null,
                getApiErrorMessage(
                  pollResponse,
                  language,
                  'The reservation status cannot be retrieved. Retry after correcting the campaign or signing in again.'
                )
              );
              return;
            }
            retryCount += 1;
            persist(
              calculation,
              'polling',
              pollResponse.error?.code || null,
              getErrorMessage(
                'SMART_TARGETING_EXECUTION_CALCULATION_LOOKUP_FAILED',
                language,
                'The latest reservation status could not be loaded. Retrying automatically.'
              )
            );
            continue;
          }
          retryCount = 0;
          calculation = next;
          persist(calculation, 'polling');
        }
      } catch {
        if (!controller.signal.aborted) {
          persist(
            calculation,
            'failed',
            'SMART_TARGETING_EXECUTION_CALCULATION_COMMIT_FAILED',
            getErrorMessage(
              'SMART_TARGETING_EXECUTION_CALCULATION_COMMIT_FAILED',
              language,
              'The audience reservation could not be completed. Retry to continue.'
            )
          );
        }
      } finally {
        if (executionReservationAbortRef.current === controller) {
          executionReservationAbortRef.current = null;
        }
        finishingRef.current = false;
        setIsFinishing(false);
      }
    },
    [
      accessToken,
      completeCampaignSuccessfully,
      goToStep,
      language,
      returnToExactCapacity,
      showError,
      updateLevel,
    ]
  );

  React.useEffect(() => {
    const current = campaignDataRef.current;
    const reservation = current.segment.smartTargetingExecutionReservation;
    if (
      currentStep !== 4 ||
      !isSmartTargetingExecutionCampaign(current) ||
      !reservation
    ) {
      return;
    }
    if (reservation.calculation?.status === 'committed') {
      completeCampaignSuccessfully();
      return;
    }
    if (reservation.phase === 'failed') return;
    if (
      !['saving', 'requesting', 'polling', 'ready', 'committing'].includes(
        reservation.phase
      )
    ) {
      return;
    }
    const inputKey = getSmartTargetingExecutionCalculationInputKey(current);
    if (reservation.input_key !== inputKey) {
      updateLevel({
        smartTargetingExecutionReservation: null,
      });
      return;
    }
    if (
      !reservation.calculation &&
      !['saving', 'requesting'].includes(reservation.phase)
    ) {
      updateLevel({
        smartTargetingExecutionReservation: {
          ...reservation,
          phase: 'failed',
          error_code: 'SMART_TARGETING_EXECUTION_CALCULATION_LOOKUP_FAILED',
          error_message: getErrorMessage(
            'SMART_TARGETING_EXECUTION_CALCULATION_LOOKUP_FAILED',
            language,
            'Reservation recovery needs to be retried.'
          ),
        },
      });
      return;
    }
    void runExecutionReservation(true);
  }, [
    campaignData,
    completeCampaignSuccessfully,
    currentStep,
    language,
    runExecutionReservation,
    updateLevel,
  ]);

  React.useEffect(
    () => () => executionReservationAbortRef.current?.abort(),
    []
  );

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

    if (isSmartTargetingExecutionCampaign(campaignData)) {
      await runExecutionReservation(false);
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

      completeCampaignSuccessfully();
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
        return (
          <CampaignPaymentStep
            executionReservationState={displayedReservationState}
            executionReservationError={displayedReservationError}
            onRetryExecutionReservation={() => {
              void runExecutionReservation(false);
            }}
          />
        );
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
      isAccessible:
        !isExecutionReservationLocked && validation.isStepAccessible(1),
    },
    {
      id: 2,
      title: contentCopy.title,
      isCompleted: validation.isStepCompleted(2),
      isAccessible:
        !isExecutionReservationLocked && validation.isStepAccessible(2),
    },
    {
      id: 3,
      title: budgetCopy.title,
      isCompleted: validation.isStepCompleted(3),
      isAccessible:
        !isExecutionReservationLocked && validation.isStepAccessible(3),
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
                disabled={isExecutionReservationLocked}
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
                disabled={isExecutionReservationLocked}
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
                disabled={
                  !validation.canFinishCampaign() ||
                  isFinishing ||
                  isExecutionReservationLocked
                }
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
