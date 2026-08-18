import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguage } from '../../../hooks/useLanguage';
import { apiService } from '../../../services/api';
import {
  AudienceGrade,
  CampaignPlatform,
  SmartTargetingSortBy,
  SmartTargetingSortDirection,
  SmartTargetingTestSamplingCalculationResponse,
  SmartTargetingTestSamplingPreviewResponse,
  SmartTargetingTestSamplingTagResult,
} from '../../../types/campaign';
import { getErrorMessage } from '../../../utils/errorHandler';
import { getEffectiveScoreClassKey } from '../../../utils/smartTargetingCapacity';
import {
  areSameOrderedTagIds,
  doesSmartTargetingTestSamplingMatchInputs,
  getSmartTargetingTestPreviewFromCalculation,
  isKnownSmartTargetingTestSamplingStatus,
  isSmartTargetingTestSamplingActive,
  isSmartTargetingTestSamplingCompleted,
  isSmartTargetingTestSamplingFailed,
  isSmartTargetingTestSamplingStale,
  normalizeOrderedTagIds,
  normalizeSmartTargetingTestSamplingCalculation,
  normalizeSmartTargetingTestPreview,
  SMART_TARGETING_TEST_SAMPLING_MAX_POLL_RETRIES,
  SMART_TARGETING_TEST_SAMPLING_POLL_INTERVAL_MS,
} from '../../../utils/smartTargetingTestPreview';
import Button from '../../ui/Button';
import type { SmartTargetingScoreClassCopy } from './SmartTargetingScoreClassSelector';

export interface SmartTargetingTestPreviewCopy extends SmartTargetingScoreClassCopy {
  title: string;
  description: string;
  sampleSizeLabel: string;
  sampleSizeHelp: string;
  sampleSizeInvalid: string;
  scoreClassesRequired: string;
  selectedTags: string;
  requestedAudience: string;
  satisfiedTags: string;
  unsatisfiedTags: string;
  effectiveAudience: string;
  campaignCost: string;
  audiences: string;
  currency: string;
  checkAvailability: string;
  checkingAvailability: string;
  selectTags: string;
  completeCampaignDataFirst: string;
  campaignWillBeCreated: string;
  campaignPreparationFailed: string;
  selectionSaveFailed: string;
  previewFailed: string;
  loadingCurrent: string;
  calculationInProgress: string;
  calculationQueued: string;
  calculationFailed: string;
  calculationStale: string;
  fetchError: string;
  startError: string;
  pollingRetry: string;
  pollingStopped: string;
  unknownStatus: string;
  invalidResponse: string;
  inputsChangedDuringRequest: string;
  selectionOrderPending: string;
  stale: string;
  previewRequired: string;
  unsatisfiedWarning: string;
  availabilityLabel: string;
  tagLabel: string;
  estimateLimitation: string;
}

interface SamplingJob {
  campaignUuid: string;
  inputKey: string;
  calculation: SmartTargetingTestSamplingCalculationResponse;
}

const isNotCalculatedResponse = (value: unknown): boolean => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const status = (value as Record<string, unknown>).status;
  return (
    typeof status === 'string' &&
    status
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_') === 'not_calculated'
  );
};

const EMPTY_CALCULATION_CODES = new Set([
  'NOT_FOUND',
  'SMART_TARGETING_TEST_SAMPLING_NOT_FOUND',
  'SMART_TARGETING_TEST_SAMPLING_CALCULATION_NOT_FOUND',
]);
const NON_RETRYABLE_POLL_ERRORS = new Set([
  'UNAUTHORIZED',
  'FORBIDDEN',
  'CAMPAIGN_NOT_FOUND',
  'INVALID_CALCULATION_ID',
  'SMART_TARGETING_TEST_SAMPLING_CALCULATION_NOT_FOUND',
]);
const AMBIGUOUS_START_ERRORS = new Set([
  'NETWORK_ERROR',
  'TIMEOUT_ERROR',
  'INTERNAL_SERVER_ERROR',
  'SERVICE_UNAVAILABLE',
]);

interface SmartTargetingTestSamplingPreviewProps {
  campaignUuid?: string;
  bundleId?: number | null;
  platform: CampaignPlatform;
  selectedTagIds: number[];
  selectedRawCapacity: number;
  sampleSizePerTag: number;
  selectedScoreClasses: AudienceGrade[];
  sortBy: SmartTargetingSortBy | '';
  sortDirection: SmartTargetingSortDirection;
  preview?: SmartTargetingTestSamplingPreviewResponse | null;
  previewIsCurrent: boolean;
  previewIsStale: boolean;
  configurationIsDirty: boolean;
  selectionOrderIsPending: boolean;
  prepareCampaign: (signal?: AbortSignal) => Promise<{
    success: boolean;
    uuid?: string;
    errorCode?: string;
  }>;
  onConfigurationPersisted: (
    tagIds: number[],
    selectedRawCapacity: number
  ) => void;
  onPreviewChange: (
    preview: SmartTargetingTestSamplingPreviewResponse,
    campaignUuid: string
  ) => void;
  onPreviewInvalidated: () => void;
  copy: SmartTargetingTestPreviewCopy;
}

const SmartTargetingTestSamplingPreview: React.FC<
  SmartTargetingTestSamplingPreviewProps
> = ({
  campaignUuid,
  bundleId,
  platform,
  selectedTagIds,
  selectedRawCapacity,
  sampleSizePerTag,
  selectedScoreClasses,
  sortBy,
  sortDirection,
  preview,
  previewIsCurrent,
  previewIsStale,
  configurationIsDirty,
  selectionOrderIsPending,
  prepareCampaign,
  onConfigurationPersisted,
  onPreviewChange,
  onPreviewInvalidated,
  copy,
}) => {
  const { accessToken } = useAuth();
  const { language } = useLanguage();
  const locale = language === 'fa' ? 'fa-IR' : 'en-US';
  const [job, setJob] = useState<SamplingJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSequenceRef = useRef(0);
  // A calculation can be requested from the initial/current-status GET as
  // well as from the button. Keep this guard in memory so a stale response
  // cannot create more than one job for the same mounted form.
  const requestInFlightRef = useRef(false);
  const autoStartAttemptedInputKeyRef = useRef<string | null>(null);
  const autoPersistAttemptedInputKeyRef = useRef<string | null>(null);
  const hasLoadedCurrentCalculationRef = useRef(false);
  const handlePreviewRef = useRef<(() => Promise<void>) | null>(null);
  const actionAbortRef = useRef<AbortController | null>(null);
  const autoStartAbortRef = useRef<AbortController | null>(null);
  const currentLookupAbortRef = useRef<AbortController | null>(null);
  const campaignUuidRef = useRef(campaignUuid?.trim() || '');
  const observedCampaignUuidRef = useRef(campaignUuid?.trim() || '');
  campaignUuidRef.current = campaignUuid?.trim() || '';

  const orderedTagIds = useMemo(
    () => normalizeOrderedTagIds(selectedTagIds),
    [selectedTagIds]
  );
  // Campaign creation changes the UUID during an in-flight preview request;
  // it is an expected transition, not an effective sampling-input change.
  const inputKey = `${bundleId ?? 'no-bundle'}|${platform}|${orderedTagIds.join(
    ','
  )}|${sampleSizePerTag}|${getEffectiveScoreClassKey(
    selectedScoreClasses
  )}|${sortBy || 'default'}|${sortBy ? sortDirection : 'default'}`;
  const inputKeyRef = useRef(inputKey);
  const orderedTagIdsRef = useRef(orderedTagIds);
  const sampleSizePerTagRef = useRef(sampleSizePerTag);
  const selectedScoreClassesRef = useRef(selectedScoreClasses);
  const configurationIsDirtyRef = useRef(configurationIsDirty);
  inputKeyRef.current = inputKey;
  orderedTagIdsRef.current = orderedTagIds;
  sampleSizePerTagRef.current = sampleSizePerTag;
  selectedScoreClassesRef.current = selectedScoreClasses;
  configurationIsDirtyRef.current = configurationIsDirty;

  const sampleSizeIsValid =
    Number.isSafeInteger(sampleSizePerTag) && sampleSizePerTag > 0;
  const requestedAudienceCount = sampleSizeIsValid
    ? orderedTagIds.length * sampleSizePerTag
    : 0;
  const requestedAudienceIsValid = Number.isSafeInteger(requestedAudienceCount);
  const currentPreview = previewIsCurrent
    ? normalizeSmartTargetingTestPreview(preview)
    : null;
  const hasStoredPreviewRef = useRef(Boolean(preview));
  hasStoredPreviewRef.current = Boolean(preview);

  const invalidateStoredPreview = useCallback(() => {
    if (!hasStoredPreviewRef.current) return;
    hasStoredPreviewRef.current = false;
    onPreviewInvalidated();
  }, [onPreviewInvalidated]);

  useEffect(() => {
    apiService.setAccessToken(accessToken || null);
  }, [accessToken]);

  useEffect(() => {
    requestSequenceRef.current += 1;
    actionAbortRef.current?.abort();
    actionAbortRef.current = null;
    autoStartAbortRef.current?.abort();
    autoStartAbortRef.current = null;
    currentLookupAbortRef.current?.abort();
    currentLookupAbortRef.current = null;
    requestInFlightRef.current = false;
    hasLoadedCurrentCalculationRef.current = false;
    setJob(null);
    setIsSubmitting(false);
    setIsLoadingCurrent(false);
    setError(null);
  }, [inputKey]);

  const adoptCalculation = useCallback(
    (
      calculation: SmartTargetingTestSamplingCalculationResponse,
      calculationCampaignUuid: string,
      calculationInputKey: string
    ): boolean => {
      if (
        inputKeyRef.current !== calculationInputKey ||
        (campaignUuidRef.current &&
          campaignUuidRef.current !== calculationCampaignUuid) ||
        !doesSmartTargetingTestSamplingMatchInputs(
          calculation,
          orderedTagIdsRef.current,
          sampleSizePerTagRef.current,
          selectedScoreClassesRef.current
        )
      ) {
        return false;
      }

      setJob({
        campaignUuid: calculationCampaignUuid,
        inputKey: calculationInputKey,
        calculation,
      });

      if (isSmartTargetingTestSamplingFailed(calculation)) {
        invalidateStoredPreview();
        setError(
          calculation.error_code
            ? getErrorMessage(
                calculation.error_code,
                language,
                copy.calculationFailed
              )
            : copy.calculationFailed
        );
      } else if (isSmartTargetingTestSamplingStale(calculation)) {
        invalidateStoredPreview();
        setError(copy.calculationStale);
      } else if (isSmartTargetingTestSamplingCompleted(calculation)) {
        const completedPreview =
          getSmartTargetingTestPreviewFromCalculation(calculation);
        if (!completedPreview) {
          invalidateStoredPreview();
          setError(copy.invalidResponse);
          return true;
        }
        setError(null);
        onPreviewChange(completedPreview, calculationCampaignUuid);
      } else if (!isKnownSmartTargetingTestSamplingStatus(calculation)) {
        invalidateStoredPreview();
        setError(copy.unknownStatus);
      } else {
        invalidateStoredPreview();
        setError(null);
      }
      return true;
    },
    [
      copy.calculationFailed,
      copy.calculationStale,
      copy.invalidResponse,
      copy.unknownStatus,
      invalidateStoredPreview,
      language,
      onPreviewChange,
    ]
  );

  const shouldStartCalculation = useCallback(
    (calculation: SmartTargetingTestSamplingCalculationResponse): boolean =>
      !isSmartTargetingTestSamplingActive(calculation) &&
      (isSmartTargetingTestSamplingStale(calculation) ||
        calculation.status === 'not_calculated'),
    []
  );

  const startCurrentCalculation = useCallback(
    async (uuid: string, requestedInputKey: string) => {
      if (
        requestInFlightRef.current ||
        autoStartAttemptedInputKeyRef.current === requestedInputKey ||
        inputKeyRef.current !== requestedInputKey ||
        campaignUuidRef.current !== uuid ||
        orderedTagIdsRef.current.length === 0 ||
        !Number.isSafeInteger(sampleSizePerTagRef.current) ||
        sampleSizePerTagRef.current <= 0
      ) {
        return;
      }

      autoStartAttemptedInputKeyRef.current = requestedInputKey;
      requestInFlightRef.current = true;
      const startSequence = requestSequenceRef.current;
      const controller = new AbortController();
      autoStartAbortRef.current?.abort();
      autoStartAbortRef.current = controller;
      setIsSubmitting(true);
      setError(null);

      try {
        const response =
          await apiService.startSmartTargetingTestSamplingCalculation(
            uuid,
            controller.signal
          );
        if (
          controller.signal.aborted ||
          requestSequenceRef.current !== startSequence ||
          inputKeyRef.current !== requestedInputKey ||
          campaignUuidRef.current !== uuid
        ) {
          return;
        }

        let normalized = normalizeSmartTargetingTestSamplingCalculation(
          response.success ? response.data : response.error?.details
        );
        if (
          !normalized &&
          AMBIGUOUS_START_ERRORS.has(response.error?.code || '')
        ) {
          const currentResponse =
            await apiService.getCurrentSmartTargetingTestSamplingCalculation(
              uuid,
              controller.signal
            );
          if (
            controller.signal.aborted ||
            requestSequenceRef.current !== startSequence ||
            inputKeyRef.current !== requestedInputKey ||
            campaignUuidRef.current !== uuid
          ) {
            return;
          }
          normalized = normalizeSmartTargetingTestSamplingCalculation(
            currentResponse.success ? currentResponse.data : undefined
          );
        }

        if (!normalized) {
          setError(
            getErrorMessage(response.error?.code, language, copy.startError)
          );
          return;
        }
        if (!adoptCalculation(normalized, uuid, requestedInputKey)) {
          setError(copy.inputsChangedDuringRequest);
        }
      } catch {
        if (
          inputKeyRef.current === requestedInputKey &&
          campaignUuidRef.current === uuid &&
          requestSequenceRef.current === startSequence
        ) {
          setError(copy.startError);
        }
      } finally {
        if (requestSequenceRef.current === startSequence) {
          requestInFlightRef.current = false;
          setIsSubmitting(false);
        }
        if (autoStartAbortRef.current === controller) {
          autoStartAbortRef.current = null;
        }
      }
    },
    [
      adoptCalculation,
      copy.inputsChangedDuringRequest,
      copy.startError,
      language,
    ]
  );

  useEffect(() => {
    const uuid = campaignUuid?.trim() || '';
    const previousUuid = observedCampaignUuidRef.current;
    observedCampaignUuidRef.current = uuid;
    const expectedCreationTransition = Boolean(
      requestInFlightRef.current && !previousUuid && uuid
    );
    if (expectedCreationTransition) return;
    if (requestInFlightRef.current) {
      actionAbortRef.current?.abort();
      actionAbortRef.current = null;
      autoStartAbortRef.current?.abort();
      autoStartAbortRef.current = null;
      requestInFlightRef.current = false;
      setIsSubmitting(false);
    }
    autoStartAttemptedInputKeyRef.current = null;
    autoPersistAttemptedInputKeyRef.current = null;

    const sequence = requestSequenceRef.current + 1;
    requestSequenceRef.current = sequence;
    currentLookupAbortRef.current?.abort();
    currentLookupAbortRef.current = null;
    setJob(null);
    setError(null);
    if (!uuid) {
      setIsLoadingCurrent(false);
      return;
    }

    const requestedInputKey = inputKeyRef.current;
    const isFirstCurrentLookup = !hasLoadedCurrentCalculationRef.current;
    const controller = new AbortController();
    currentLookupAbortRef.current = controller;
    setIsLoadingCurrent(true);

    void apiService
      .getCurrentSmartTargetingTestSamplingCalculation(uuid, controller.signal)
      .then(response => {
        if (
          controller.signal.aborted ||
          requestSequenceRef.current !== sequence ||
          inputKeyRef.current !== requestedInputKey
        ) {
          return;
        }
        if (!response.success || !response.data) {
          invalidateStoredPreview();
          if (!EMPTY_CALCULATION_CODES.has(response.error?.code || '')) {
            setError(
              getErrorMessage(response.error?.code, language, copy.fetchError)
            );
          }
          return;
        }

        if (isNotCalculatedResponse(response.data)) {
          if (configurationIsDirtyRef.current) {
            if (autoPersistAttemptedInputKeyRef.current !== requestedInputKey) {
              autoPersistAttemptedInputKeyRef.current = requestedInputKey;
              void handlePreviewRef.current?.();
            }
          } else {
            void startCurrentCalculation(uuid, requestedInputKey);
          }
          return;
        }

        const normalized = normalizeSmartTargetingTestSamplingCalculation(
          response.data
        );
        if (!normalized) {
          invalidateStoredPreview();
          setError(copy.invalidResponse);
          return;
        }

        // A saved Campaign may still expose a calculation for older inputs.
        // Ignore it instead of presenting it as a response-validation error.
        if (!adoptCalculation(normalized, uuid, requestedInputKey)) {
          invalidateStoredPreview();
          if (autoPersistAttemptedInputKeyRef.current !== requestedInputKey) {
            autoPersistAttemptedInputKeyRef.current = requestedInputKey;
            void handlePreviewRef.current?.();
          }
        } else if (
          (shouldStartCalculation(normalized) ||
            (isFirstCurrentLookup &&
              isSmartTargetingTestSamplingFailed(normalized))) &&
          !configurationIsDirtyRef.current
        ) {
          void startCurrentCalculation(uuid, requestedInputKey);
        }
      })
      .catch(() => {
        if (
          !controller.signal.aborted &&
          requestSequenceRef.current === sequence
        ) {
          invalidateStoredPreview();
          setError(copy.fetchError);
        }
      })
      .finally(() => {
        if (currentLookupAbortRef.current === controller) {
          currentLookupAbortRef.current = null;
        }
        if (requestSequenceRef.current === sequence) {
          hasLoadedCurrentCalculationRef.current = true;
          setIsLoadingCurrent(false);
        }
      });

    return () => controller.abort();
  }, [
    adoptCalculation,
    campaignUuid,
    copy.fetchError,
    copy.invalidResponse,
    inputKey,
    invalidateStoredPreview,
    language,
    shouldStartCalculation,
    startCurrentCalculation,
  ]);

  useEffect(() => {
    if (!job || !isSmartTargetingTestSamplingActive(job.calculation)) return;

    const { campaignUuid: jobUuid, inputKey: jobInputKey } = job;
    const calculationId = job.calculation.calculation_id;
    const sequence = requestSequenceRef.current;
    let stopped = false;
    let timerId: number | undefined;
    let requestController: AbortController | null = null;
    let retryCount = 0;

    const schedule = (delay: number) => {
      if (stopped) return;
      timerId = window.setTimeout(() => void poll(), delay);
    };

    const poll = async () => {
      if (
        stopped ||
        requestController ||
        requestSequenceRef.current !== sequence ||
        inputKeyRef.current !== jobInputKey
      ) {
        return;
      }

      requestController = new AbortController();
      let response;
      try {
        response =
          await apiService.getCurrentSmartTargetingTestSamplingCalculation(
            jobUuid,
            requestController.signal
          );
      } catch {
        response = null;
      }
      requestController = null;
      if (
        stopped ||
        requestSequenceRef.current !== sequence ||
        inputKeyRef.current !== jobInputKey
      ) {
        return;
      }

      if (!response?.success || !response.data) {
        const errorCode = response?.error?.code || '';
        if (NON_RETRYABLE_POLL_ERRORS.has(errorCode)) {
          invalidateStoredPreview();
          setJob(null);
          setError(getErrorMessage(errorCode, language, copy.pollingStopped));
          return;
        }

        retryCount += 1;
        if (retryCount > SMART_TARGETING_TEST_SAMPLING_MAX_POLL_RETRIES) {
          invalidateStoredPreview();
          setJob(null);
          setError(copy.pollingStopped);
          return;
        }
        setError(copy.pollingRetry);
        schedule(SMART_TARGETING_TEST_SAMPLING_POLL_INTERVAL_MS);
        return;
      }

      if (isNotCalculatedResponse(response.data)) {
        setJob(null);
        void startCurrentCalculation(jobUuid, jobInputKey);
        return;
      }

      const normalized = normalizeSmartTargetingTestSamplingCalculation(
        response.data
      );
      if (
        !normalized ||
        normalized.calculation_id !== calculationId ||
        !adoptCalculation(normalized, jobUuid, jobInputKey)
      ) {
        invalidateStoredPreview();
        setJob(null);
        setError(copy.invalidResponse);
        return;
      }

      retryCount = 0;
      if (isSmartTargetingTestSamplingActive(normalized)) {
        schedule(SMART_TARGETING_TEST_SAMPLING_POLL_INTERVAL_MS);
      } else if (shouldStartCalculation(normalized)) {
        void startCurrentCalculation(jobUuid, jobInputKey);
      }
    };

    schedule(SMART_TARGETING_TEST_SAMPLING_POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      if (timerId !== undefined) window.clearTimeout(timerId);
      requestController?.abort();
    };
  }, [
    adoptCalculation,
    copy.invalidResponse,
    copy.pollingRetry,
    copy.pollingStopped,
    invalidateStoredPreview,
    job,
    language,
    shouldStartCalculation,
    startCurrentCalculation,
  ]);

  useEffect(
    () => () => {
      requestSequenceRef.current += 1;
      requestInFlightRef.current = false;
      actionAbortRef.current?.abort();
      autoStartAbortRef.current?.abort();
      currentLookupAbortRef.current?.abort();
    },
    []
  );

  const handlePreview = async () => {
    if (
      requestInFlightRef.current ||
      isSmartTargetingTestSamplingActive(job?.calculation)
    ) {
      return;
    }
    if (orderedTagIds.length === 0) {
      setError(copy.selectTags);
      return;
    }
    if (selectionOrderIsPending) {
      setError(copy.selectionOrderPending);
      return;
    }
    if (!sampleSizeIsValid || !requestedAudienceIsValid) {
      setError(copy.sampleSizeInvalid);
      return;
    }
    if (!campaignUuid?.trim()) {
      setError(copy.completeCampaignDataFirst);
      return;
    }

    invalidateStoredPreview();

    const sequence = requestSequenceRef.current + 1;
    requestSequenceRef.current = sequence;
    const requestedInputKey = inputKeyRef.current;
    const requestedCampaignUuid = campaignUuidRef.current;
    const requestedTagIds = [...orderedTagIds];
    const controller = new AbortController();
    actionAbortRef.current?.abort();
    actionAbortRef.current = controller;
    currentLookupAbortRef.current?.abort();
    currentLookupAbortRef.current = null;
    requestInFlightRef.current = true;
    setIsSubmitting(true);
    setIsLoadingCurrent(false);
    setError(null);

    try {
      const prepared = await prepareCampaign(controller.signal);
      if (controller.signal.aborted || requestSequenceRef.current !== sequence)
        return;
      if (!prepared.success || !prepared.uuid?.trim()) {
        setError(
          getErrorMessage(
            prepared.errorCode,
            language,
            copy.campaignPreparationFailed
          )
        );
        return;
      }
      const preparedUuid = prepared.uuid.trim();
      const currentCampaignUuid = campaignUuidRef.current;
      const campaignContextMatches = requestedCampaignUuid
        ? currentCampaignUuid === requestedCampaignUuid &&
          preparedUuid === requestedCampaignUuid
        : !currentCampaignUuid || currentCampaignUuid === preparedUuid;
      if (!campaignContextMatches) {
        setError(copy.inputsChangedDuringRequest);
        return;
      }
      if (inputKeyRef.current !== requestedInputKey) {
        setError(copy.inputsChangedDuringRequest);
        return;
      }

      const selectionResponse =
        await apiService.replaceCampaignSmartTargetingSelection(
          preparedUuid,
          { tag_ids: requestedTagIds },
          controller.signal
        );
      if (controller.signal.aborted || requestSequenceRef.current !== sequence)
        return;
      if (!selectionResponse.success || !selectionResponse.data) {
        setError(
          getErrorMessage(
            selectionResponse.error?.code,
            language,
            copy.selectionSaveFailed
          )
        );
        return;
      }
      if (
        inputKeyRef.current !== requestedInputKey ||
        (campaignUuidRef.current && campaignUuidRef.current !== preparedUuid) ||
        !areSameOrderedTagIds(
          selectionResponse.data.selected_tag_ids,
          requestedTagIds
        )
      ) {
        const contextChanged =
          inputKeyRef.current !== requestedInputKey ||
          Boolean(
            campaignUuidRef.current && campaignUuidRef.current !== preparedUuid
          );
        setError(
          contextChanged
            ? copy.inputsChangedDuringRequest
            : copy.invalidResponse
        );
        return;
      }

      onConfigurationPersisted(
        requestedTagIds,
        Math.max(
          0,
          selectionResponse.data.summary?.selected_raw_capacity ??
            selectedRawCapacity
        )
      );

      const response =
        await apiService.startSmartTargetingTestSamplingCalculation(
          preparedUuid,
          controller.signal
        );
      if (controller.signal.aborted || requestSequenceRef.current !== sequence)
        return;
      let normalized = normalizeSmartTargetingTestSamplingCalculation(
        response.success ? response.data : response.error?.details
      );

      // A failed POST response can be ambiguous: the server may have queued
      // the job before the response was lost. Reconcile once before allowing
      // another submission, which avoids accidental duplicate work.
      if (
        !normalized &&
        AMBIGUOUS_START_ERRORS.has(response.error?.code || '')
      ) {
        const currentResponse =
          await apiService.getCurrentSmartTargetingTestSamplingCalculation(
            preparedUuid,
            controller.signal
          );
        if (
          controller.signal.aborted ||
          requestSequenceRef.current !== sequence
        ) {
          return;
        }
        normalized = normalizeSmartTargetingTestSamplingCalculation(
          currentResponse.success ? currentResponse.data : undefined
        );
      }

      if (!normalized) {
        setError(
          getErrorMessage(response.error?.code, language, copy.startError)
        );
        return;
      }
      if (
        inputKeyRef.current !== requestedInputKey ||
        (campaignUuidRef.current && campaignUuidRef.current !== preparedUuid) ||
        !doesSmartTargetingTestSamplingMatchInputs(
          normalized,
          requestedTagIds,
          sampleSizePerTag,
          selectedScoreClasses
        )
      ) {
        const contextChanged =
          inputKeyRef.current !== requestedInputKey ||
          Boolean(
            campaignUuidRef.current && campaignUuidRef.current !== preparedUuid
          );
        setError(
          contextChanged
            ? copy.inputsChangedDuringRequest
            : copy.invalidResponse
        );
        return;
      }

      if (!adoptCalculation(normalized, preparedUuid, requestedInputKey)) {
        setError(copy.inputsChangedDuringRequest);
      }
    } catch {
      if (
        !controller.signal.aborted &&
        requestSequenceRef.current === sequence
      ) {
        setError(copy.startError);
      }
    } finally {
      if (requestSequenceRef.current === sequence) {
        requestInFlightRef.current = false;
        setIsSubmitting(false);
      }
      if (actionAbortRef.current === controller) actionAbortRef.current = null;
    }
  };
  handlePreviewRef.current = handlePreview;

  // Tag and score-class changes are held in Campaign state until this step is
  // reached. Persist that complete configuration once, then request sampling;
  // this is deliberately separate from safe GET polling.
  useEffect(() => {
    if (
      !configurationIsDirty ||
      isLoadingCurrent ||
      selectionOrderIsPending ||
      requestInFlightRef.current ||
      autoPersistAttemptedInputKeyRef.current === inputKey
    ) {
      return;
    }
    autoPersistAttemptedInputKeyRef.current = inputKey;
    void handlePreviewRef.current?.();
  }, [
    configurationIsDirty,
    inputKey,
    isLoadingCurrent,
    selectionOrderIsPending,
  ]);

  const hasActiveCalculation = isSmartTargetingTestSamplingActive(
    job?.calculation
  );
  const isCalculating = isSubmitting || hasActiveCalculation;
  const isQueued =
    hasActiveCalculation &&
    (job?.calculation.started_at === undefined ||
      job.calculation.started_at === null);

  const formatNumber = (value: number) => value.toLocaleString(locale);
  const displayTagName = (item: SmartTargetingTestSamplingTagResult) =>
    item.tag_display_name?.trim() || `${copy.tagLabel} ${item.tag_id}`;
  const sortedResults = (items: SmartTargetingTestSamplingTagResult[]) =>
    [...items].sort(
      (left, right) => left.selection_order - right.selection_order
    );

  return (
    <section
      className='mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5'
      aria-labelledby='smart-targeting-test-preview-title'
    >
      <div className='flex items-start gap-3'>
        <FlaskConical className='mt-0.5 h-5 w-5 shrink-0 text-primary-600' />
        <div>
          <h3
            id='smart-targeting-test-preview-title'
            className='font-semibold text-gray-900'
          >
            {copy.title}
          </h3>
          <p className='mt-1 text-sm text-gray-600'>{copy.description}</p>
        </div>
      </div>

      <dl className='mt-5 grid gap-3 text-sm sm:grid-cols-2'>
        <div>
          <dt className='text-gray-600'>{copy.selectedTags}</dt>
          <dd className='font-semibold text-gray-900'>
            {formatNumber(orderedTagIds.length)}
          </dd>
        </div>
        <div>
          <dt className='text-gray-600'>{copy.requestedAudience}</dt>
          <dd className='font-semibold text-gray-900'>
            {sampleSizeIsValid && requestedAudienceIsValid
              ? formatNumber(requestedAudienceCount)
              : '—'}{' '}
            {copy.audiences}
          </dd>
        </div>
      </dl>

      <div className='mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-gray-600'>
          {isLoadingCurrent
            ? copy.loadingCurrent
            : isCalculating
              ? isQueued
                ? copy.calculationQueued
                : copy.calculationInProgress
              : selectionOrderIsPending
                ? copy.selectionOrderPending
                : previewIsStale
                  ? copy.stale
                  : !currentPreview
                    ? copy.previewRequired
                    : ''}
        </p>
        <Button
          onClick={() => void handlePreview()}
          disabled={
            isCalculating ||
            isLoadingCurrent ||
            orderedTagIds.length === 0 ||
            selectionOrderIsPending ||
            !sampleSizeIsValid ||
            !requestedAudienceIsValid ||
            !campaignUuid?.trim()
          }
          aria-busy={isCalculating}
        >
          {isCalculating ? (
            <span className='inline-flex items-center gap-2'>
              <RefreshCw
                className='h-4 w-4 animate-spin'
                aria-hidden='true'
                data-testid='smart-targeting-sampling-spinner'
              />
              {copy.checkingAvailability}
            </span>
          ) : (
            copy.checkAvailability
          )}
        </Button>
      </div>

      {!isCalculating && currentPreview ? (
        <div className='mt-5 rounded-lg border border-green-200 bg-green-50/60 p-4'>
          <div className='flex items-center gap-2 text-sm font-medium text-green-800'>
            <CheckCircle2 className='h-4 w-4' aria-hidden='true' />
            {copy.checkAvailability}
          </div>
          <dl className='mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3'>
            <div>
              <dt className='text-gray-600'>{copy.selectedTags}</dt>
              <dd className='font-semibold text-gray-900'>
                {formatNumber(currentPreview.tag_sampling_order.length)}
              </dd>
            </div>
            <div>
              <dt className='text-gray-600'>{copy.sampleSizeLabel}</dt>
              <dd className='font-semibold text-gray-900'>
                {formatNumber(currentPreview.sample_size_per_tag)}
              </dd>
            </div>
            <div>
              <dt className='text-gray-600'>{copy.requestedAudience}</dt>
              <dd className='font-semibold text-gray-900'>
                {formatNumber(
                  currentPreview.tag_sampling_order.length *
                    currentPreview.sample_size_per_tag
                )}
              </dd>
            </div>
            <div>
              <dt className='text-gray-600'>{copy.satisfiedTags}</dt>
              <dd className='font-semibold text-green-800'>
                {formatNumber(currentPreview.satisfied_tag_count)}
              </dd>
            </div>
            <div>
              <dt className='text-gray-600'>{copy.unsatisfiedTags}</dt>
              <dd className='font-semibold text-amber-800'>
                {formatNumber(currentPreview.unsatisfied_tags.length)}
              </dd>
            </div>
            <div>
              <dt className='text-gray-600'>{copy.effectiveAudience}</dt>
              <dd className='font-bold text-green-800'>
                {formatNumber(currentPreview.effective_audience_count)}{' '}
                {copy.audiences}
              </dd>
            </div>
            <div>
              <dt className='text-gray-600'>{copy.campaignCost}</dt>
              <dd className='font-bold text-green-800'>
                {formatNumber(currentPreview.campaign_cost)} {copy.currency}
              </dd>
            </div>
          </dl>

          <div className='mt-4 grid gap-4 lg:grid-cols-2'>
            <div>
              <h4 className='text-sm font-medium text-gray-900'>
                {copy.satisfiedTags}
              </h4>
              <ul className='mt-2 space-y-1 text-sm text-gray-700'>
                {sortedResults(currentPreview.satisfied_tags).map(item => (
                  <li key={item.tag_id}>{displayTagName(item)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className='text-sm font-medium text-gray-900'>
                {copy.unsatisfiedTags}
              </h4>
              {currentPreview.unsatisfied_tags.length > 0 ? (
                <>
                  <p className='mt-2 flex items-start gap-2 text-sm text-amber-800'>
                    <AlertTriangle
                      className='mt-0.5 h-4 w-4 shrink-0'
                      aria-hidden='true'
                    />
                    {copy.unsatisfiedWarning}
                  </p>
                  <ul className='mt-2 space-y-1 text-sm text-gray-700'>
                    {sortedResults(currentPreview.unsatisfied_tags).map(
                      item => (
                        <li key={item.tag_id}>
                          {displayTagName(item)} — {copy.availabilityLabel}:{' '}
                          {formatNumber(item.available_count)}
                        </li>
                      )
                    )}
                  </ul>
                </>
              ) : (
                <p className='mt-2 text-sm text-gray-600'>0</p>
              )}
            </div>
          </div>
          <p className='mt-4 text-xs leading-5 text-gray-600'>
            {copy.estimateLimitation}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className='mt-4 text-sm text-red-600' role='alert'>
          {error}
        </p>
      ) : null}
    </section>
  );
};

export default SmartTargetingTestSamplingPreview;
