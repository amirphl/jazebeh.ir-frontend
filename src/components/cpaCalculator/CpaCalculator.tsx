import React, { useMemo, useState } from 'react';
import CpaCalculatorFieldCard from './CpaCalculatorFieldCard';
import { cpaCalculatorTranslations } from './translations';
import {
  CpaCalculatorTranslations,
  CpaFieldDefinition,
  CpaFieldId,
} from './types';
import {
  calculateCpaValues,
  createDefaultCpaValues,
  normalizeDigits,
} from './utils';

export interface CpaCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  translations?: CpaCalculatorTranslations;
  dir?: 'rtl' | 'ltr';
}

const CpaCalculatorModal: React.FC<CpaCalculatorProps> = ({
  isOpen,
  onClose,
  translations = cpaCalculatorTranslations.en,
  dir = 'ltr',
}) => {
  const [values, setValues] = useState(createDefaultCpaValues);
  const [supplementActive, setSupplementActive] = useState(false);

  const unitByType = {
    int: undefined,
    percent: translations.unitPercent,
    money: translations.unitToman,
  } as const;

  const fieldSections = useMemo(() => {
    const primary: CpaFieldDefinition[] = [
      {
        id: 'delivered',
        type: 'int',
        ...translations.primaryFields.delivered,
      },
      {
        id: 'conversions',
        type: 'int',
        ...translations.primaryFields.conversions,
      },
      {
        id: 'conversionRate',
        type: 'percent',
        ...translations.primaryFields.conversionRate,
      },
      {
        id: 'sendCost',
        type: 'money',
        ...translations.primaryFields.sendCost,
      },
    ];

    const supplement: CpaFieldDefinition[] = [
      {
        id: 'mainClicks',
        type: 'int',
        ...translations.supplementFields.mainClicks,
      },
      {
        id: 'clickRate',
        type: 'percent',
        ...translations.supplementFields.clickRate,
      },
      {
        id: 'suppDelivered',
        type: 'int',
        ...translations.supplementFields.suppDelivered,
      },
      {
        id: 'suppConversions',
        type: 'int',
        ...translations.supplementFields.suppConversions,
      },
      {
        id: 'suppRate',
        type: 'percent',
        ...translations.supplementFields.suppRate,
      },
      {
        id: 'suppSendCost',
        type: 'money',
        ...translations.supplementFields.suppSendCost,
      },
    ];

    const pricing: CpaFieldDefinition[] = [
      {
        id: 'capacity',
        type: 'int',
        ...translations.pricingFields.capacity,
      },
      {
        id: 'offerPrice',
        type: 'money',
        ...translations.pricingFields.offerPrice,
      },
      {
        id: 'breakEven',
        type: 'money',
        ...translations.pricingFields.breakEven,
      },
    ];

    const results: CpaFieldDefinition[] = [
      {
        id: 'possibleConversions',
        type: 'int',
        emphasized: 'highlight',
        ...translations.resultFields.possibleConversions,
      },
      {
        id: 'revenue',
        type: 'money',
        ...translations.resultFields.revenue,
      },
      {
        id: 'totalCost',
        type: 'money',
        emphasized: 'danger',
        ...translations.resultFields.totalCost,
      },
      {
        id: 'profit',
        type: 'money',
        emphasized: 'success',
        ...translations.resultFields.profit,
      },
      {
        id: 'profitPercent',
        type: 'percent',
        emphasized: 'success',
        ...translations.resultFields.profitPercent,
      },
    ];

    return { primary, supplement, pricing, results };
  }, [translations]);

  if (!isOpen) return null;

  const recalculate = (
    nextValues: typeof values,
    nextActiveId: CpaFieldId | null
  ) => {
    setValues(calculateCpaValues(nextValues, nextActiveId, supplementActive));
  };

  const handleValueChange = (fieldId: CpaFieldId, rawValue: string) => {
    const normalized = normalizeDigits(rawValue);
    const sanitized =
      normalized === '' || normalized === '-' || normalized === '.'
        ? normalized
        : Number.isFinite(Number(normalized))
          ? normalized
          : values[fieldId];

    const nextValues = { ...values, [fieldId]: sanitized };
    recalculate(nextValues, fieldId);
  };

  const handleFieldBlur = (fieldId: CpaFieldId) => {
    setValues(current =>
      calculateCpaValues(
        {
          ...current,
          [fieldId]:
            current[fieldId] === '' ||
            current[fieldId] === '-' ||
            current[fieldId] === '.'
              ? '0'
              : current[fieldId],
        },
        null,
        supplementActive
      )
    );
  };

  const handleReset = () => {
    setSupplementActive(false);
    setValues(calculateCpaValues(createDefaultCpaValues(), null, false));
  };

  const toggleSupplement = () => {
    const nextSupplementActive = !supplementActive;
    setSupplementActive(nextSupplementActive);
    setValues(current => {
      const nextValues = { ...current };
      if (!nextSupplementActive) {
        nextValues.mainClicks = '0';
        nextValues.clickRate = '0';
        nextValues.suppDelivered = '0';
        nextValues.suppConversions = '0';
        nextValues.suppRate = '0';
        nextValues.suppSendCost = '0';
      }
      return calculateCpaValues(nextValues, null, nextSupplementActive);
    });
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-slate-950/50' onClick={onClose} />
      <div
        dir={dir}
        className='cpa-calculator-modal relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl'
      >
        <div className='max-h-[92vh] overflow-y-auto'>
          <section className='cpa-calculator-header relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(244,63,94,0.12),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-6 py-8 sm:px-8'>
            <div className='absolute inset-x-0 bottom-0 h-24 bg-gradient-to-r from-blue-100/40 via-transparent to-rose-100/40' />
            <div className='relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
              <div className='space-y-3'>
                <div className='cpa-calculator-title-badge inline-flex rounded-full border border-blue-200 bg-white/90 px-4 py-1 text-xs font-semibold text-blue-700 shadow-sm'>
                  {translations.title}
                </div>
                <div>
                  <h3 className='text-2xl font-bold text-slate-900 sm:text-3xl'>
                    {translations.heroTitle}
                  </h3>
                  <p className='mt-3 max-w-3xl text-sm leading-7 text-slate-600'>
                    {translations.heroSubtitle}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3 self-start'>
                <div className='cpa-calculator-hero-badge rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 shadow-sm'>
                  {translations.heroBadge}
                </div>
                <button
                  type='button'
                  onClick={onClose}
                  className='rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900'
                >
                  {translations.close}
                </button>
              </div>
            </div>
          </section>

          <div className='cpa-calculator-content space-y-6 bg-slate-50/70 p-6 sm:p-8'>
            <section className='cpa-calculator-section rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
              <h4 className='mb-5 text-base font-bold text-slate-800'>
                {translations.mainSendSectionTitle}
              </h4>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='cpa-calculator-send-card rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                  <label className='mb-2 block text-sm font-semibold text-slate-800'>
                    {translations.mainSendLabel}
                  </label>
                  <select className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'>
                    <option>{translations.manualOption}</option>
                  </select>
                  <p className='mt-2 text-xs leading-6 text-slate-500'>
                    {translations.mainSendFormula}
                  </p>
                </div>
                <div className='cpa-calculator-send-card rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                  <label className='mb-2 block text-sm font-semibold text-slate-800'>
                    {translations.supplementSendLabel}
                  </label>
                  <select className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'>
                    <option>{translations.manualOption}</option>
                  </select>
                  <p className='mt-2 text-xs leading-6 text-slate-500'>
                    {translations.supplementSendFormula}
                  </p>
                </div>
              </div>
            </section>

            <section className='cpa-calculator-section rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
              <h4 className='mb-5 text-base font-bold text-slate-800'>
                {translations.primarySectionTitle}
              </h4>
              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                {fieldSections.primary.map(field => (
                  <CpaCalculatorFieldCard
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    unit={unitByType[field.type]}
                    onFocus={() => undefined}
                    onBlur={() => handleFieldBlur(field.id)}
                    onChange={value => handleValueChange(field.id, value)}
                  />
                ))}
              </div>
              <div className='mt-5'>
                <button
                  type='button'
                  onClick={toggleSupplement}
                  className='rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5'
                >
                  {supplementActive
                    ? translations.supplementToggleOff
                    : translations.supplementToggleOn}
                </button>
              </div>

              {supplementActive ? (
                <div className='mt-6 rounded-[24px] border border-dashed border-blue-200 bg-blue-50/50 p-5'>
                  <h5 className='mb-4 text-sm font-bold text-slate-800'>
                    {translations.supplementSectionTitle}
                  </h5>
                  <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                    {fieldSections.supplement.map(field => (
                      <CpaCalculatorFieldCard
                        key={field.id}
                        field={field}
                        value={values[field.id]}
                        unit={unitByType[field.type]}
                        onFocus={() => undefined}
                        onBlur={() => handleFieldBlur(field.id)}
                        onChange={value => handleValueChange(field.id, value)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section className='cpa-calculator-section rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
              <h4 className='mb-5 text-base font-bold text-slate-800'>
                {translations.pricingSectionTitle}
              </h4>
              <div className='grid gap-4 md:grid-cols-3'>
                {fieldSections.pricing.map(field => (
                  <CpaCalculatorFieldCard
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    unit={unitByType[field.type]}
                    onFocus={() => undefined}
                    onBlur={() => handleFieldBlur(field.id)}
                    onChange={value => handleValueChange(field.id, value)}
                  />
                ))}
              </div>

              <h4 className='mb-5 mt-8 text-base font-bold text-slate-800'>
                {translations.resultSectionTitle}
              </h4>
              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
                {fieldSections.results.map(field => (
                  <CpaCalculatorFieldCard
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    unit={unitByType[field.type]}
                    onFocus={() => undefined}
                    onBlur={() => handleFieldBlur(field.id)}
                    onChange={value => handleValueChange(field.id, value)}
                  />
                ))}
              </div>
              <div className='mt-6 flex justify-end'>
                <button
                  type='button'
                  onClick={handleReset}
                  className='rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900'
                >
                  {translations.reset}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CpaCalculatorModal;
export { cpaCalculatorTranslations };
