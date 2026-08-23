import React, { useMemo } from 'react';
import { AudienceGrade } from '../../../types/campaign';
import { normalizeSmartTargetingScoreClasses } from '../../../utils/smartTargetingCapacity';

export interface SmartTargetingScoreClassCopy {
  scoreClassesLabel: string;
  classA: string;
  classAMeaning: string;
  classB: string;
  classBMeaning: string;
  classC: string;
  classCMeaning: string;
  allClasses: string;
}

interface SmartTargetingScoreClassSelectorProps {
  value: AudienceGrade[];
  onChange: (value: AudienceGrade[]) => void;
  copy: SmartTargetingScoreClassCopy;
  required?: boolean;
  requiredMessage?: string;
}

const SCORE_CLASSES: AudienceGrade[] = ['A', 'B', 'C'];

const SmartTargetingScoreClassSelector: React.FC<
  SmartTargetingScoreClassSelectorProps
> = ({ value, onChange, copy, required = false, requiredMessage }) => {
  const normalizedValue = useMemo(
    () => normalizeSmartTargetingScoreClasses(value),
    [value]
  );
  const classCopy: Record<AudienceGrade, { label: string; meaning: string }> = {
    A: { label: copy.classA, meaning: copy.classAMeaning },
    B: { label: copy.classB, meaning: copy.classBMeaning },
    C: { label: copy.classC, meaning: copy.classCMeaning },
  };

  const handleToggle = (scoreClass: AudienceGrade) => {
    onChange(
      normalizedValue.includes(scoreClass)
        ? normalizedValue.filter(item => item !== scoreClass)
        : normalizeSmartTargetingScoreClasses([...normalizedValue, scoreClass])
    );
  };

  return (
    <fieldset>
      <legend className='text-sm font-medium text-gray-900'>
        {copy.scoreClassesLabel}{' '}
        {required ? <span className='text-red-600'>*</span> : null}
      </legend>
      <div className='mt-3 grid gap-3 md:grid-cols-3'>
        {SCORE_CLASSES.map(scoreClass => (
          <label
            key={scoreClass}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              normalizedValue.includes(scoreClass)
                ? 'smart-targeting-score-class-selected border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type='checkbox'
              checked={normalizedValue.includes(scoreClass)}
              onChange={() => handleToggle(scoreClass)}
              className='mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500'
            />
            <span>
              <span className='block text-sm font-medium text-gray-900'>
                {classCopy[scoreClass].label}
              </span>
              <span className='mt-0.5 block text-xs text-gray-500'>
                {classCopy[scoreClass].meaning}
              </span>
            </span>
          </label>
        ))}
      </div>
      {normalizedValue.length === 0 ? (
        <p
          className={`mt-2 text-xs ${required ? 'text-red-600' : 'text-gray-600'}`}
          role={required ? 'alert' : undefined}
        >
          {required ? requiredMessage || copy.allClasses : copy.allClasses}
        </p>
      ) : null}
    </fieldset>
  );
};

export default SmartTargetingScoreClassSelector;
