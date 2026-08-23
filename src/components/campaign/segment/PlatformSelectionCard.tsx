import React from 'react';
import Card from '../../ui/Card';
import { CampaignPlatform } from '../../../types/campaign';

interface PlatformOption {
  value: CampaignPlatform;
  label: string;
}

interface PlatformSelectionCardProps {
  title: string;
  options: PlatformOption[];
  value: CampaignPlatform;
  onChange: (value: CampaignPlatform) => void;
}

const PlatformSelectionCard: React.FC<PlatformSelectionCardProps> = ({
  title,
  options,
  value,
  onChange,
}) => (
  <Card>
    <div className='space-y-4'>
      <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {options.map(option => (
          <label
            key={option.value}
            className={`flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer transition ${
              value === option.value
                ? 'campaign-platform-option-selected border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type='radio'
              name='campaign-platform'
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className='text-primary-600 focus:ring-primary-500'
            />
            <span className='text-sm text-gray-700'>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  </Card>
);

export default PlatformSelectionCard;
