import React, { useEffect } from 'react';
import { Receipt } from 'lucide-react';
import { useCampaign } from '../../../hooks/useCampaign';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuth } from '../../../hooks/useAuth';
import { apiService } from '../../../services/api';
import StepHeader from '../../ui/StepHeader';
import CostBreakdownCard from './CostBreakdownCard';
import WalletBalanceCard from './WalletBalanceCard';
import { useCostCalculation } from './useCostCalculation';
import { useWalletBalance } from './useWalletBalance';
import { paymentI18n } from './paymentTranslations';
import { useLineNumbers } from '../content/useLineNumbers';
import { hasUsableSmartTargetingTestPreview } from '../../../utils/smartTargetingTestPreview';
import Button from '../../ui/Button';
import type { ExecutionReservationState } from '../CampaignPaymentStep';

interface PaymentStepProps {
  executionReservationState?: ExecutionReservationState;
  executionReservationError?: string | null;
  onRetryExecutionReservation?: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  executionReservationState = 'idle',
  executionReservationError,
  onRetryExecutionReservation,
}) => {
  const { campaignData, updatePayment } = useCampaign();
  const { isAuthenticated, accessToken } = useAuth();
  const { language } = useLanguage();
  const t = paymentI18n[language as keyof typeof paymentI18n] || paymentI18n.en;
  const currencyLabel = language === 'en' ? 'Toman' : 'تومان';
  const platform = campaignData.segment.platform || 'sms';

  // Ensure API service has token
  useEffect(() => {
    if (accessToken) {
      apiService.setAccessToken(accessToken);
    }
  }, [accessToken]);

  // Custom hooks for business logic
  const {
    total,
    messageCount,
    lastCalculation,
    isLoading: isLoadingCosts,
    error: costError,
    calculateCosts,
  } = useCostCalculation(campaignData, updatePayment);

  const {
    walletBalance,
    error: balanceError,
    hasEnoughBalance,
    balanceChecked,
    getWalletBalance,
  } = useWalletBalance(accessToken, total, updatePayment);
  const { lineNumberOptions } = useLineNumbers(accessToken);

  // Trigger cost calculation
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        calculateCosts();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, calculateCosts]);

  // Trigger balance check
  useEffect(() => {
    if (isAuthenticated && !balanceChecked) {
      const timer = setTimeout(() => {
        getWalletBalance();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, balanceChecked, getWalletBalance]);

  const redirectToWallet = () => {
    window.location.href = '/dashboard/wallet';
  };

  const costPerMessage =
    total !== undefined && messageCount && messageCount > 0
      ? total / messageCount
      : undefined;
  const linePriceFactor =
    platform === 'sms'
      ? lineNumberOptions.find(
          opt => opt.value === campaignData.content.lineNumber
        )?.priceFactor
      : undefined;
  const audienceTargetingMethod =
    campaignData.segment.audienceTargetingMethod ??
    (campaignData.segment.targetAudienceExcelFileUuid != null
      ? 'excel'
      : 'standard');
  const isSmartTargetingTest =
    audienceTargetingMethod === 'smart_targeting' &&
    campaignData.segment.phase === 'test';
  const hasAudienceSelection =
    audienceTargetingMethod === 'smart_targeting'
      ? (campaignData.segment.selectedTagIds?.length ?? 0) > 0 &&
        campaignData.segment.selectedTagIds?.every(
          tagId => Number.isInteger(tagId) && tagId > 0
        ) &&
        (isSmartTargetingTest
          ? hasUsableSmartTargetingTestPreview(campaignData)
          : true)
      : audienceTargetingMethod === 'excel'
        ? typeof campaignData.segment.targetAudienceExcelFileUuid ===
            'string' &&
          campaignData.segment.targetAudienceExcelFileUuid.trim().length > 0
        : !!campaignData.segment.level1?.trim() &&
          (campaignData.segment.level2s?.length ?? 0) > 0 &&
          (campaignData.segment.level3s?.length ?? 0) > 0 &&
          (campaignData.segment.tags?.length ?? 0) > 0 &&
          (campaignData.segment.audienceGrades?.length ?? 0) > 0;
  const hasRequiredData = !!(
    hasAudienceSelection &&
    campaignData.content.text.trim() &&
    (isSmartTargetingTest
      ? Number.isSafeInteger(campaignData.budget.totalBudget) &&
        campaignData.budget.totalBudget >= 0
      : campaignData.budget.totalBudget > 0) &&
    (platform === 'sms'
      ? campaignData.content.lineNumber
      : campaignData.content.platformSettingsId)
  );
  const isSmartTargetingExecution =
    audienceTargetingMethod === 'smart_targeting' &&
    campaignData.segment.phase === 'execution';
  const reservationInProgress = [
    'saving',
    'requesting',
    'polling',
    'ready',
    'committing',
  ].includes(executionReservationState);
  const executionCalculationInProgress =
    isSmartTargetingExecution &&
    ['saving', 'requesting', 'polling'].includes(executionReservationState);
  const reservationStatus =
    executionReservationState === 'saving'
      ? t.reservationSaving
      : executionReservationState === 'requesting'
        ? t.reservationRequesting
        : executionReservationState === 'committing'
          ? t.reservationCommitting
          : executionReservationState === 'ready'
            ? t.reservationCommitting
            : executionReservationState === 'polling'
              ? t.reservationPolling
              : executionReservationState === 'failed'
                ? t.reservationFailed
                : null;

  return (
    <div className='space-y-8'>
      <StepHeader
        title={t.title}
        subtitle={''}
        icon={<Receipt className='h-6 w-6 text-primary-600' />}
      />

      <div className='space-y-6'>
        {executionCalculationInProgress ? (
          <section
            className='rounded-xl border-2 border-primary-200 bg-white p-8 text-center shadow-sm'
            aria-live='polite'
          >
            <div className='mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600'></div>
            <h2 className='text-lg font-semibold text-gray-900'>
              {t.reservationTitle}
            </h2>
            <p className='mt-2 text-sm text-gray-700'>
              {executionReservationState === 'polling'
                ? t.reservationPolling
                : executionReservationState === 'requesting'
                  ? t.reservationRequesting
                  : t.reservationSaving}
            </p>
          </section>
        ) : null}

        {isSmartTargetingExecution &&
        (reservationStatus || executionReservationError) ? (
          <section
            className='rounded-lg border border-primary-200 bg-primary-50 p-4'
            aria-live='polite'
          >
            <h2 className='font-medium text-gray-900'>{t.reservationTitle}</h2>
            {reservationStatus ? (
              <p className='mt-1 text-sm text-gray-700'>{reservationStatus}</p>
            ) : null}
            {executionReservationError ? (
              <p className='mt-2 text-sm text-red-700' role='alert'>
                {executionReservationError}
              </p>
            ) : null}
            {!reservationInProgress && onRetryExecutionReservation ? (
              <Button
                className='mt-3'
                variant='outline'
                onClick={onRetryExecutionReservation}
              >
                {t.reservationRetry}
              </Button>
            ) : null}
          </section>
        ) : null}

        {/* Cost Breakdown */}
        <CostBreakdownCard
          platform={platform}
          total={total}
          messageCount={messageCount}
          lastCalculation={lastCalculation}
          isLoading={isLoadingCosts}
          error={costError}
          hasRequiredData={hasRequiredData}
          onRetry={calculateCosts}
          currencyLabel={currencyLabel}
          title={t.costBreakdown}
          calculatingLabel={t.calculatingCosts}
          totalLabel={t.total}
          estimatedMessagesLabel={t.estimatedMessages}
          messagesLabel={t.messages}
          errorTitle={t.costCalculationError}
          retryLabel={t.retryCalculation}
          calculatingMessage={t.calculatingCostsMessage}
          completeDetailsMessage={t.completeDetailsMessage}
          noteLabel={t.note}
          costPerMessageLabel={t.costPerMessage}
          linePriceFactorLabel={t.linePriceFactor}
          costPerMessage={costPerMessage}
          linePriceFactor={linePriceFactor}
        />

        {/* Wallet Balance Check */}
        <WalletBalanceCard
          walletBalance={walletBalance}
          total={total}
          hasEnoughBalance={hasEnoughBalance}
          error={balanceError}
          onRedirectToWallet={redirectToWallet}
          currencyLabel={currencyLabel}
          title={t.walletBalance}
          availableBalanceLabel={t.availableBalance}
          campaignCostLabel={t.campaignCost}
          sufficientBalanceLabel={t.sufficientBalance}
          insufficientBalanceLabel={t.insufficientBalance}
          insufficientBalanceMessage={t.insufficientBalanceMessage}
          goToWalletLabel={t.goToWallet}
          balanceErrorTitle={t.balanceError}
          balanceErrorHelp={t.balanceErrorHelp}
          balanceNotAvailableLabel={t.balanceNotAvailable}
          helpText={''}
        />
      </div>
    </div>
  );
};

export default PaymentStep;
