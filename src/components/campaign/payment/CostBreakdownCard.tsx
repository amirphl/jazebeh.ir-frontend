import React from 'react';
import { Calculator } from 'lucide-react';
import Card from '../../ui/Card';

interface CostBreakdownCardProps {
  platform?: string;
  total?: number;
  messageCount?: number;
  costPerMessage?: number;
  linePriceFactor?: number;
  lastCalculation: number;
  isLoading: boolean;
  error: string | null;
  hasRequiredData: boolean;
  onRetry: () => void;
  currencyLabel: string;
  title: string;
  calculatingLabel: string;
  totalLabel: string;
  estimatedMessagesLabel: string;
  messagesLabel: string;
  errorTitle: string;
  retryLabel: string;
  calculatingMessage: string;
  completeDetailsMessage: string;
  noteLabel: string;
  costPerMessageLabel: string;
  linePriceFactorLabel: string;
}

const CostBreakdownCard: React.FC<CostBreakdownCardProps> = ({
  platform,
  total,
  messageCount,
  costPerMessage,
  linePriceFactor,
  lastCalculation,
  isLoading,
  error,
  hasRequiredData,
  onRetry,
  currencyLabel,
  title,
  calculatingLabel,
  totalLabel,
  estimatedMessagesLabel,
  messagesLabel,
  errorTitle,
  retryLabel,
  calculatingMessage,
  completeDetailsMessage,
  costPerMessageLabel,
  linePriceFactorLabel,
}) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ${currencyLabel}`;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='flex items-center justify-center space-x-2 text-gray-600 py-8'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600'></div>
          <span>{calculatingLabel}</span>
        </div>
      );
    }

    if (total !== undefined) {
      return (
        <>
          <div className='flex justify-between items-center p-4 payment-cost-total bg-primary-50 rounded-lg border border-primary-200'>
            <span className='text-primary-800 font-bold text-lg'>
              {totalLabel}
            </span>
            <span className='text-2xl font-bold text-primary-900'>
              {formatCurrency(total)}
            </span>
          </div>

          {messageCount !== undefined && (
            <div className='flex justify-between items-center p-3 payment-estimated-messages bg-blue-50 rounded-lg border border-blue-200'>
              <span className='text-blue-700 font-medium'>
                {estimatedMessagesLabel}
              </span>
              <span className='text-lg font-semibold text-blue-900'>
                {messageCount.toLocaleString()} {messagesLabel}
              </span>
            </div>
          )}

          {costPerMessage !== undefined && (
            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200'>
              <span className='text-gray-700 font-medium'>
                {costPerMessageLabel}
              </span>
              <span className='text-lg font-semibold text-gray-900'>
                {formatCurrency(costPerMessage)}
              </span>
            </div>
          )}

          {platform === 'sms' && (
            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200'>
              <span className='text-gray-700 font-medium'>
                {linePriceFactorLabel}
              </span>
              <span className='text-lg font-semibold text-gray-900'>
                {linePriceFactor !== undefined ? linePriceFactor : '-'}
              </span>
            </div>
          )}
        </>
      );
    }

    if (error) {
      return (
        <div className='text-center text-red-600 py-8'>
          <div className='text-lg font-medium mb-2'>{errorTitle}</div>
          <div className='text-sm'>{error}</div>
          <button
            onClick={onRetry}
            className='mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
          >
            {retryLabel}
          </button>
        </div>
      );
    }

    return (
      <div className='text-center text-gray-500 py-8'>
        {hasRequiredData ? calculatingMessage : completeDetailsMessage}
      </div>
    );
  };

  return (
    <Card>
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center gap-1'>
          <Calculator className='h-5 w-5 text-primary-600' />
          {title}
        </h3>

        <div className='space-y-4'>{renderContent()}</div>
      </div>
    </Card>
  );
};

export default CostBreakdownCard;
