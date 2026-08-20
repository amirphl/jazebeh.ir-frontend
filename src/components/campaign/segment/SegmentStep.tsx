import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCampaign } from '../../../hooks/useCampaign';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { getJobCategories } from '../../../locales/jobCategory';
import TitleCard from './TitleCard';
import CapacityCard from './CapacityCard';
import LevelOneCard from './LevelOneCard';
import LevelTwoCard from './LevelTwoCard';
import SegmentPriceFactorsCard from './SegmentPriceFactorsCard';
import AudienceGradeCard from './AudienceGradeCard';
import PlatformSelectionCard from './PlatformSelectionCard';
import { useAudienceSpec } from './useAudienceSpec';
import {
  getLevel1Options,
  getLevel2Options,
  getLevel3Options,
  getItemTags,
  getLevel2Metadata,
  getAudienceSpecItem,
  calculateAudienceGradeCapacity,
} from './utils';
import {
  LevelSelectionState,
  saveLevelSelection,
  loadLevelSelection,
  createEmptyLevelSelection,
  clearLevelSelection,
} from '../../../types/segment';
import {
  AudienceGrade,
  AudienceTargetingMethod,
  CampaignData,
  CampaignPhase,
  CampaignPlatform,
  SmartTargetingCapacityCalculationResponse,
} from '../../../types/campaign';
import { campaignLevelI18n } from './segmentTranslations';
import { useLanguage } from '../../../hooks/useLanguage';
import CategoryJobFields from '../../CategoryJobFields';
import Button from '../../ui/Button';
import { useToast } from '../../../hooks/useToast';
import { useMediaUpload } from '../../../hooks/useMediaUpload';
import TargetAudienceExcelFileUploadCard, {
  isTargetAudienceExcelFile,
} from './TargetAudienceExcelFileUploadCard';
import BundleInfoCard from '../content/BundleInfoCard';
import SmartTargetingTagsTable from './SmartTargetingTagsTable';
import SmartTargetingExactCapacity from './SmartTargetingExactCapacity';
import SmartTargetingTestSamplingConfiguration from './SmartTargetingTestSamplingConfiguration';
import {
  normalizeCampaignResponseToDraft,
  type SmartTargetingDraftSelection,
} from '../../../utils/campaignCreationDraft';
import { serializeCampaignPayload } from '../../../utils/campaignUtils';
import { useCampaignValidation } from '../../../hooks/useCampaignValidation';
import { isCurrentUsableSmartTargetingCapacity } from '../../../utils/smartTargetingCapacity';
import { getSmartTargetingExactCapacityInputKey } from '../../../utils/smartTargetingExecutionCalculation';
import { useSmartTargetingTestSamplingSync } from './useSmartTargetingTestSamplingSync';

const isAudienceTargetingMethod = (
  value: unknown
): value is AudienceTargetingMethod =>
  value === 'standard' || value === 'smart_targeting' || value === 'excel';

const resolveAudienceTargetingMethod = (
  segment: Partial<CampaignData['segment']>
): AudienceTargetingMethod => {
  if (isAudienceTargetingMethod(segment.audienceTargetingMethod)) {
    return segment.audienceTargetingMethod;
  }
  return segment.targetAudienceExcelFileUuid != null ? 'excel' : 'standard';
};

interface PersistedCampaignContext {
  uuid: string;
  bundleId: number | null;
  audienceTargetingMethod: AudienceTargetingMethod;
}

const LevelStep: React.FC = () => {
  const { language } = useLanguage();
  const t =
    campaignLevelI18n[language as keyof typeof campaignLevelI18n] ||
    campaignLevelI18n.en;
  const {
    campaignData,
    updateLevel,
    updateContent,
    replaceCampaignData,
    resetCampaign,
    ensureCampaignCreated,
    isCampaignCreationPending,
  } = useCampaign();
  const { accessToken, user } = useAuth();
  const { showError } = useToast();
  const { uploadMedia, isUploading } = useMediaUpload(accessToken);
  const showErrorRef = useRef(showError);
  const reportSamplingError = useCallback(
    (message: string) => showErrorRef.current(message),
    []
  );
  const categories = getJobCategories(language);
  const isAgency = user?.account_type === 'marketing_agency';
  const campaignValidation = useCampaignValidation(campaignData, 1, isAgency);

  // Local state for selections
  const [campaignTitle, setCampaignTitle] = useState<string>(
    campaignData.segment.campaignTitle || ''
  );
  const [platform, setPlatform] = useState<CampaignPlatform>(
    campaignData.segment.platform || 'sms'
  );
  const [level1, setLevel1] = useState<string>(
    campaignData.segment.level1 || ''
  );
  const [level2s, setLevel2s] = useState<string[]>(
    campaignData.segment.level2s || []
  );
  const [level3s, setLevel3s] = useState<string[]>(
    campaignData.segment.level3s || []
  );
  const [jobCategory, setJobCategory] = useState<string>(
    campaignData.segment.jobCategory || ''
  );
  const [job, setJob] = useState<string>(campaignData.segment.job || '');
  const [jobErrors, setJobErrors] = useState<{
    category?: string;
    job?: string;
  }>({});
  const [audienceGrades, setAudienceGrades] = useState<AudienceGrade[]>(
    campaignData.segment.audienceGrades ?? []
  );
  const [gradeCapacities, setGradeCapacities] = useState<
    Record<AudienceGrade, number>
  >({ A: 0, B: 0, C: 0 });
  const [segmentPriceFactors, setSegmentPriceFactors] = useState<
    Record<string, number>
  >({});
  const [targetAudienceExcelFileName, setTargetAudienceExcelFileName] =
    useState<string | null>(null);
  const isTargetAudienceExcelFileModeByValue = (value: unknown): boolean =>
    value !== null && value !== undefined;
  const audienceTargetingMethod = resolveAudienceTargetingMethod(
    campaignData.segment
  );
  const isTargetAudienceExcelFileMode = audienceTargetingMethod === 'excel';
  const isSmartTargetingMode = audienceTargetingMethod === 'smart_targeting';
  const isSmartTargetingTest =
    isSmartTargetingMode && campaignData.segment.phase === 'test';
  const [persistedCampaignContext, setPersistedCampaignContext] =
    useState<PersistedCampaignContext | null>(null);
  const canUseCampaignSmartTargetingApis =
    persistedCampaignContext?.uuid === campaignData.uuid &&
    persistedCampaignContext.bundleId ===
      (campaignData.segment.bundleId ?? null) &&
    persistedCampaignContext.audienceTargetingMethod === 'smart_targeting';

  // Track if initialization has already happened
  const initializedRef = useRef(false);
  const lastInitiatedFetchedRef = useRef(false);
  const lastInitiatedInFlightRef = useRef(false);
  const excelUploadSequenceRef = useRef(0);
  const targetingModeSequenceRef = useRef(0);
  const campaignDataRef = useRef(campaignData);
  // Fetch audience spec on mount
  const {
    spec: audienceSpec,
    loading: loadingSpec,
    error: specError,
  } = useAudienceSpec(platform);

  useEffect(() => {
    campaignDataRef.current = campaignData;
  }, [campaignData]);

  useEffect(() => {
    setPersistedCampaignContext(current => {
      if (!campaignData.uuid) return null;
      if (current?.uuid === campaignData.uuid) return current;
      // Local storage can contain segment edits that were never persisted.
      // A UUID alone is therefore not proof that the local bundle/mode matches
      // the server. Keep the context unknown until a fetch/create/update
      // establishes it explicitly.
      return null;
    });
  }, [campaignData.uuid]);

  const hasLocalDraftCampaign = useCallback(() => {
    const current = campaignDataRef.current;
    const currentSegment = current?.segment || {};
    const hasDraftData = (candidate: any): boolean => {
      const segment = candidate?.segment || candidate?.level || {};
      const content = candidate?.content || {};
      const budget = candidate?.budget || {};
      return (
        !!candidate?.uuid ||
        !!segment.campaignTitle ||
        !!segment.level1 ||
        (Array.isArray(segment.level2s) && segment.level2s.length > 0) ||
        (Array.isArray(segment.level3s) && segment.level3s.length > 0) ||
        isTargetAudienceExcelFileModeByValue(
          segment.targetAudienceExcelFileUuid
        ) ||
        segment.audienceTargetingMethod === 'smart_targeting' ||
        (Array.isArray(segment.selectedTagIds) &&
          segment.selectedTagIds.length > 0) ||
        (Array.isArray(segment.audienceGrades) &&
          segment.audienceGrades.length > 0) ||
        !!segment.sex ||
        (Array.isArray(segment.city) && segment.city.length > 0) ||
        (typeof segment.bundleId === 'number' && segment.bundleId > 0) ||
        !!segment.jobCategory ||
        !!segment.job ||
        !!content.text ||
        !!content.link ||
        !!content.scheduleAt ||
        !!content.lineNumber ||
        !!content.platformSettingsId ||
        !!content.mediaUuid ||
        (typeof budget.totalBudget === 'number' && budget.totalBudget > 0)
      );
    };

    const inState =
      hasDraftData(current) ||
      !!campaignTitle ||
      !!level1 ||
      (Array.isArray(level2s) && level2s.length > 0) ||
      (Array.isArray(level3s) && level3s.length > 0) ||
      !!jobCategory ||
      !!job ||
      isTargetAudienceExcelFileModeByValue(
        currentSegment.targetAudienceExcelFileUuid // NOTE: vs current.segment
      ) ||
      currentSegment.audienceTargetingMethod === 'smart_targeting' ||
      (Array.isArray(currentSegment.selectedTagIds) &&
        currentSegment.selectedTagIds.length > 0) ||
      !!targetAudienceExcelFileName;
    if (inState) return true;

    try {
      const stored = localStorage.getItem('campaign_creation_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (hasDraftData(parsed)) return true;
      }
      const savedSelection = loadLevelSelection();
      if (!savedSelection) return false;
      return (
        !!savedSelection.campaignTitle ||
        savedSelection.level1s.length > 0 ||
        savedSelection.level2s.length > 0 ||
        savedSelection.level3s.length > 0 ||
        savedSelection.selectedTagIds.length > 0 ||
        isTargetAudienceExcelFileModeByValue(
          savedSelection.targetAudienceExcelFileUuid
        )
      );
    } catch {
      return false;
    }
  }, [
    campaignTitle,
    job,
    jobCategory,
    level1,
    level2s,
    level3s,
    targetAudienceExcelFileName,
  ]);

  const normalizeLastInitiatedCampaign = useCallback(
    (payload: any): CampaignData | null => {
      // Never override in-progress local edits with server data.
      if (hasLocalDraftCampaign()) return null;

      const campaign = payload?.item ?? payload?.data ?? payload;
      if (!campaign || typeof campaign !== 'object') return null;

      const status =
        typeof campaign.status === 'string'
          ? campaign.status.toLowerCase()
          : '';
      if (status && status !== 'initiated' && status !== 'in-progress')
        return null;

      return normalizeCampaignResponseToDraft(campaign);
    },
    [hasLocalDraftCampaign]
  );

  // Ensure API service has token
  useEffect(() => {
    if (accessToken) {
      apiService.setAccessToken(accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  // Fetch last initiated campaign once per visit when no local draft exists
  useEffect(() => {
    if (lastInitiatedFetchedRef.current) return;
    if (lastInitiatedInFlightRef.current) return;
    if (!accessToken) return;
    if (hasLocalDraftCampaign()) return;

    lastInitiatedInFlightRef.current = true;
    let canceled = false;

    const fetchLastInitiatedCampaign = async () => {
      if (hasLocalDraftCampaign()) return;

      apiService.setAccessToken(accessToken);
      const response = await apiService.getLastInitiatedCampaign();
      if (canceled) return;
      // User might have started typing while the request was in-flight
      if (hasLocalDraftCampaign()) return;

      if (!response.success || !response.data) {
        if (!response.success && response.message) {
          showErrorRef.current(response.message);
        }
        return;
      }

      const sourceCampaign = response.data.item;
      if (!sourceCampaign) return;

      let normalized = normalizeLastInitiatedCampaign(sourceCampaign);
      if (!normalized || !normalized.uuid) return;

      let smartTargetingSelection: SmartTargetingDraftSelection | undefined;
      if (
        resolveAudienceTargetingMethod(normalized.segment) === 'smart_targeting'
      ) {
        const selectionResponse =
          await apiService.getCampaignSmartTargetingSelection(
            sourceCampaign.uuid
          );
        if (canceled || hasLocalDraftCampaign()) return;
        if (!selectionResponse.success || !selectionResponse.data) {
          showErrorRef.current(
            selectionResponse.message ||
              'Failed to restore the Smart Targeting selection'
          );
          return;
        }

        smartTargetingSelection = {
          selectedTagIds: Array.from(
            new Set(
              (selectionResponse.data.selected_tag_ids || []).filter(
                tagId => Number.isInteger(tagId) && tagId > 0
              )
            )
          ),
          selectedRawCapacity:
            typeof selectionResponse.data.summary?.selected_raw_capacity ===
              'number' &&
            Number.isFinite(
              selectionResponse.data.summary.selected_raw_capacity
            )
              ? Math.max(
                  0,
                  selectionResponse.data.summary.selected_raw_capacity
                )
              : 0,
        };
      }

      const sourceStatus = sourceCampaign.status?.toLowerCase();
      if (sourceStatus === 'in-progress') {
        normalized = normalizeCampaignResponseToDraft(sourceCampaign, {
          id: null,
          uuid: '',
          clearSchedule: true,
          smartTargetingSelection,
          smartTargetingSelectionDirty: Boolean(smartTargetingSelection),
        });
      } else if (smartTargetingSelection) {
        normalized = normalizeCampaignResponseToDraft(sourceCampaign, {
          smartTargetingSelection,
          smartTargetingSelectionDirty: false,
        });
      }

      // Avoid overriding if user created a draft while normalization/persist work is happening.
      if (hasLocalDraftCampaign()) return;

      try {
        localStorage.setItem('campaign_creation_step', '1');
        saveLevelSelection({
          campaignTitle: normalized.segment.campaignTitle || '',
          level1s: normalized.segment.level1 ? [normalized.segment.level1] : [],
          level2s: normalized.segment.level2s || [],
          level3s: normalized.segment.level3s || [],
          targetAudienceExcelFileUuid:
            normalized.segment.targetAudienceExcelFileUuid ?? null,
          audienceTargetingMethod:
            normalized.segment.audienceTargetingMethod ?? 'standard',
          selectedTagIds: normalized.segment.selectedTagIds ?? [],
          smartTargetingSelectedRawCapacity:
            normalized.segment.smartTargetingSelectedRawCapacity ?? 0,
          smartTargetingScoreClasses:
            normalized.segment.smartTargetingScoreClasses ?? [],
          metadata: {},
          tags: normalized.segment.tags || [],
          count: normalized.segment.capacity || 0,
          lastUpdated: new Date().toISOString(),
        });
      } catch (storageError) {
        console.warn('Failed to persist last initiated campaign', storageError);
      }

      replaceCampaignData(normalized, 1);
      setPersistedCampaignContext(
        normalized.uuid
          ? {
              uuid: normalized.uuid,
              bundleId: normalized.segment.bundleId ?? null,
              audienceTargetingMethod: resolveAudienceTargetingMethod(
                normalized.segment
              ),
            }
          : null
      );

      setCampaignTitle(normalized.segment.campaignTitle || '');
      setPlatform(normalized.segment.platform || 'sms');
      setLevel1(normalized.segment.level1 || '');
      setLevel2s(normalized.segment.level2s || []);
      setLevel3s(normalized.segment.level3s || []);
      setTargetAudienceExcelFileName(
        normalized.segment.targetAudienceExcelFileUuid
          ? t.segmentationByTargetAudienceExcelFileUploaded
          : null
      );
      setAudienceGrades(normalized.segment.audienceGrades || []);
      setJobCategory(normalized.segment.jobCategory || '');
      setJob(normalized.segment.job || '');

      lastInitiatedFetchedRef.current = true;
    };

    fetchLastInitiatedCampaign()
      .catch(err => {
        if (!canceled) {
          console.warn('Failed to fetch last initiated campaign', err);
        }
      })
      .finally(() => {
        if (!canceled) {
          lastInitiatedInFlightRef.current = false;
        }
      });

    return () => {
      canceled = true;
      lastInitiatedInFlightRef.current = false;
    };
  }, [
    accessToken,
    hasLocalDraftCampaign,
    normalizeLastInitiatedCampaign,
    replaceCampaignData,
    t.segmentationByTargetAudienceExcelFileUploaded,
  ]);

  useEffect(() => {
    if (!accessToken) return;
    let canceled = false;
    setSegmentPriceFactors({});

    const fetchPriceFactors = async () => {
      const response = await apiService.listLatestSegmentPriceFactors(platform);
      if (canceled) return;

      if (!response.success || !response.data) {
        showErrorRef.current(
          response.message || 'Failed to load segment price factors'
        );
        return;
      }
      const items = response.data.items || [];
      const nextMap: Record<string, number> = {};
      items.forEach(item => {
        if (item?.level3) {
          nextMap[item.level3] = item.price_factor;
        }
      });
      setSegmentPriceFactors(nextMap);
    };

    fetchPriceFactors();

    return () => {
      canceled = true;
    };
  }, [accessToken, platform]);

  // Initialize from localStorage when spec is loaded (only once)
  // Loads from dedicated level selection storage, with fallback to campaignData
  useEffect(() => {
    if (!audienceSpec || initializedRef.current) return;
    const hasLocalDraft = hasLocalDraftCampaign();
    if (!hasLocalDraft) {
      initializedRef.current = true;
      return;
    }

    // Try to load from dedicated level selection storage first
    const savedSelection = loadLevelSelection();

    if (savedSelection) {
      // Always restore campaignTitle if it exists
      if (!campaignTitle && savedSelection.campaignTitle) {
        setCampaignTitle(savedSelection.campaignTitle);
        updateLevel({ campaignTitle: savedSelection.campaignTitle });
      }

      // Restore level selections if they exist
      if (
        !level1 &&
        level3s.length === 0 &&
        savedSelection.level1s.length > 0 &&
        savedSelection.level3s.length > 0
      ) {
        setLevel1(savedSelection.level1s[0]);
        setLevel2s(savedSelection.level2s);
        setLevel3s(savedSelection.level3s);
      }

      // Restore target audience excel mode/upload state.
      if (
        audienceTargetingMethod !== 'smart_targeting' &&
        campaignData.segment.targetAudienceExcelFileUuid == null &&
        savedSelection.targetAudienceExcelFileUuid != null
      ) {
        const excelFileUuid = savedSelection.targetAudienceExcelFileUuid;
        setTargetAudienceExcelFileName(
          excelFileUuid ? t.segmentationByTargetAudienceExcelFileUploaded : null
        );
        updateLevel({
          targetAudienceExcelFileUuid: excelFileUuid,
        });
      }
    }

    // Mark as initialized
    initializedRef.current = true;
  }, [
    audienceTargetingMethod,
    audienceSpec,
    campaignData.segment.targetAudienceExcelFileUuid,
    campaignTitle,
    hasLocalDraftCampaign,
    level1,
    level3s.length,
    t.segmentationByTargetAudienceExcelFileUploaded,
    updateLevel,
  ]);

  const ensureDefaultLevelSelection = useCallback(() => {
    const hasLocalDraft = hasLocalDraftCampaign();
    if (!hasLocalDraft) return;
    if (!isTargetAudienceExcelFileMode) {
      return;
    }
    if (!audienceSpec) return;

    const level1Options = getLevel1Options(audienceSpec);
    if (level1Options.length === 0) return;

    const nextLevel1 = level1 || level1Options[0].value;
    const level2Options = getLevel2Options(audienceSpec, nextLevel1);
    const nextLevel2s =
      level2s.length > 0
        ? level2s
        : level2Options.slice(0, 1).map(opt => opt.value);

    const nextLevel3Set = new Set<string>(level3s);
    if (nextLevel3Set.size === 0 && nextLevel2s.length > 0) {
      const firstLevel3Options = getLevel3Options(
        audienceSpec,
        nextLevel1,
        nextLevel2s[0]
      );
      if (firstLevel3Options.length > 0) {
        nextLevel3Set.add(firstLevel3Options[0].value);
      }
    }
    const nextLevel3s = Array.from(nextLevel3Set);

    const hasChanged =
      nextLevel1 !== level1 ||
      nextLevel2s.length !== level2s.length ||
      nextLevel2s.some((item, idx) => item !== level2s[idx]) ||
      nextLevel3s.length !== level3s.length ||
      nextLevel3s.some((item, idx) => item !== level3s[idx]);

    if (!hasChanged) return;

    setLevel1(nextLevel1);
    setLevel2s(nextLevel2s);
    setLevel3s(nextLevel3s);
  }, [
    audienceSpec,
    hasLocalDraftCampaign,
    isTargetAudienceExcelFileMode,
    level1,
    level2s,
    level3s,
  ]);

  useEffect(() => {
    if (!isTargetAudienceExcelFileMode) return;
    ensureDefaultLevelSelection();
  }, [ensureDefaultLevelSelection, isTargetAudienceExcelFileMode]);

  useEffect(() => {
    if (!isTargetAudienceExcelFileMode) {
      setTargetAudienceExcelFileName(null);
      return;
    }
    const targetAudienceExcelFileUuid =
      campaignData.segment.targetAudienceExcelFileUuid;
    if (targetAudienceExcelFileUuid == null) {
      setTargetAudienceExcelFileName(null);
      return;
    }
    if (!targetAudienceExcelFileUuid) {
      setTargetAudienceExcelFileName(null);
      return;
    }
    if (!targetAudienceExcelFileName) {
      setTargetAudienceExcelFileName(
        t.segmentationByTargetAudienceExcelFileUploaded
      );
    }
  }, [
    campaignData.segment.targetAudienceExcelFileUuid,
    isTargetAudienceExcelFileMode,
    targetAudienceExcelFileName,
    t.segmentationByTargetAudienceExcelFileUploaded,
  ]);

  // Auto-select single level3s and calculate capacity/tags when level2s or level3s change
  // Stores to dedicated localStorage: level1s, level2s, level3s, metadata, tags, count
  useEffect(() => {
    if (isSmartTargetingMode) {
      setGradeCapacities({ A: 0, B: 0, C: 0 });
      return;
    }
    if (!audienceSpec || !level1 || level2s.length === 0) {
      setGradeCapacities({ A: 0, B: 0, C: 0 });
      return;
    }

    // Auto-select level3s where only one exists
    const newL3s = new Set<string>(level3s);
    level2s.forEach(l2 => {
      const l3Options = getLevel3Options(audienceSpec, level1, l2);
      if (l3Options.length === 1) {
        newL3s.add(l3Options[0].value);
      }
    });

    // Update level3s if auto-selection added new ones
    const l3Array = Array.from(newL3s);
    if (
      l3Array.length !== level3s.length ||
      !l3Array.every(l3 => level3s.includes(l3))
    ) {
      setLevel3s(l3Array);
      return; // Exit early to prevent duplicate updates
    }

    // Collect tags, metadata, and capacities from the audience spec API.
    const nextGradeCapacities: Record<AudienceGrade, number> = {
      A: 0,
      B: 0,
      C: 0,
    };
    const tags = new Set<string>();
    const metadata: Record<string, any> = {};

    level2s.forEach(l2 => {
      const l2Meta = getLevel2Metadata(audienceSpec, level1, l2);
      if (l2Meta) {
        metadata[l2] = l2Meta;
      }

      const l3Options = getLevel3Options(audienceSpec, level1, l2).map(
        opt => opt.value
      );
      const selectedForL3 = l3Array.filter(l3 => l3Options.includes(l3));

      selectedForL3.forEach(l3 => {
        // Tags and metadata from audienceSpec
        const item = getAudienceSpecItem(audienceSpec, level1, l2, l3);
        const itemTags = getItemTags(audienceSpec, level1, l2, l3);
        itemTags.forEach(tag => tags.add(tag));
        if (item) {
          metadata[`${l2}.${l3}`] = {
            tags: item.tags || [],
            available_audience: item.available_audience || 0,
          };
        }

        // Grade capacities come from the statistics on the selected API item.
        if (item) {
          (['A', 'B', 'C'] as AudienceGrade[]).forEach(grade => {
            nextGradeCapacities[grade] += calculateAudienceGradeCapacity(
              item,
              grade,
              platform
            );
          });
        }
      });
    });

    setGradeCapacities(nextGradeCapacities);
    const selectedGradeCapacity = audienceGrades.reduce(
      (sum, grade) => sum + nextGradeCapacities[grade],
      0
    );

    // Create level selection state
    const selectionState: LevelSelectionState = {
      campaignTitle: campaignTitle,
      level1s: [level1],
      level2s: level2s,
      level3s: l3Array,
      targetAudienceExcelFileUuid:
        campaignData.segment.targetAudienceExcelFileUuid ?? null,
      audienceTargetingMethod,
      selectedTagIds: campaignData.segment.selectedTagIds ?? [],
      smartTargetingSelectedRawCapacity:
        campaignData.segment.smartTargetingSelectedRawCapacity ?? 0,
      smartTargetingScoreClasses:
        campaignData.segment.smartTargetingScoreClasses ?? [],
      metadata: metadata,
      tags: Array.from(tags),
      count: selectedGradeCapacity,
      lastUpdated: new Date().toISOString(),
    };

    // Save to dedicated level selection storage
    saveLevelSelection(selectionState);

    // Block when selected API items have no capacity or capacity is below 500.
    const capacityTooLow =
      !isTargetAudienceExcelFileMode &&
      l3Array.length > 0 &&
      selectedGradeCapacity < 500;

    updateLevel({
      level1: level1,
      level2s: level2s,
      level3s: l3Array,
      targetAudienceExcelFileUuid:
        campaignData.segment.targetAudienceExcelFileUuid ?? null,
      tags: Array.from(tags),
      capacity: selectedGradeCapacity,
      capacityTooLow: capacityTooLow,
      jobCategory,
      job,
    });
  }, [
    audienceSpec,
    level1,
    level2s,
    level3s,
    platform,
    audienceTargetingMethod,
    campaignData.segment.selectedTagIds,
    campaignData.segment.smartTargetingSelectedRawCapacity,
    campaignData.segment.smartTargetingScoreClasses,
    campaignData.segment.targetAudienceExcelFileUuid,
    campaignTitle,
    jobCategory,
    job,
    audienceGrades,
    isTargetAudienceExcelFileMode,
    isSmartTargetingMode,
    updateLevel,
  ]);

  const handleAudienceGradesChange = (grades: AudienceGrade[]) => {
    setAudienceGrades(grades);
    updateLevel({ audienceGrades: grades });
  };

  const handleBundleChange = (value: number | null) => {
    targetingModeSequenceRef.current += 1;
    const bundleChanged = value !== campaignData.segment.bundleId;
    updateLevel({
      bundleId: value,
      ...(bundleChanged
        ? {
            selectedTagIds: [],
            smartTargetingSelectedRawCapacity: 0,
            smartTargetingSelectionDirty: false,
            smartTargetingScoreClasses: [],
            smartTargetingScoreClassesDirty: false,
            smartTargetingTestSamplingInputsDirty: false,
            smartTargetingCapacityCalculation: null,
            smartTargetingExactCapacityRequired: false,
            smartTargetingSortBy: '',
            smartTargetingSortDirection: 'desc',
            smartTargetingSelectionOrderPending: false,
            smartTargetingTestPreview: null,
            smartTargetingTestPreviewInputKey: null,
            smartTargetingTestPreviewStale: false,
          }
        : {}),
    });
  };

  const handlePhaseChange = (value: string) => {
    if (value === 'test' || value === 'execution') {
      updateLevel({
        phase: value as CampaignPhase,
        smartTargetingSelectionOrderPending:
          value === 'test' &&
          (campaignDataRef.current.segment.selectedTagIds?.length ?? 0) > 1,
      });
    }
  };

  const persistTargetingSelection = (
    method: AudienceTargetingMethod,
    selectedTagIds = campaignData.segment.selectedTagIds ?? [],
    selectedRawCapacity = campaignData.segment
      .smartTargetingSelectedRawCapacity ?? 0,
    targetAudienceExcelFileUuid = campaignData.segment
      .targetAudienceExcelFileUuid ?? null,
    title = campaignTitle
  ) => {
    const savedSelection = loadLevelSelection() ?? createEmptyLevelSelection();
    saveLevelSelection({
      ...savedSelection,
      campaignTitle: title,
      targetAudienceExcelFileUuid,
      audienceTargetingMethod: method,
      selectedTagIds,
      smartTargetingSelectedRawCapacity: selectedRawCapacity,
      smartTargetingScoreClasses:
        campaignData.segment.smartTargetingScoreClasses ?? [],
      count:
        method === 'smart_targeting'
          ? selectedRawCapacity
          : (campaignData.segment.capacity ?? savedSelection.count),
    });
  };

  const handleCampaignTitleChange = (value: string) => {
    setCampaignTitle(value);
    updateLevel({ campaignTitle: value });
    persistTargetingSelection(
      audienceTargetingMethod,
      undefined,
      undefined,
      undefined,
      value
    );
  };

  const handleSmartTargetingSelectionChange = (
    tagIds: number[],
    selectedRawCapacity: number,
    source: 'local' | 'server'
  ) => {
    updateLevel({
      audienceTargetingMethod: 'smart_targeting',
      selectedTagIds: tagIds,
      smartTargetingSelectedRawCapacity: selectedRawCapacity,
      smartTargetingSelectionDirty: source === 'local',
      smartTargetingTestSamplingInputsDirty: source === 'local',
      smartTargetingSelectionOrderPending:
        campaignDataRef.current.segment.phase === 'test' && tagIds.length > 1,
      capacity: undefined,
      capacityTooLow:
        campaignDataRef.current.segment.phase !== 'test' &&
        tagIds.length > 0 &&
        selectedRawCapacity < 500,
    });
    persistTargetingSelection('smart_targeting', tagIds, selectedRawCapacity);
  };

  const handleCapacitySelectionPersisted = useCallback(
    (tagIds: number[], selectedRawCapacity: number) => {
      updateLevel({
        audienceTargetingMethod: 'smart_targeting',
        selectedTagIds: tagIds,
        smartTargetingSelectedRawCapacity: selectedRawCapacity,
        smartTargetingSelectionDirty: false,
      });
    },
    [updateLevel]
  );

  const handleSmartTargetingSortChange = useCallback(
    (
      sortBy: CampaignData['segment']['smartTargetingSortBy'],
      sortDirection: CampaignData['segment']['smartTargetingSortDirection']
    ) => {
      const current = campaignDataRef.current.segment;
      if (
        current.smartTargetingSortBy === sortBy &&
        current.smartTargetingSortDirection === sortDirection
      ) {
        return;
      }
      updateLevel({
        smartTargetingSortBy: sortBy,
        smartTargetingSortDirection: sortDirection,
        smartTargetingSelectionOrderPending:
          current.phase === 'test' && (current.selectedTagIds?.length ?? 0) > 1,
      });
    },
    [updateLevel]
  );

  const handleSmartTargetingSelectionOrderSyncChange = useCallback(
    (pending: boolean) => {
      const current = campaignDataRef.current.segment;
      if (current.smartTargetingSelectionOrderPending === pending) return;
      updateLevel({ smartTargetingSelectionOrderPending: pending });
    },
    [updateLevel]
  );

  const handleEnsureCampaignCreatedForCapacity = useCallback(
    async (signal?: AbortSignal) => {
      const current = campaignDataRef.current;
      if (current.uuid.trim()) {
        if (!canUseCampaignSmartTargetingApis) {
          apiService.setAccessToken(accessToken || null);
          const updatePayload = serializeCampaignPayload(current, {
            includeContent: false,
            includeBudget: false,
            finalize: false,
          });
          const response = await apiService.updateCampaign(
            current.uuid,
            updatePayload,
            signal
          );
          if (!response.success) {
            return {
              success: false,
              errorCode: response.error?.code || 'CAMPAIGN_UPDATE_FAILED',
            };
          }
          setPersistedCampaignContext({
            uuid: current.uuid.trim(),
            bundleId: current.segment.bundleId ?? null,
            audienceTargetingMethod: 'smart_targeting',
          });
        }
        return {
          success: true,
          uuid: current.uuid.trim(),
          created: false,
          selectionPersisted: !canUseCampaignSmartTargetingApis,
        };
      }
      if (!campaignValidation.isStepCompleted(1)) {
        return { success: false, errorCode: 'INVALID_CAMPAIGN_DATA' };
      }

      apiService.setAccessToken(accessToken || null);
      const payload = serializeCampaignPayload(current);
      const response = await ensureCampaignCreated(() =>
        apiService.createCampaign(payload)
      );
      const uuid = response.data?.uuid?.trim();
      const id = response.data?.id;
      if (
        !response.success ||
        !uuid ||
        !Number.isInteger(id) ||
        (id ?? 0) < 1
      ) {
        return {
          success: false,
          errorCode:
            response.error?.code ||
            (response.success
              ? 'INVALID_RESPONSE'
              : 'CAMPAIGN_CREATION_FAILED'),
        };
      }

      setPersistedCampaignContext({
        uuid,
        bundleId: current.segment.bundleId ?? null,
        audienceTargetingMethod: 'smart_targeting',
      });

      return {
        success: true,
        uuid,
        created: true,
        selectionPersisted: true,
      };
    },
    [
      accessToken,
      campaignValidation,
      canUseCampaignSmartTargetingApis,
      ensureCampaignCreated,
    ]
  );

  const handleSmartTargetingScoreClassesChange = useCallback(
    (scoreClasses: AudienceGrade[], source: 'local' | 'server') => {
      const current = campaignDataRef.current.segment;
      const nextDirty = source === 'local';
      if (
        current.smartTargetingScoreClassesDirty === nextDirty &&
        JSON.stringify(current.smartTargetingScoreClasses || []) ===
          JSON.stringify(scoreClasses)
      ) {
        return;
      }
      updateLevel({
        smartTargetingScoreClasses: scoreClasses,
        smartTargetingScoreClassesDirty: nextDirty,
        smartTargetingTestSamplingInputsDirty: nextDirty,
      });
    },
    [updateLevel]
  );

  useSmartTargetingTestSamplingSync({
    campaignData,
    accessToken,
    enabled: isSmartTargetingTest && canUseCampaignSmartTargetingApis,
    updateLevel,
    showError: reportSamplingError,
  });

  const handleSmartTargetingCalculationChange = useCallback(
    (
      calculation: SmartTargetingCapacityCalculationResponse | null,
      source: 'lookup' | 'poll' | 'start' | 'stale'
    ) => {
      const current = campaignDataRef.current.segment;
      const calculationIsCurrent = isCurrentUsableSmartTargetingCapacity(
        calculation,
        current.selectedTagIds,
        calculation?.selected_score_classes
      );
      const freshCalculationId =
        source === 'start' && calculation
          ? calculation.calculation_id
          : current.smartTargetingExactCapacityFreshCalculationId;
      const isFreshAfterForcedRecalculation =
        current.smartTargetingExactCapacityForceFreshCalculation !== true ||
        (freshCalculationId !== null &&
          calculation?.calculation_id === freshCalculationId &&
          (source === 'start' || source === 'poll'));
      if (
        JSON.stringify(current.smartTargetingCapacityCalculation ?? null) ===
          JSON.stringify(calculation) &&
        (!calculationIsCurrent ||
          !isFreshAfterForcedRecalculation ||
          current.smartTargetingExactCapacityRequired !== true)
      ) {
        return;
      }
      updateLevel({
        smartTargetingCapacityCalculation: calculation,
        ...(source === 'start' && calculation
          ? {
              smartTargetingExactCapacityFreshCalculationId:
                calculation.calculation_id,
            }
          : {}),
        ...(calculationIsCurrent && isFreshAfterForcedRecalculation
          ? {
              smartTargetingExactCapacityRequired: false,
              smartTargetingExactCapacityForceFreshCalculation: false,
              smartTargetingExactCapacityInvalidatedCalculationId: null,
              smartTargetingExactCapacityFreshCalculationId: null,
              smartTargetingExactCapacityInputKey:
                getSmartTargetingExactCapacityInputKey({
                  ...campaignDataRef.current,
                  segment: {
                    ...current,
                    smartTargetingScoreClasses:
                      calculation?.selected_score_classes ??
                      current.smartTargetingScoreClasses,
                  },
                }),
            }
          : {}),
      });
    },
    [updateLevel]
  );

  const handleSegmentationModeChange = (
    mode: 'target-audience-excel-file' | 'levels' | 'smart-targeting'
  ) => {
    const modeSequence = targetingModeSequenceRef.current + 1;
    targetingModeSequenceRef.current = modeSequence;

    if (mode === 'levels') {
      setTargetAudienceExcelFileName(null);
      updateLevel({
        audienceTargetingMethod: 'standard',
        smartTargetingSelectionOrderPending: false,
      });
      persistTargetingSelection('standard');
      return;
    }

    if (mode === 'smart-targeting') {
      setTargetAudienceExcelFileName(null);
      updateLevel({
        audienceTargetingMethod: 'smart_targeting',
        capacity: undefined,
        capacityTooLow: false,
      });
      persistTargetingSelection('smart_targeting');

      const current = campaignDataRef.current;
      const canRestorePersistedSelection =
        Boolean(current.uuid) &&
        persistedCampaignContext?.uuid === current.uuid &&
        persistedCampaignContext.bundleId ===
          (current.segment.bundleId ?? null) &&
        current.segment.smartTargetingSelectionDirty !== true;

      if (canRestorePersistedSelection) {
        void apiService
          .getCampaignSmartTargetingSelection(current.uuid)
          .then(response => {
            const latest = campaignDataRef.current;
            if (
              targetingModeSequenceRef.current !== modeSequence ||
              latest.uuid !== current.uuid ||
              latest.segment.bundleId !== current.segment.bundleId ||
              !response.success ||
              !response.data
            ) {
              return;
            }

            const tagIds = Array.from(
              new Set(
                (response.data.selected_tag_ids || []).filter(
                  tagId => Number.isInteger(tagId) && tagId > 0
                )
              )
            );
            const selectedRawCapacity =
              typeof response.data.summary?.selected_raw_capacity ===
                'number' &&
              Number.isFinite(response.data.summary.selected_raw_capacity)
                ? Math.max(0, response.data.summary.selected_raw_capacity)
                : 0;
            handleSmartTargetingSelectionChange(
              tagIds,
              selectedRawCapacity,
              'server'
            );
          });
      }
      return;
    }

    updateLevel({
      audienceTargetingMethod: 'excel',
      smartTargetingSelectionOrderPending: false,
      targetAudienceExcelFileUuid:
        campaignData.segment.targetAudienceExcelFileUuid ?? '',
    });
    persistTargetingSelection(
      'excel',
      undefined,
      undefined,
      campaignData.segment.targetAudienceExcelFileUuid ?? ''
    );
    ensureDefaultLevelSelection();
  };

  const handleTargetAudienceExcelFileUpload = async (file: File) => {
    if (!isTargetAudienceExcelFile(file)) {
      showError(t.segmentationByTargetAudienceExcelFileInvalidType);
      return;
    }

    const uploadSequence = excelUploadSequenceRef.current + 1;
    excelUploadSequenceRef.current = uploadSequence;
    if (campaignData.segment.targetAudienceExcelFileUuid == null) {
      updateLevel({
        audienceTargetingMethod: 'excel',
        targetAudienceExcelFileUuid: '',
      });
      persistTargetingSelection('excel', undefined, undefined, '');
    }
    setTargetAudienceExcelFileName(file.name);
    ensureDefaultLevelSelection();

    const uuid = await uploadMedia(file);
    if (
      excelUploadSequenceRef.current !== uploadSequence ||
      resolveAudienceTargetingMethod(campaignDataRef.current.segment) !==
        'excel'
    ) {
      return;
    }
    if (!uuid) {
      updateLevel({
        audienceTargetingMethod: 'excel',
        targetAudienceExcelFileUuid: '',
      });
      persistTargetingSelection('excel', undefined, undefined, '');
      return;
    }

    updateLevel({
      audienceTargetingMethod: 'excel',
      targetAudienceExcelFileUuid: uuid,
    });
    persistTargetingSelection('excel', undefined, undefined, uuid);
  };

  const handleTargetAudienceExcelFileClear = () => {
    excelUploadSequenceRef.current += 1;
    setTargetAudienceExcelFileName(null);
    updateLevel({
      audienceTargetingMethod: 'excel',
      targetAudienceExcelFileUuid: '',
    });
    persistTargetingSelection('excel', undefined, undefined, '');
  };

  const handleLevel1Change = (value: string) => {
    setLevel1(value);
    setLevel2s([]);
    setLevel3s([]);

    // Save empty state to level selection storage (preserve campaignTitle)
    const emptySelection = createEmptyLevelSelection();
    emptySelection.campaignTitle = campaignTitle;
    emptySelection.level1s = [value];
    saveLevelSelection(emptySelection);

    updateLevel({
      level1: value,
      level2s: [],
      level3s: [],
      tags: [],
      capacity: 0,
      capacityTooLow: false,
    });
  };

  const handleLevel2Toggle = (l2: string) => {
    setLevel2s(prev => {
      if (prev.includes(l2)) {
        // Remove level2 and all its associated level3s
        const l3ToRemove = getLevel3Options(
          audienceSpec || null,
          level1,
          l2
        ).map(opt => opt.value);
        setLevel3s(prevL3s => prevL3s.filter(l3 => !l3ToRemove.includes(l3)));
        return prev.filter(item => item !== l2);
      } else {
        return [...prev, l2];
      }
    });
  };

  const handleJobCategoryChange = (value: string) => {
    setJobCategory(value);
    setJob('');
    updateLevel({ jobCategory: value, job: '' });
    setJobErrors(prev => ({
      ...prev,
      category: value ? '' : t.agencyCategoryRequired,
      job: '',
    }));
  };

  const handleJobChange = (value: string) => {
    setJob(value);
    updateLevel({ job: value });
    setJobErrors(prev => ({ ...prev, job: value ? '' : t.agencyJobRequired }));
  };

  const handleLevel3Toggle = (l3: string) => {
    setLevel3s(prev => {
      if (prev.includes(l3)) {
        return prev.filter(item => item !== l3);
      } else {
        return [...prev, l3];
      }
    });
  };

  const handlePlatformChange = (value: CampaignPlatform) => {
    targetingModeSequenceRef.current += 1;
    excelUploadSequenceRef.current += 1;
    setPlatform(value);
    setLevel1('');
    setLevel2s([]);
    setLevel3s([]);
    setGradeCapacities({ A: 0, B: 0, C: 0 });
    setAudienceGrades([]);
    setTargetAudienceExcelFileName(null);
    clearLevelSelection();
    // Platform-specific settings selection from content step must be reset on platform switch.
    updateContent({
      lineNumber: '',
      platformSettingsId: null,
      mediaUuid: null,
    });
    updateLevel({
      platform: value,
      audienceTargetingMethod: 'standard',
      level1: '',
      level2s: [],
      level3s: [],
      targetAudienceExcelFileUuid: null,
      tags: [],
      selectedTagIds: [],
      smartTargetingSelectedRawCapacity: 0,
      smartTargetingSelectionDirty: false,
      smartTargetingScoreClasses: [],
      smartTargetingScoreClassesDirty: false,
      smartTargetingTestSamplingInputsDirty: false,
      smartTargetingCapacityCalculation: null,
      smartTargetingExactCapacityRequired: false,
      smartTargetingSortBy: '',
      smartTargetingSortDirection: 'desc',
      smartTargetingSelectionOrderPending: false,
      smartTargetingTestPreview: null,
      smartTargetingTestPreviewInputKey: null,
      smartTargetingTestPreviewStale: false,
      capacity: 0,
      capacityTooLow: false,
      audienceGrades: [],
      sex: '',
      city: [],
    });
  };

  const handleReset = () => {
    if (!hasLocalDraftCampaign()) return;
    targetingModeSequenceRef.current += 1;
    excelUploadSequenceRef.current += 1;

    // Keep form empty after reset instead of re-hydrating from last initiated campaign.
    lastInitiatedFetchedRef.current = true;
    lastInitiatedInFlightRef.current = false;

    setCampaignTitle('');
    setPlatform('sms');
    setLevel1('');
    setLevel2s([]);
    setLevel3s([]);
    setGradeCapacities({ A: 0, B: 0, C: 0 });
    setAudienceGrades([]);
    setTargetAudienceExcelFileName(null);
    setJobCategory('');
    setJob('');
    setJobErrors({});
    clearLevelSelection();

    resetCampaign();
  };

  const level1Options = getLevel1Options(audienceSpec || null);
  const level2Options = getLevel2Options(audienceSpec || null, level1);

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch'>
        {/* Bundle Info */}
        <div className='md:col-span-2'>
          <BundleInfoCard
            bundleId={campaignData.segment.bundleId}
            phase={campaignData.segment.phase}
            onBundleChange={handleBundleChange}
            onPhaseChange={handlePhaseChange}
            accessToken={accessToken}
            title={t.bundleInfoTitle}
            bundleLabel={t.bundle}
            bundlePlaceholder={t.bundlePlaceholder}
            phaseLabel={t.phase}
            phasePlaceholder={t.phasePlaceholder}
            phaseTestLabel={t.phaseTest}
            phaseExecutionLabel={t.phaseExecution}
            loadingLabel={t.bundleLoading}
            errorLabel={t.bundleLoadError}
            emptyLabel={t.bundleEmpty}
            createLabel={t.bundleCreateAction}
          />
        </div>

        {/* Platform Selection */}
        <div className='md:col-span-2'>
          <PlatformSelectionCard
            title={t.platform}
            value={platform}
            onChange={handlePlatformChange}
            options={[
              { value: 'sms', label: t.platformSms },
              { value: 'rubika', label: t.platformRubika },
              { value: 'bale', label: t.platformBale },
              { value: 'splus', label: t.platformSplus },
            ]}
          />
        </div>

        {/* Campaign Title */}
        <div className='md:col-span-2'>
          <TitleCard
            title={campaignTitle || ''}
            onChange={handleCampaignTitleChange}
            label={t.campaignTitleLabel}
            placeholder={t.campaignTitlePlaceholder}
            validationMessage={t.campaignTitleValidation}
          />
        </div>

        {isAgency && (
          <div className='md:col-span-2'>
            <div className='bg-white shadow-sm border border-gray-200 rounded-lg p-4'>
              <CategoryJobFields
                category={jobCategory}
                job={job}
                onChange={(field, value) =>
                  field === 'jobCategory'
                    ? handleJobCategoryChange(value)
                    : handleJobChange(value)
                }
                requiredLabel={<span className='text-red-500'>*</span>}
                strings={{
                  categoryHeader: t.agencyCategoryHeader,
                  category: t.agencyCategory,
                  selectCategory: t.agencySelectCategory,
                  job: t.agencyJob,
                  selectJob: t.agencySelectJob,
                }}
                categories={categories}
                errors={{
                  category:
                    isAgency && !jobCategory
                      ? t.agencyCategoryRequired
                      : jobErrors.category,
                  job: isAgency && !job ? t.agencyJobRequired : jobErrors.job,
                }}
              />
            </div>
          </div>
        )}

        <div className='md:col-span-2'>
          <div className='bg-white shadow-sm border border-gray-200 rounded-lg p-4'>
            <p className='text-sm font-medium text-gray-900 mb-3'>
              {t.segmentationMode}
            </p>
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:gap-6'>
              <label className='inline-flex items-center gap-2 text-sm text-gray-700'>
                <input
                  type='radio'
                  name='segmentationMode'
                  checked={audienceTargetingMethod === 'standard'}
                  onChange={() => handleSegmentationModeChange('levels')}
                />
                <span>{t.segmentationByLevels}</span>
              </label>
              <label className='inline-flex items-center gap-2 text-sm text-gray-700'>
                <input
                  type='radio'
                  name='segmentationMode'
                  checked={isSmartTargetingMode}
                  onChange={() =>
                    handleSegmentationModeChange('smart-targeting')
                  }
                />
                <span>{t.segmentationBySmartTargeting}</span>
              </label>
              <label className='inline-flex items-center gap-2 text-sm text-gray-700'>
                <input
                  type='radio'
                  name='segmentationMode'
                  checked={isTargetAudienceExcelFileMode}
                  onChange={() =>
                    handleSegmentationModeChange('target-audience-excel-file')
                  }
                />
                <span>{t.segmentationByTargetAudienceExcelFile}</span>
              </label>
            </div>
          </div>
        </div>

        {isSmartTargetingMode ? (
          <div className='md:col-span-2'>
            <SmartTargetingTagsTable
              bundleId={campaignData.segment.bundleId}
              campaignUuid={campaignData.uuid || undefined}
              selectedTagIds={campaignData.segment.selectedTagIds || []}
              selectedRawCapacity={
                campaignData.segment.smartTargetingSelectedRawCapacity || 0
              }
              useCampaignEndpoints={canUseCampaignSmartTargetingApis}
              selectionIsDirty={
                campaignData.segment.smartTargetingSelectionDirty === true
              }
              preserveSelectionOrder={isSmartTargetingTest}
              initialSortBy={campaignData.segment.smartTargetingSortBy || ''}
              initialSortDirection={
                campaignData.segment.smartTargetingSortDirection || 'desc'
              }
              onSortChange={handleSmartTargetingSortChange}
              onSelectionOrderSyncChange={
                handleSmartTargetingSelectionOrderSyncChange
              }
              onSelectionChange={handleSmartTargetingSelectionChange}
              copy={t.smartTargeting}
            />
            {isSmartTargetingTest ? (
              <SmartTargetingTestSamplingConfiguration
                selectedTagCount={
                  campaignData.segment.selectedTagIds?.length ?? 0
                }
                sampleSizePerTag={campaignData.segment.sampleSizePerTag ?? 0}
                selectedScoreClasses={
                  campaignData.segment.smartTargetingScoreClasses || []
                }
                onSampleSizeChange={value =>
                  updateLevel({
                    sampleSizePerTag: value,
                    smartTargetingTestSamplingInputsDirty: true,
                  })
                }
                onScoreClassesChange={value =>
                  handleSmartTargetingScoreClassesChange(value, 'local')
                }
                copy={t.smartTargeting.testPreview}
              />
            ) : null}
            <SmartTargetingExactCapacity
              campaignUuid={campaignData.uuid || undefined}
              selectedTagIds={campaignData.segment.selectedTagIds || []}
              selectedRawCapacity={
                campaignData.segment.smartTargetingSelectedRawCapacity || 0
              }
              selectionIsDirty={
                campaignData.segment.smartTargetingSelectionDirty === true
              }
              selectedScoreClasses={
                campaignData.segment.smartTargetingScoreClasses || []
              }
              scoreClassesAreDirty={
                campaignData.segment.smartTargetingScoreClassesDirty === true
              }
              initialCalculation={
                campaignData.segment.smartTargetingCapacityCalculation
              }
              calculationRequiredByServer={
                campaignData.segment.smartTargetingExactCapacityRequired ===
                true
              }
              forceFreshCalculation={
                campaignData.segment.smartTargetingExactCapacityForceFreshCalculation ===
                true
              }
              invalidatedCalculationId={
                campaignData.segment
                  .smartTargetingExactCapacityInvalidatedCalculationId
              }
              freshCalculationId={
                campaignData.segment
                  .smartTargetingExactCapacityFreshCalculationId
              }
              canCreateCampaign={campaignValidation.isStepCompleted(1)}
              preserveSelectionOrder={isSmartTargetingTest}
              selectionOrderIsPending={
                isSmartTargetingTest &&
                campaignData.segment.smartTargetingSelectionOrderPending ===
                  true
              }
              showScoreClassSelector={!isSmartTargetingTest}
              syncScoreClassesFromCalculation={!isSmartTargetingTest}
              ensureCampaignCreated={handleEnsureCampaignCreatedForCapacity}
              onSelectionPersisted={handleCapacitySelectionPersisted}
              onScoreClassesChange={handleSmartTargetingScoreClassesChange}
              onCalculationChange={handleSmartTargetingCalculationChange}
              copy={t.smartTargeting.exactCapacity}
            />
            {(campaignData.segment.selectedTagIds?.length ?? 0) === 0 ? (
              <p className='mt-2 text-sm text-red-600'>
                {t.smartTargeting.validationRequired}
              </p>
            ) : !isSmartTargetingTest &&
              (campaignData.segment.smartTargetingSelectedRawCapacity ?? 0) <
                500 ? (
              <p className='mt-2 text-sm text-red-600'>{t.capacityTooLow}</p>
            ) : null}
          </div>
        ) : isTargetAudienceExcelFileMode ? (
          <div className='md:col-span-2'>
            <TargetAudienceExcelFileUploadCard
              label={t.segmentationByTargetAudienceExcelFileTitle}
              help={t.segmentationByTargetAudienceExcelFileHelp}
              sampleFileHref='/sample-target-audience-uids.xls'
              sampleFileLabel={
                t.segmentationByTargetAudienceExcelFileSampleDownload
              }
              uploadingLabel={t.segmentationByTargetAudienceExcelFileUploading}
              uploadedLabel={t.segmentationByTargetAudienceExcelFileUploaded}
              removeLabel={t.segmentationByTargetAudienceExcelFileRemove}
              fileName={targetAudienceExcelFileName}
              isUploading={isUploading}
              onUpload={handleTargetAudienceExcelFileUpload}
              onClear={handleTargetAudienceExcelFileClear}
            />
            {!isUploading &&
              (!campaignData.segment.targetAudienceExcelFileUuid ||
                !campaignData.segment.targetAudienceExcelFileUuid.trim()) && (
                <p className='text-sm text-red-600 mt-2'>
                  {t.segmentationByTargetAudienceExcelFileRequired}
                </p>
              )}
            {specError && (
              <p className='text-sm text-red-600 mt-2'>{specError}</p>
            )}
          </div>
        ) : (
          <>
            {/* Level 1 Selection */}
            <div className='md:col-span-2'>
              {specError ? (
                <div className='text-sm text-red-600'>{specError}</div>
              ) : loadingSpec ? (
                <div className='text-sm text-gray-600'>{t.loading}</div>
              ) : (
                <LevelOneCard
                  label={t.level1Label || 'Level 1'}
                  labelDescription={t.level1Description || ''}
                  placeholder={t.level1Placeholder || 'Select Level 1'}
                  options={level1Options}
                  value={level1}
                  onChange={handleLevel1Change}
                />
              )}
            </div>

            {/* Level 2 and Level 3 Selection */}
            {level1 && !specError && !loadingSpec && (
              <div className='md:col-span-2'>
                <LevelTwoCard
                  spec={audienceSpec || null}
                  level1={level1}
                  label={t.level2Label}
                  help={t.level2Help}
                  options={level2Options}
                  selectedLevel2s={level2s}
                  selectedLevel3s={level3s}
                  onToggleLevel2={handleLevel2Toggle}
                  onToggleLevel3={handleLevel3Toggle}
                  validationMessage={t.level2Validation}
                />
                <SegmentPriceFactorsCard
                  level3s={level3s}
                  segmentPriceFactors={segmentPriceFactors}
                  label={t.segmentPriceFactors}
                  notSetLabel={t.notSet}
                />
                {level3s.length > 0 && (
                  <AudienceGradeCard
                    title={t.audienceGradeTitle}
                    gradeALabel={t.audienceGradeA}
                    gradeBLabel={t.audienceGradeB}
                    gradeCLabel={t.audienceGradeC}
                    selectedGrades={audienceGrades}
                    gradeCapacities={gradeCapacities}
                    onChange={handleAudienceGradesChange}
                    unitsLabel={t.users}
                  />
                )}
              </div>
            )}

            {/* Capacity Display — sum of selected grade capacities */}
            <div className='md:col-span-2'>
              <CapacityCard
                title={t.campaignCapacity}
                help={t.campaignCapacityHelp}
                isLoading={false}
                capacity={audienceGrades.reduce(
                  (sum, g) => sum + gradeCapacities[g],
                  0
                )}
                fallbackCapacity={audienceGrades.reduce(
                  (sum, g) => sum + gradeCapacities[g],
                  0
                )}
                unitsLabel={t.users}
                calculatingLabel={t.calculating}
                notSetLabel={t.notSet}
                lowCapacityLabel={t.capacityTooLow}
                error={null}
              />
            </div>
          </>
        )}

        <div className='md:col-span-2 flex items-center'>
          <Button
            variant='outline'
            onClick={handleReset}
            disabled={isCampaignCreationPending}
          >
            {t.reset}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LevelStep;
