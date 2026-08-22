import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigation } from '../contexts/NavigationContext';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { getReportsPathWithFilters } from '../utils/reportsNavigation';
import BundleDetailActionBar from './bundles/components/BundleDetailActionBar';
import BundleEditSection from './bundles/components/BundleEditSection';
import BundleDetailHeader from './bundles/components/BundleDetailHeader';
import BundleLinkDetailsSection from './bundles/components/BundleLinkDetailsSection';
import BundleOverviewSection from './bundles/components/BundleOverviewSection';
import BundleTagEvaluationSection from './bundles/components/BundleTagEvaluationSection';
import BundleQuickAccessSection from './bundles/components/BundleQuickAccessSection';
import BundleActionDataSection from './bundles/components/BundleActionDataSection';
import { useBundleDetails } from './bundles/hooks/useBundleDetails';
import { getBundlesCopy } from './bundles/translations';
import { BundleListItem } from '../types/bundle';
import {
  createCampaignCreationDraft,
  prepareCampaignCreationDraft,
} from '../utils/campaignCreationDraft';
import { ROUTES } from '../config/routes';
import {
  BUNDLE_TOAST_DURATION_MS,
  getBundleJob,
  getBundleJobCategory,
  getBundleShortLinkDomain,
} from './bundles/utils';

const BundleDetailPage: React.FC = () => {
  const { language } = useLanguage();
  const { navigate } = useNavigation();
  const { showError, showInfo } = useToast();
  const { user } = useAuth();
  const copy = useMemo(() => getBundlesCopy(language), [language]);
  const isAgency = user?.account_type === 'marketing_agency';
  const [isEditing, setIsEditing] = useState(false);
  const bundleId = useMemo(() => {
    const value = new URLSearchParams(window.location.search).get('id');
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, []);

  const { bundle, loading, error, retry } = useBundleDetails({
    bundleId,
    copy,
  });

  useEffect(() => {
    if (error) {
      showError(error, BUNDLE_TOAST_DURATION_MS);
    }
  }, [error, showError]);

  const handleBack = () => navigate('/dashboard/bundles');
  const handleEditCancel = () => setIsEditing(false);
  const handleEditSuccess = () => {
    setIsEditing(false);
    retry();
  };

  const getBundleId = (bundleItem: BundleListItem): number | null => {
    return bundleItem.id > 0 ? bundleItem.id : null;
  };

  const openCampaignDraftForBundle = (
    bundleItem: BundleListItem,
    phase: 'test' | 'execution' = 'execution'
  ) => {
    const bundleId = getBundleId(bundleItem);
    if (!bundleId) {
      showError(copy.messages.missingBundleId, BUNDLE_TOAST_DURATION_MS);
      return;
    }

    const link = bundleItem.adlink?.trim() || '';
    const shortLinkDomain = getBundleShortLinkDomain(bundleItem);
    const jobCategory = isAgency ? getBundleJobCategory(bundleItem) : '';
    const job = isAgency ? getBundleJob(bundleItem) : '';

    prepareCampaignCreationDraft(
      createCampaignCreationDraft({
        segment: {
          campaignTitle: '',
          level1: '',
          level2s: [],
          level3s: [],
          platform: 'sms',
          bundleId,
          jobCategory,
          job,
          phase,
        },
        content: {
          insertLink: Boolean(link),
          link,
          shortLinkDomain: link ? shortLinkDomain : null,
          text: '',
        },
      })
    );

    showInfo(
      copy.messages.creatingCampaignFromBundle,
      BUNDLE_TOAST_DURATION_MS
    );
    window.location.href = ROUTES.CAMPAIGN_CREATION.path;
  };

  const handleAction = (action: string, bundleItem: BundleListItem) => {
    if (action === 'create-campaign') {
      openCampaignDraftForBundle(bundleItem);
      return;
    }

    if (action === 'create-campaign-test') {
      openCampaignDraftForBundle(bundleItem, 'test');
      return;
    }

    if (action === 'create-campaign-execution') {
      openCampaignDraftForBundle(bundleItem, 'execution');
      return;
    }

    if (action === 'test-campaigns') {
      const bundleId = getBundleId(bundleItem);
      if (!bundleId) {
        showError(copy.messages.missingBundleId, BUNDLE_TOAST_DURATION_MS);
        return;
      }
      navigate(getReportsPathWithFilters({ phase: 'test', bundleId }));
      return;
    }

    if (action === 'execution-campaigns') {
      const bundleId = getBundleId(bundleItem);
      if (!bundleId) {
        showError(copy.messages.missingBundleId, BUNDLE_TOAST_DURATION_MS);
        return;
      }
      navigate(getReportsPathWithFilters({ phase: 'execution', bundleId }));
      return;
    }

    // Fallback for unknown actions
    showInfo(copy.messages.actionTodo, BUNDLE_TOAST_DURATION_MS);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <section className='rounded-3xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm'>
            <div className='mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600' />
            <h2 className='mt-4 text-lg font-semibold text-gray-900'>
              {copy.states.loading}
            </h2>
            <p className='mt-2 text-sm text-gray-500'>
              {copy.states.loadingDescription}
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <section className='rounded-3xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm'>
            <h2 className='text-lg font-semibold text-red-700'>
              {error || copy.messages.detailLoadFailed}
            </h2>
            <div className='mt-5 flex items-center justify-center gap-3'>
              <Button variant='outline' onClick={handleBack}>
                {copy.detailPage.back}
              </Button>
              <Button onClick={retry}>{copy.states.retry}</Button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'>
        <BundleDetailHeader copy={copy} bundle={bundle} onBack={handleBack} />
        {isEditing ? (
          <BundleEditSection
            bundle={bundle}
            copy={copy}
            onCancel={handleEditCancel}
            onUpdated={handleEditSuccess}
          />
        ) : (
          <>
            <BundleDetailActionBar
              copy={copy}
              bundle={bundle}
              onAction={handleAction}
            />
            <BundleOverviewSection
              bundle={bundle}
              copy={copy}
              onEdit={() => setIsEditing(true)}
            />
            <BundleTagEvaluationSection bundle={bundle} copy={copy} />
            <BundleActionDataSection bundleId={bundle.id} copy={copy} />
            <BundleLinkDetailsSection bundle={bundle} copy={copy} />
            <BundleQuickAccessSection
              copy={copy}
              bundle={bundle}
              onAction={handleAction}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BundleDetailPage;
