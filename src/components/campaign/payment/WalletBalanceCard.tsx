import React from 'react';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface WalletBalanceCardProps {
  walletBalance?: number;
  total?: number;
  hasEnoughBalance?: boolean;
  error: string | null;
  onRedirectToWallet: () => void;
  currencyLabel: string;
  title: string;
  availableBalanceLabel: string;
  campaignCostLabel: string;
  sufficientBalanceLabel: string;
  insufficientBalanceLabel: string;
  insufficientBalanceMessage: string;
  goToWalletLabel: string;
  balanceErrorTitle: string;
  balanceErrorHelp: string;
  balanceNotAvailableLabel: string;
  helpText: string;
}

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  walletBalance,
  total,
  hasEnoughBalance,
  error,
  onRedirectToWallet,
  currencyLabel,
  title,
  availableBalanceLabel,
  campaignCostLabel,
  sufficientBalanceLabel,
  insufficientBalanceLabel,
  insufficientBalanceMessage,
  goToWalletLabel,
  balanceErrorTitle,
  balanceErrorHelp,
  balanceNotAvailableLabel,
  helpText,
}) => {
  const renderContent = () => {
    if (walletBalance !== undefined) {
      return (
        <div className='space-y-3'>
          {/* Available Balance */}
          <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
            <span className='text-gray-700 font-medium'>
              {availableBalanceLabel}
            </span>
            <span className='text-lg font-semibold text-gray-900'>
              {walletBalance.toLocaleString()} {currencyLabel}
            </span>
          </div>

          {/* Campaign Cost */}
          {total !== undefined && (
            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
              <span className='text-gray-700 font-medium'>
                {campaignCostLabel}
              </span>
              <span className='text-lg font-semibold text-gray-900'>
                {total.toLocaleString()} {currencyLabel}
              </span>
            </div>
          )}

          {/* Balance Status */}
          {hasEnoughBalance !== undefined && (
            <div
              className={`p-4 rounded-lg border ${
                hasEnoughBalance
                  ? 'payment-balance-status payment-balance-sufficient bg-green-50 border-green-200'
                  : 'payment-balance-status payment-balance-insufficient bg-red-50 border-red-200'
              }`}
            >
              <div className='flex items-center space-x-2 mb-2'>
                {hasEnoughBalance ? (
                  <>
                    <CheckCircle className='w-5 h-5 text-green-500' />
                    <span className='text-sm font-medium text-green-800'>
                      {sufficientBalanceLabel}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className='w-5 h-5 text-red-500' />
                    <span className='text-sm font-medium text-red-800'>
                      {insufficientBalanceLabel}
                    </span>
                  </>
                )}
              </div>

              {!hasEnoughBalance && (
                <div className='space-y-3'>
                  <p className='text-sm text-red-700'>
                    {insufficientBalanceMessage}
                  </p>
                  <Button
                    onClick={onRedirectToWallet}
                    variant='primary'
                    className='w-full'
                  >
                    <Wallet className='w-4 h-4 mr-3' />
                    {goToWalletLabel}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className='text-center text-red-600 py-8'>
          <div className='text-lg font-medium mb-2'>{balanceErrorTitle}</div>
          <div className='text-sm'>{error}</div>
          <p className='text-xs text-gray-500 mt-2'>{balanceErrorHelp}</p>
        </div>
      );
    }

    return (
      <div className='text-center text-gray-500 py-8'>
        {balanceNotAvailableLabel}
      </div>
    );
  };

  return (
    <Card>
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center gap-1'>
          <Wallet className='h-5 w-5 text-primary-600' />
          {title}
        </h3>

        <div className='space-y-4'>{renderContent()}</div>

        <div className='text-sm text-gray-500'>{helpText}</div>
      </div>
    </Card>
  );
};

export default WalletBalanceCard;
