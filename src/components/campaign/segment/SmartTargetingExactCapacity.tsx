import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguage } from '../../../hooks/useLanguage';
import { apiService } from '../../../services/api';
import {
  AudienceGrade,
  SmartTargetingCapacityCalculationResponse,
} from '../../../types/campaign';
import { getErrorMessage } from '../../../utils/errorHandler';
import {
  getEffectiveScoreClassKey,
  getSelectedTagKey,
  isKnownSmartTargetingCapacityStatus,
  isSmartTargetingCapacityActive,
  isSmartTargetingCapacityCalculated,
  isSmartTargetingCapacityFailed,
  isSmartTargetingCapacityStale,
  normalizeSmartTargetingCapacityCalculation,
  normalizeSmartTargetingScoreClasses,
  SMART_TARGETING_CAPACITY_MAX_POLL_RETRIES,
  SMART_TARGETING_CAPACITY_POLL_INTERVAL_MS,
} from '../../../utils/smartTargetingCapacity';
import { normalizeOrderedTagIds } from '../../../utils/smartTargetingTestPreview';
import Button from '../../ui/Button';
import SmartTargetingScoreClassSelector from './SmartTargetingScoreClassSelector';

interface ExactCapacityCopy {
  title: string;
  description: string;
  scoreClassesLabel: string;
  classA: string;
  classAMeaning: string;
  classB: string;
  classBMeaning: string;
  classC: string;
  classCMeaning: string;
  allClasses: string;
  calculate: string;
  starting: string;
  loadingCurrent: string;
  statusLabel: string;
  notCalculated: string;
  calculating: string;
  calculated: string;
  recalculationRequired: string;
  failed: string;
  selectedTags: string;
  selectedRawCapacity: string;
  eligibleBeforeDeduction: string;
  approvedDeduction: string;
  exactUsableCapacity: string;
  audiences: string;
  selectTags: string;
  completeCampaignDataFirst: string;
  campaignWillBeCreated: string;
  campaignCreationFailed: string;
  serverRequiresCalculation: string;
  calculationInProgress: string;
  recalculationMessage: string;
  calculationFailed: string;
  calculationUnavailable: string;
  zeroCapacity: string;
  fetchError: string;
  startError: string;
  invalidResponse: string;
  pollingRetry: string;
  pollingStopped: string;
  selectionChangedDuringRequest: string;
  unknownStatus: string;
}

interface SmartTargetingExactCapacityProps {
  campaignUuid?: string;
  selectedTagIds: number[];
  selectedRawCapacity: number;
  selectionIsDirty: boolean;
  selectedScoreClasses: AudienceGrade[];
  scoreClassesAreDirty: boolean;
  initialCalculation?: SmartTargetingCapacityCalculationResponse | null;
  calculationRequiredByServer?: boolean;
  canCreateCampaign?: boolean;
  preserveSelectionOrder?: boolean;
  selectionOrderIsPending?: boolean;
  showScoreClassSelector?: boolean;
  syncScoreClassesFromCalculation?: boolean;
  ensureCampaignCreated?: (signal?: AbortSignal) => Promise<{
    success: boolean;
    uuid?: string;
    created?: boolean;
    selectionPersisted?: boolean;
    errorCode?: string;
  }>;
  onSelectionPersisted: (tagIds: number[], rawCapacity: number) => void;
  onScoreClassesChange: (
    scoreClasses: AudienceGrade[],
    source: 'local' | 'server'
  ) => void;
  onCalculationChange: (
    calculation: SmartTargetingCapacityCalculationResponse | null,
    source: CalculationUpdateSource
  ) => void;
  copy: ExactCapacityCopy;
}

interface CalculationBaseline {
  tagKey: string;
  scoreClassKey: string;
}

type CalculationUpdateSource = 'lookup' | 'poll' | 'start' | 'stale';

const SCORE_CLASSES: AudienceGrade[] = ['A', 'B', 'C'];
const NON_RETRYABLE_POLL_ERRORS = new Set([
  'UNAUTHORIZED',
  'FORBIDDEN',
  'CAMPAIGN_NOT_FOUND',
  'SMART_TARGETING_CAPACITY_CALCULATION_NOT_FOUND',
  'INVALID_CALCULATION_ID',
]);
const EMPTY_CALCULATION_CODES = new Set([
  'NOT_FOUND',
  'SMART_TARGETING_CAPACITY_NOT_FOUND',
  'SMART_TARGETING_CAPACITY_CALCULATION_NOT_FOUND',
]);

const SmartTargetingExactCapacity: React.FC<
  SmartTargetingExactCapacityProps
> = ({
  campaignUuid,
  selectedTagIds,
  selectedRawCapacity,
  selectionIsDirty,
  selectedScoreClasses,
  scoreClassesAreDirty,
  initialCalculation,
  calculationRequiredByServer = false,
  canCreateCampaign = false,
  preserveSelectionOrder = false,
  selectionOrderIsPending = false,
  showScoreClassSelector = true,
  syncScoreClassesFromCalculation = true,
  ensureCampaignCreated,
  onSelectionPersisted,
  onScoreClassesChange,
  onCalculationChange,
  copy,
}) => {
  const { accessToken } = useAuth();
  const { language } = useLanguage();
  const locale = language === 'fa' ? 'fa-IR' : 'en-US';
  const [calculation, setCalculation] =
    useState<SmartTargetingCapacityCalculationResponse | null>(() =>
      normalizeSmartTargetingCapacityCalculation(initialCalculation)
    );
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const calculationRef = useRef(calculation);

  const contextSequenceRef = useRef(0);
  const startInFlightRef = useRef(false);
  const startAbortRef = useRef<AbortController | null>(null);
  const currentLookupAbortRef = useRef<AbortController | null>(null);
  const campaignCreationRequestedRef = useRef(false);
  const campaignUuidRef = useRef(campaignUuid?.trim() || '');
  const baselineRef = useRef<CalculationBaseline | null>(
    calculation
      ? {
          tagKey: getSelectedTagKey(selectedTagIds),
          scoreClassKey: getEffectiveScoreClassKey(selectedScoreClasses),
        }
      : null
  );
  const selectedTagKeyRef = useRef(getSelectedTagKey(selectedTagIds));
  const selectedTagOrderKeyRef = useRef(
    normalizeOrderedTagIds(selectedTagIds).join(',')
  );
  const selectedScoreClassKeyRef = useRef(
    getEffectiveScoreClassKey(selectedScoreClasses)
  );
  const selectionIsDirtyRef = useRef(selectionIsDirty);
  const scoreClassesAreDirtyRef = useRef(scoreClassesAreDirty);
  const preserveSelectionOrderRef = useRef(preserveSelectionOrder);
  const selectionOrderIsPendingRef = useRef(selectionOrderIsPending);
  const syncScoreClassesFromCalculationRef = useRef(
    syncScoreClassesFromCalculation
  );

  const selectedTagKey = useMemo(
    () => getSelectedTagKey(selectedTagIds),
    [selectedTagIds]
  );
  const selectedTagOrderKey = useMemo(
    () => normalizeOrderedTagIds(selectedTagIds).join(','),
    [selectedTagIds]
  );
  const selectedScoreClassKey = useMemo(
    () => getEffectiveScoreClassKey(selectedScoreClasses),
    [selectedScoreClasses]
  );
  const normalizedScoreClasses = useMemo(
    () => normalizeSmartTargetingScoreClasses(selectedScoreClasses),
    [selectedScoreClasses]
  );

  selectedTagKeyRef.current = selectedTagKey;
  selectedTagOrderKeyRef.current = selectedTagOrderKey;
  selectedScoreClassKeyRef.current = selectedScoreClassKey;
  selectionIsDirtyRef.current = selectionIsDirty;
  scoreClassesAreDirtyRef.current = scoreClassesAreDirty;
  preserveSelectionOrderRef.current = preserveSelectionOrder;
  selectionOrderIsPendingRef.current = selectionOrderIsPending;
  syncScoreClassesFromCalculationRef.current = syncScoreClassesFromCalculation;
  calculationRef.current = calculation;

  const commitCalculation = useCallback(
    (
      next: SmartTargetingCapacityCalculationResponse | null,
      source: CalculationUpdateSource = 'lookup'
    ) => {
      // The backend owns capacity freshness. In particular, it may reuse a
      // current calculated result for an equivalent request; do not locally
      // downgrade that result based on an earlier invalidation marker.
      calculationRef.current = next;
      setCalculation(next);
      onCalculationChange(next, source);
    },
    [onCalculationChange]
  );

  const markCalculationStale = useCallback(() => {
    const current = calculationRef.current;
    if (!current || isSmartTargetingCapacityStale(current)) return;
    commitCalculation(
      {
        ...current,
        status: 'recalculation_required',
        is_current: false,
        recalculation_required: true,
      },
      'stale'
    );
  }, [commitCalculation]);

  useEffect(() => {
    apiService.setAccessToken(accessToken || null);
  }, [accessToken]);

  useEffect(() => {
    const baseline = baselineRef.current;
    if (
      calculation &&
      baseline &&
      (baseline.tagKey !== selectedTagKey ||
        baseline.scoreClassKey !== selectedScoreClassKey)
    ) {
      markCalculationStale();
    }
  }, [
    calculation,
    markCalculationStale,
    selectedScoreClassKey,
    selectedTagKey,
  ]);

  useEffect(() => {
    const previousUuid = campaignUuidRef.current;
    const uuid = campaignUuid?.trim() || '';
    campaignUuidRef.current = uuid;
    const isExpectedCreationTransition = Boolean(
      campaignCreationRequestedRef.current && !previousUuid && uuid
    );
    if (isExpectedCreationTransition) {
      campaignCreationRequestedRef.current = false;
      setIsLoadingCurrent(false);
      return;
    }

    const sequence = contextSequenceRef.current + 1;
    contextSequenceRef.current = sequence;
    startAbortRef.current?.abort();
    startAbortRef.current = null;
    startInFlightRef.current = false;
    baselineRef.current = null;
    setIsStarting(false);
    setRequestError(null);
    setLoadError(null);

    const normalizedInitial =
      normalizeSmartTargetingCapacityCalculation(initialCalculation);
    calculationRef.current = normalizedInitial;
    setCalculation(normalizedInitial);
    if (normalizedInitial) {
      baselineRef.current = {
        tagKey: selectedTagKeyRef.current,
        scoreClassKey: selectedScoreClassKeyRef.current,
      };
    }

    if (!uuid) {
      setIsLoadingCurrent(false);
      return;
    }

    const controller = new AbortController();
    currentLookupAbortRef.current?.abort();
    currentLookupAbortRef.current = controller;
    setIsLoadingCurrent(true);

    void apiService
      .getCurrentSmartTargetingCapacityCalculation(uuid, controller.signal)
      .then(response => {
        if (
          controller.signal.aborted ||
          contextSequenceRef.current !== sequence
        ) {
          return;
        }

        if (!response.success || !response.data) {
          if (EMPTY_CALCULATION_CODES.has(response.error?.code || '')) {
            baselineRef.current = null;
            commitCalculation(null);
            return;
          }
          setLoadError(
            getErrorMessage(response.error?.code, language, copy.fetchError)
          );
          return;
        }

        const normalized = normalizeSmartTargetingCapacityCalculation(
          response.data
        );
        if (!normalized) {
          setLoadError(copy.invalidResponse);
          return;
        }

        const hasUnsavedTargetingChanges =
          selectionIsDirtyRef.current || scoreClassesAreDirtyRef.current;
        if (hasUnsavedTargetingChanges) {
          baselineRef.current = {
            tagKey: selectedTagKeyRef.current,
            scoreClassKey: selectedScoreClassKeyRef.current,
          };
          commitCalculation({
            ...normalized,
            status: 'recalculation_required',
            is_current: false,
            recalculation_required: true,
          });
          return;
        }

        baselineRef.current = {
          tagKey: selectedTagKeyRef.current,
          scoreClassKey: getEffectiveScoreClassKey(
            normalized.selected_score_classes
          ),
        };
        if (syncScoreClassesFromCalculationRef.current) {
          onScoreClassesChange(normalized.selected_score_classes, 'server');
        }
        commitCalculation(normalized, 'lookup');
      })
      .finally(() => {
        if (currentLookupAbortRef.current === controller) {
          currentLookupAbortRef.current = null;
        }
        if (contextSequenceRef.current === sequence) {
          setIsLoadingCurrent(false);
        }
      });

    return () => controller.abort();
    // The current calculation is loaded immediately when the Campaign changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignUuid]);

  useEffect(() => {
    if (
      !campaignUuid ||
      !calculation ||
      !isSmartTargetingCapacityActive(calculation)
    ) {
      return;
    }

    const uuid = campaignUuid.trim();
    const calculationId = calculation.calculation_id;
    const contextSequence = contextSequenceRef.current;
    let stopped = false;
    let timerId: number | undefined;
    let requestController: AbortController | null = null;
    let retryCount = 0;

    const schedule = (delay: number) => {
      if (stopped) return;
      timerId = window.setTimeout(() => void poll(), delay);
    };

    const poll = async () => {
      if (stopped || requestController) return;
      const baseline = baselineRef.current;
      if (
        !baseline ||
        baseline.tagKey !== selectedTagKeyRef.current ||
        baseline.scoreClassKey !== selectedScoreClassKeyRef.current
      ) {
        markCalculationStale();
        return;
      }

      requestController = new AbortController();
      let response;
      try {
        response = await apiService.getSmartTargetingCapacityCalculationById(
          uuid,
          calculationId,
          requestController.signal
        );
      } catch {
        response = null;
      }
      requestController = null;
      if (
        stopped ||
        contextSequenceRef.current !== contextSequence ||
        baseline !== baselineRef.current
      ) {
        return;
      }

      if (!response?.success || !response.data) {
        const errorCode = response?.error?.code || '';
        if (NON_RETRYABLE_POLL_ERRORS.has(errorCode)) {
          baselineRef.current = null;
          commitCalculation(null);
          setRequestError(
            getErrorMessage(errorCode, language, copy.pollingStopped)
          );
          return;
        }

        retryCount += 1;
        if (retryCount > SMART_TARGETING_CAPACITY_MAX_POLL_RETRIES) {
          baselineRef.current = null;
          commitCalculation(null);
          setRequestError(copy.pollingStopped);
          return;
        }
        setRequestError(copy.pollingRetry);
        schedule(SMART_TARGETING_CAPACITY_POLL_INTERVAL_MS);
        return;
      }

      const normalized = normalizeSmartTargetingCapacityCalculation(
        response.data
      );
      if (!normalized) {
        baselineRef.current = null;
        commitCalculation(null);
        setRequestError(copy.invalidResponse);
        return;
      }

      retryCount = 0;
      setRequestError(null);
      commitCalculation(normalized, 'poll');
      if (isSmartTargetingCapacityActive(normalized)) {
        schedule(SMART_TARGETING_CAPACITY_POLL_INTERVAL_MS);
      }
    };

    schedule(SMART_TARGETING_CAPACITY_POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      if (timerId !== undefined) window.clearTimeout(timerId);
      requestController?.abort();
    };
  }, [
    calculation,
    campaignUuid,
    commitCalculation,
    copy.invalidResponse,
    copy.pollingRetry,
    copy.pollingStopped,
    language,
    markCalculationStale,
  ]);

  // Completed results can become stale when approved Campaign allocations
  // change. Refresh the backend's current view without re-polling a completed
  // generation by ID.
  useEffect(() => {
    const uuid = campaignUuid?.trim();
    if (!uuid || isSmartTargetingCapacityActive(calculation)) return;

    const contextSequence = contextSequenceRef.current;
    let stopped = false;
    let timerId: number | undefined;
    let retryCount = 0;

    const schedule = (delay = SMART_TARGETING_CAPACITY_POLL_INTERVAL_MS) => {
      if (stopped) return;
      timerId = window.setTimeout(() => void refreshCurrent(), delay);
    };

    const refreshCurrent = async () => {
      if (stopped) return;
      if (startInFlightRef.current || currentLookupAbortRef.current) {
        schedule();
        return;
      }

      const controller = new AbortController();
      currentLookupAbortRef.current = controller;
      const response =
        await apiService.getCurrentSmartTargetingCapacityCalculation(
          uuid,
          controller.signal
        );
      if (currentLookupAbortRef.current === controller) {
        currentLookupAbortRef.current = null;
      }
      if (stopped || contextSequenceRef.current !== contextSequence) {
        return;
      }
      if (controller.signal.aborted) {
        schedule();
        return;
      }

      if (!response.success || !response.data) {
        const errorCode = response.error?.code || '';
        if (EMPTY_CALCULATION_CODES.has(errorCode)) {
          retryCount = 0;
          baselineRef.current = null;
          commitCalculation(null);
          setRequestError(null);
          schedule();
          return;
        }
        if (NON_RETRYABLE_POLL_ERRORS.has(errorCode)) {
          setRequestError(
            getErrorMessage(errorCode, language, copy.pollingStopped)
          );
          return;
        }

        retryCount += 1;
        setRequestError(
          retryCount > SMART_TARGETING_CAPACITY_MAX_POLL_RETRIES
            ? copy.pollingStopped
            : copy.pollingRetry
        );
        schedule(
          Math.min(
            SMART_TARGETING_CAPACITY_POLL_INTERVAL_MS * retryCount,
            60_000
          )
        );
        return;
      }

      const normalized = normalizeSmartTargetingCapacityCalculation(
        response.data
      );
      if (!normalized) {
        setRequestError(copy.invalidResponse);
        schedule();
        return;
      }

      retryCount = 0;
      setRequestError(null);
      if (selectionIsDirtyRef.current || scoreClassesAreDirtyRef.current) {
        baselineRef.current = {
          tagKey: selectedTagKeyRef.current,
          scoreClassKey: selectedScoreClassKeyRef.current,
        };
        commitCalculation({
          ...normalized,
          status: 'recalculation_required',
          is_current: false,
          recalculation_required: true,
        });
      } else {
        baselineRef.current = {
          tagKey: selectedTagKeyRef.current,
          scoreClassKey: getEffectiveScoreClassKey(
            normalized.selected_score_classes
          ),
        };
        if (syncScoreClassesFromCalculationRef.current) {
          onScoreClassesChange(normalized.selected_score_classes, 'server');
        }
        commitCalculation(normalized, 'lookup');
      }
      schedule();
    };

    schedule();
    return () => {
      stopped = true;
      if (timerId !== undefined) window.clearTimeout(timerId);
      if (currentLookupAbortRef.current) {
        currentLookupAbortRef.current.abort();
        currentLookupAbortRef.current = null;
      }
    };
  }, [
    calculation,
    campaignUuid,
    commitCalculation,
    copy.invalidResponse,
    copy.pollingRetry,
    copy.pollingStopped,
    language,
    onScoreClassesChange,
  ]);

  useEffect(
    () => () => {
      contextSequenceRef.current += 1;
      startAbortRef.current?.abort();
      currentLookupAbortRef.current?.abort();
    },
    []
  );

  const handleCalculate = async () => {
    if (!selectedTagKeyRef.current) {
      setRequestError(copy.selectTags);
      return;
    }
    if (selectionOrderIsPendingRef.current) {
      setRequestError(copy.selectionChangedDuringRequest);
      return;
    }
    let uuid = campaignUuid?.trim() || '';
    if (!uuid && (!canCreateCampaign || !ensureCampaignCreated)) {
      setRequestError(copy.completeCampaignDataFirst);
      return;
    }
    if (
      startInFlightRef.current ||
      isSmartTargetingCapacityActive(calculation)
    ) {
      return;
    }

    const requestTagKey = selectedTagKeyRef.current;
    const requestTagOrderKey = selectedTagOrderKeyRef.current;
    const requestPreservesSelectionOrder = preserveSelectionOrderRef.current;
    const requestTagIds = requestPreservesSelectionOrder
      ? requestTagOrderKey.split(',').filter(Boolean).map(Number)
      : requestTagKey.split(',').filter(Boolean).map(Number);
    const requestScoreClassKey = selectedScoreClassKeyRef.current;
    const requestScoreClasses =
      normalizeSmartTargetingScoreClasses(selectedScoreClasses);
    const sequence = contextSequenceRef.current;
    const controller = new AbortController();
    startAbortRef.current?.abort();
    startAbortRef.current = controller;
    currentLookupAbortRef.current?.abort();
    currentLookupAbortRef.current = null;
    startInFlightRef.current = true;
    setIsStarting(true);
    setRequestError(null);
    setLoadError(null);

    try {
      let selectionPersisted = false;
      if (ensureCampaignCreated) {
        const requestedCampaignCreation = !uuid;
        if (requestedCampaignCreation) {
          campaignCreationRequestedRef.current = true;
        }
        const creationResult = await ensureCampaignCreated(controller.signal);
        if (contextSequenceRef.current !== sequence) return;
        if (!creationResult.success || !creationResult.uuid?.trim()) {
          if (requestedCampaignCreation) {
            campaignCreationRequestedRef.current = false;
          }
          setRequestError(
            getErrorMessage(
              creationResult.errorCode,
              language,
              copy.campaignCreationFailed
            )
          );
          return;
        }
        uuid = creationResult.uuid.trim();
        selectionPersisted =
          creationResult.selectionPersisted === true ||
          creationResult.created === true;
      }

      if (
        selectedTagKeyRef.current !== requestTagKey ||
        selectionOrderIsPendingRef.current ||
        preserveSelectionOrderRef.current !== requestPreservesSelectionOrder ||
        (requestPreservesSelectionOrder &&
          selectedTagOrderKeyRef.current !== requestTagOrderKey) ||
        selectedScoreClassKeyRef.current !== requestScoreClassKey
      ) {
        setRequestError(copy.selectionChangedDuringRequest);
        return;
      }

      if (selectionPersisted) {
        onSelectionPersisted(requestTagIds, Math.max(0, selectedRawCapacity));
      } else if (selectionIsDirtyRef.current) {
        const selectionResponse =
          await apiService.replaceCampaignSmartTargetingSelection(
            uuid,
            { tag_ids: requestTagIds },
            controller.signal
          );
        if (
          controller.signal.aborted ||
          contextSequenceRef.current !== sequence
        ) {
          return;
        }
        if (!selectionResponse.success || !selectionResponse.data) {
          setRequestError(
            getErrorMessage(
              selectionResponse.error?.code,
              language,
              copy.startError
            )
          );
          return;
        }
        if (
          selectedTagKeyRef.current !== requestTagKey ||
          selectionOrderIsPendingRef.current ||
          preserveSelectionOrderRef.current !==
            requestPreservesSelectionOrder ||
          (requestPreservesSelectionOrder &&
            selectedTagOrderKeyRef.current !== requestTagOrderKey) ||
          selectedScoreClassKeyRef.current !== requestScoreClassKey
        ) {
          setRequestError(copy.selectionChangedDuringRequest);
          return;
        }

        const persistedTagIds = selectionResponse.data.selected_tag_ids || [];
        const persistedTagKey = getSelectedTagKey(persistedTagIds);
        const persistedTagOrderKey =
          normalizeOrderedTagIds(persistedTagIds).join(',');
        if (
          persistedTagKey !== requestTagKey ||
          (requestPreservesSelectionOrder &&
            persistedTagOrderKey !== requestTagOrderKey)
        ) {
          setRequestError(copy.invalidResponse);
          return;
        }
        onSelectionPersisted(
          persistedTagIds,
          Math.max(
            0,
            selectionResponse.data.summary?.selected_raw_capacity ?? 0
          )
        );
      }

      const response = await apiService.startSmartTargetingCapacityCalculation(
        uuid,
        {
          score_classes:
            requestScoreClasses.length > 0
              ? requestScoreClasses
              : SCORE_CLASSES,
        },
        controller.signal
      );
      if (
        controller.signal.aborted ||
        contextSequenceRef.current !== sequence
      ) {
        return;
      }
      if (
        selectedTagKeyRef.current !== requestTagKey ||
        selectionOrderIsPendingRef.current ||
        preserveSelectionOrderRef.current !== requestPreservesSelectionOrder ||
        (requestPreservesSelectionOrder &&
          selectedTagOrderKeyRef.current !== requestTagOrderKey) ||
        selectedScoreClassKeyRef.current !== requestScoreClassKey
      ) {
        setRequestError(copy.selectionChangedDuringRequest);
        return;
      }
      if (!response.success || !response.data) {
        const pending = normalizeSmartTargetingCapacityCalculation(
          response.error?.details
        );
        if (
          response.error?.code === 'SMART_TARGETING_CAPACITY_PENDING' &&
          pending
        ) {
          baselineRef.current = {
            tagKey: requestTagKey,
            scoreClassKey: getEffectiveScoreClassKey(
              pending.selected_score_classes
            ),
          };
          if (syncScoreClassesFromCalculationRef.current) {
            onScoreClassesChange(pending.selected_score_classes, 'server');
          }
          setRequestError(null);
          // A pending calculation returned here may have been created earlier.
          // Do not classify it as a fresh user-started calculation.
          commitCalculation(pending, 'lookup');
          return;
        }
        setRequestError(
          getErrorMessage(response.error?.code, language, copy.startError)
        );
        return;
      }

      const normalized = normalizeSmartTargetingCapacityCalculation(
        response.data
      );
      if (!normalized) {
        setRequestError(copy.invalidResponse);
        return;
      }
      if (
        getEffectiveScoreClassKey(normalized.selected_score_classes) !==
        requestScoreClassKey
      ) {
        setRequestError(copy.invalidResponse);
        return;
      }

      baselineRef.current = {
        tagKey: requestTagKey,
        scoreClassKey: getEffectiveScoreClassKey(
          normalized.selected_score_classes
        ),
      };
      if (syncScoreClassesFromCalculationRef.current) {
        onScoreClassesChange(normalized.selected_score_classes, 'server');
      }
      commitCalculation(normalized, 'start');
    } catch {
      campaignCreationRequestedRef.current = false;
      if (
        !controller.signal.aborted &&
        contextSequenceRef.current === sequence
      ) {
        setRequestError(copy.campaignCreationFailed);
      }
    } finally {
      if (contextSequenceRef.current === sequence) {
        startInFlightRef.current = false;
        setIsStarting(false);
      }
      if (startAbortRef.current === controller) startAbortRef.current = null;
    }
  };

  const formatNumber = (value: number) => value.toLocaleString(locale);
  const isStale = isSmartTargetingCapacityStale(calculation);
  const isActive = isSmartTargetingCapacityActive(calculation);
  const isCalculated =
    Boolean(calculation) &&
    isSmartTargetingCapacityCalculated(calculation) &&
    !isStale;
  const isFailed = isSmartTargetingCapacityFailed(calculation);
  const isCalculationPending = isStarting || isActive;
  const hasUsableResult =
    isCalculated &&
    typeof calculation?.usable_unique_audience_count === 'number';
  const hasKnownStatus = isKnownSmartTargetingCapacityStatus(calculation);
  const calculateDisabled =
    (!campaignUuid?.trim() && (!canCreateCampaign || !ensureCampaignCreated)) ||
    selectedTagIds.length === 0 ||
    selectionOrderIsPending ||
    isLoadingCurrent ||
    isCalculationPending;

  const statusLabel = isStale
    ? copy.recalculationRequired
    : isActive
      ? copy.calculating
      : isCalculated
        ? copy.calculated
        : isFailed
          ? copy.failed
          : copy.notCalculated;

  return (
    <section
      className='mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5'
      aria-labelledby='smart-targeting-exact-capacity-title'
    >
      <div className='flex items-start gap-3'>
        <Calculator className='mt-0.5 h-5 w-5 shrink-0 text-primary-600' />
        <div>
          <h3
            id='smart-targeting-exact-capacity-title'
            className='font-semibold text-gray-900'
          >
            {copy.title}
          </h3>
          <p className='mt-1 text-sm text-gray-600'>{copy.description}</p>
        </div>
      </div>

      {showScoreClassSelector ? (
        <div className='mt-5'>
          <SmartTargetingScoreClassSelector
            value={normalizedScoreClasses}
            onChange={next => {
              onScoreClassesChange(next, 'local');
              setRequestError(null);
            }}
            copy={copy}
          />
        </div>
      ) : null}

      <div className='mt-5 grid gap-2 text-sm text-gray-700 sm:grid-cols-2'>
        <p>
          <span className='font-medium'>{copy.selectedTags}:</span>{' '}
          {formatNumber(selectedTagIds.length)}
        </p>
        <p>
          <span className='font-medium'>{copy.selectedRawCapacity}:</span>{' '}
          {formatNumber(Math.max(0, selectedRawCapacity))} {copy.audiences}
        </p>
      </div>

      <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div
          className='text-sm text-gray-700'
          aria-live='polite'
          aria-atomic='true'
        >
          <span className='font-medium'>{copy.statusLabel}:</span>{' '}
          <span>{isLoadingCurrent ? copy.loadingCurrent : statusLabel}</span>
        </div>
        <Button
          onClick={() => void handleCalculate()}
          disabled={calculateDisabled}
          aria-describedby='smart-targeting-capacity-guidance'
          aria-busy={isCalculationPending}
        >
          {isCalculationPending ? (
            <span className='inline-flex items-center gap-2'>
              <RefreshCw
                className='h-4 w-4 animate-spin'
                aria-hidden='true'
                data-testid='smart-targeting-capacity-spinner'
              />
              {isStarting ? copy.starting : copy.calculating}
            </span>
          ) : (
            copy.calculate
          )}
        </Button>
      </div>

      <div
        id='smart-targeting-capacity-guidance'
        className='mt-3'
        aria-live='polite'
      >
        {selectedTagIds.length === 0 ? (
          <p className='text-sm text-red-600'>{copy.selectTags}</p>
        ) : !campaignUuid?.trim() && !canCreateCampaign ? (
          <p className='text-sm text-amber-700'>
            {copy.completeCampaignDataFirst}
          </p>
        ) : !campaignUuid?.trim() ? (
          <p className='text-sm text-gray-600'>{copy.campaignWillBeCreated}</p>
        ) : isActive ? (
          <p className='flex items-center gap-2 text-sm text-primary-700'>
            <RefreshCw className='h-4 w-4 animate-spin' aria-hidden='true' />
            {copy.calculationInProgress}
          </p>
        ) : null}
      </div>

      {calculationRequiredByServer && !isActive ? (
        <p className='mt-3 text-sm font-medium text-red-700' role='alert'>
          {copy.serverRequiresCalculation}
        </p>
      ) : null}

      {isStale ? (
        <div
          className='mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800'
          role='status'
        >
          <AlertTriangle
            className='mt-0.5 h-4 w-4 shrink-0'
            aria-hidden='true'
          />
          <p>{copy.recalculationMessage}</p>
        </div>
      ) : isFailed ? (
        <div
          className='mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'
          role='alert'
        >
          <AlertTriangle
            className='mt-0.5 h-4 w-4 shrink-0'
            aria-hidden='true'
          />
          <p>
            {calculation?.error_code
              ? getErrorMessage(
                  calculation.error_code,
                  language,
                  copy.calculationFailed
                )
              : copy.calculationFailed}
          </p>
        </div>
      ) : isCalculated && !hasUsableResult ? (
        <p className='mt-4 text-sm text-red-600' role='alert'>
          {copy.calculationUnavailable}
        </p>
      ) : calculation && !hasKnownStatus ? (
        <p className='mt-4 text-sm text-red-600' role='alert'>
          {copy.unknownStatus}
        </p>
      ) : null}

      {hasUsableResult && calculation ? (
        <div className='mt-4 rounded-lg border border-green-200 bg-green-50/60 p-4'>
          <div className='flex items-center gap-2 text-sm font-medium text-green-800'>
            <CheckCircle2 className='h-4 w-4' aria-hidden='true' />
            {copy.calculated}
          </div>
          <dl className='mt-3 grid gap-3 text-sm sm:grid-cols-2'>
            {typeof calculation.raw_audience_count === 'number' ? (
              <div>
                <dt className='text-gray-600'>{copy.selectedRawCapacity}</dt>
                <dd className='font-semibold text-gray-900'>
                  {formatNumber(calculation.raw_audience_count)}{' '}
                  {copy.audiences}
                </dd>
              </div>
            ) : null}
            {typeof calculation.eligible_unique_audience_count_before_approved_campaign_deduction ===
            'number' ? (
              <div>
                <dt className='text-gray-600'>
                  {copy.eligibleBeforeDeduction}
                </dt>
                <dd className='font-semibold text-gray-900'>
                  {formatNumber(
                    calculation.eligible_unique_audience_count_before_approved_campaign_deduction
                  )}{' '}
                  {copy.audiences}
                </dd>
              </div>
            ) : null}
            {typeof calculation.approved_campaign_audience_deduction ===
            'number' ? (
              <div>
                <dt className='text-gray-600'>{copy.approvedDeduction}</dt>
                <dd className='font-semibold text-gray-900'>
                  {formatNumber(
                    calculation.approved_campaign_audience_deduction
                  )}{' '}
                  {copy.audiences}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className='text-gray-600'>{copy.exactUsableCapacity}</dt>
              <dd className='text-base font-bold text-green-800'>
                {formatNumber(calculation.usable_unique_audience_count!)}{' '}
                {copy.audiences}
              </dd>
            </div>
          </dl>
          {calculation.usable_unique_audience_count === 0 ? (
            <p className='mt-3 text-sm text-amber-800'>{copy.zeroCapacity}</p>
          ) : null}
        </div>
      ) : null}

      {loadError || requestError ? (
        <p className='mt-4 text-sm text-red-600' role='alert'>
          {requestError || loadError}
        </p>
      ) : null}
    </section>
  );
};

export default SmartTargetingExactCapacity;
