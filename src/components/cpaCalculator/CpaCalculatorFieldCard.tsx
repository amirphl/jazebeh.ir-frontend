import React from 'react';
import { CpaFieldDefinition } from './types';

interface CpaCalculatorFieldCardProps {
  field: CpaFieldDefinition;
  value: string;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  unit?: string;
}

const accentClassByType: Record<
  NonNullable<CpaFieldDefinition['emphasized']>,
  string
> = {
  highlight: 'border-blue-200 bg-blue-50/70',
  danger: 'border-rose-200 bg-rose-50/80',
  success: 'border-emerald-200 bg-emerald-50/80',
};

const CpaCalculatorFieldCard: React.FC<CpaCalculatorFieldCardProps> = ({
  field,
  value,
  onFocus,
  onBlur,
  onChange,
  unit,
}) => {
  return (
    <div
      className={`cpa-calculator-field-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        field.emphasized ? accentClassByType[field.emphasized] : ''
      }`}
    >
      <label
        htmlFor={field.id}
        className='mb-2 block text-sm font-semibold text-slate-800'
      >
        {field.label}
      </label>
      <div className='relative'>
        <input
          id={field.id}
          type='text'
          inputMode='decimal'
          autoComplete='off'
          value={value}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={event => onChange(event.target.value)}
          className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-right text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        />
        {unit ? (
          <span className='pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs text-slate-400'>
            {unit}
          </span>
        ) : null}
      </div>
      <p className='mt-2 text-xs leading-6 text-slate-500'>{field.formula}</p>
    </div>
  );
};

export default CpaCalculatorFieldCard;
