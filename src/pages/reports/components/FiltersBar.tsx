import React from 'react';
import DatePicker from 'react-multi-date-picker';
import DateObject from 'react-date-object';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import {
  CampaignPlatform,
  ListSMSCampaignsParams,
} from '../../../types/campaign';
import { ReportsCopy } from '../translations';
import { useBundles } from '../../../components/campaign/content/useBundles';

export type ReportsOrderBy = NonNullable<ListSMSCampaignsParams['orderby']>;
export type ReportsPhaseFilter = ListSMSCampaignsParams['phase'] | '';

interface FiltersBarProps {
  language: 'en' | 'fa';
  campaignTitleInput: string;
  onCampaignTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  orderBy: ReportsOrderBy;
  onOrderChange: (order: ReportsOrderBy) => void;
  bundleIdFilter: number | null;
  onBundleIdChange: (id: number | null) => void;
  phaseFilter: ReportsPhaseFilter;
  onPhaseChange: (phase: ReportsPhaseFilter) => void;
  platformFilter: CampaignPlatform | '';
  onPlatformChange: (platform: CampaignPlatform | '') => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  bulkHideMode: boolean;
  onBulkHideModeChange: (enabled: boolean) => void;
  bulkUnhideMode: boolean;
  onBulkUnhideModeChange: (enabled: boolean) => void;
  bulkClickReportMode: boolean;
  onBulkClickReportModeChange: (enabled: boolean) => void;
  showHiddenCampaigns: boolean;
  onShowHiddenCampaignsChange: (enabled: boolean) => void;
  accessToken: string | null;
  copy: ReportsCopy;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  language,
  campaignTitleInput,
  onCampaignTitleChange,
  orderBy,
  onOrderChange,
  bundleIdFilter,
  onBundleIdChange,
  phaseFilter,
  onPhaseChange,
  platformFilter,
  onPlatformChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  bulkHideMode,
  onBulkHideModeChange,
  bulkUnhideMode,
  onBulkUnhideModeChange,
  bulkClickReportMode,
  onBulkClickReportModeChange,
  showHiddenCampaigns,
  onShowHiddenCampaignsChange,
  accessToken,
  copy,
}) => {
  const { bundleOptions, isLoading: bundlesLoading } = useBundles(accessToken);
  const isFa = language === 'fa';

  const selectCls =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500';
  const fieldCls = 'flex min-w-[170px] flex-1 flex-col gap-1';
  const dateValueToPickerValue = (value: string) =>
    value ? new Date(value) : '';

  const toUtcIsoString = (value: DateObject) => {
    const normalizedValue = new DateObject({
      year: value.year,
      month: value.month.number,
      day: value.day,
      hour: value.hour,
      minute: value.minute,
      second: value.second,
      millisecond: value.millisecond,
      calendar: isFa ? persian : gregorian,
      locale: isFa ? persian_fa : gregorian_en,
    });

    if (isFa) {
      normalizedValue.convert(gregorian, gregorian_en);
    }

    const localDate = normalizedValue.toDate();
    if (Number.isNaN(localDate.getTime())) {
      throw new Error('Invalid report date filter');
    }
    return localDate.toISOString();
  };

  const handleDateChange =
    (onChange: (value: string) => void) => (value: DateObject | null) => {
      if (!value) {
        onChange('');
        return;
      }

      try {
        onChange(toUtcIsoString(value));
      } catch {
        onChange('');
      }
    };

  return (
    <div className='mb-6 space-y-4'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>{copy.title}</h1>
      </div>

      <div className='flex flex-wrap items-end gap-3'>
        <div className={fieldCls}>
          <label className='text-sm font-medium text-gray-700'>
            {copy.filterByBundle}
          </label>
          <select
            value={bundleIdFilter ?? ''}
            onChange={e =>
              onBundleIdChange(e.target.value ? Number(e.target.value) : null)
            }
            className={selectCls}
            disabled={bundlesLoading}
          >
            <option value=''>
              {bundlesLoading ? copy.bundleLoading : copy.bundleAll}
            </option>
            {bundleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={fieldCls}>
          <label className='text-sm font-medium text-gray-700'>
            {copy.filterByCampaign}
          </label>
          <input
            type='text'
            value={campaignTitleInput}
            onChange={onCampaignTitleChange}
            placeholder={copy.campaignFilterPlaceholder}
            className={selectCls}
          />
        </div>

        <div className={fieldCls}>
          <label className='text-sm font-medium text-gray-700'>
            {copy.filterByPhase}
          </label>
          <select
            value={phaseFilter}
            onChange={e => onPhaseChange(e.target.value as ReportsPhaseFilter)}
            className={selectCls}
          >
            <option value=''>{copy.phaseAll}</option>
            <option value='execution'>{copy.phaseExecution}</option>
            <option value='test'>{copy.phaseTest}</option>
          </select>
        </div>

        <div className={fieldCls}>
          <label className='text-sm font-medium text-gray-700'>
            {copy.filterByPlatform}
          </label>
          <select
            value={platformFilter}
            onChange={e =>
              onPlatformChange((e.target.value || '') as CampaignPlatform | '')
            }
            className={selectCls}
          >
            <option value=''>{copy.platformAll}</option>
            <option value='sms'>{copy.platforms.sms}</option>
            <option value='rubika'>{copy.platforms.rubika}</option>
            <option value='bale'>{copy.platforms.bale}</option>
            <option value='splus'>{copy.platforms.splus}</option>
          </select>
        </div>

        <div className={fieldCls}>
          <label className='text-sm font-medium text-gray-700'>
            {copy.filterByStartDate}
          </label>
          <DatePicker
            calendar={isFa ? persian : gregorian}
            locale={isFa ? persian_fa : gregorian_en}
            plugins={[
              <TimePicker
                hideSeconds={false}
                className='campaign-time-picker-24h'
              />,
            ]}
            value={dateValueToPickerValue(startDate)}
            onChange={handleDateChange(onStartDateChange)}
            format='YYYY/MM/DD HH:mm:ss'
            inputClass={selectCls}
            containerClassName='campaign-date-picker'
            placeholder={copy.startDatePlaceholder}
          />
        </div>

        <div className={fieldCls}>
          <label className='text-sm font-medium text-gray-700'>
            {copy.filterByEndDate}
          </label>
          <DatePicker
            calendar={isFa ? persian : gregorian}
            locale={isFa ? persian_fa : gregorian_en}
            plugins={[
              <TimePicker
                hideSeconds={false}
                className='campaign-time-picker-24h'
              />,
            ]}
            value={dateValueToPickerValue(endDate)}
            onChange={handleDateChange(onEndDateChange)}
            format='YYYY/MM/DD HH:mm:ss'
            inputClass={selectCls}
            containerClassName='campaign-date-picker'
            placeholder={copy.endDatePlaceholder}
          />
        </div>

        <div className={fieldCls}>
          <label className='text-sm font-medium text-gray-700'>
            {copy.orderBy}
          </label>
          <select
            value={orderBy}
            onChange={e => onOrderChange(e.target.value as ReportsOrderBy)}
            className={selectCls}
          >
            <option value='newest'>{copy.orderOptions.newest}</option>
            <option value='oldest'>{copy.orderOptions.oldest}</option>
            <option value='phase_test_first'>
              {copy.orderOptions.phaseTestFirst}
            </option>
            <option value='phase_execution_first'>
              {copy.orderOptions.phaseExecutionFirst}
            </option>
            <option value='highest_click_rate'>
              {copy.orderOptions.highestClickRate}
            </option>
            <option value='lowest_click_rate'>
              {copy.orderOptions.lowestClickRate}
            </option>
          </select>
        </div>
      </div>

      <div className='flex flex-col gap-2 sm:flex-row'>
        <label className='inline-flex flex-1 items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm'>
          <input
            type='checkbox'
            checked={bulkHideMode}
            onChange={e => {
              onBulkHideModeChange(e.target.checked);
              if (e.target.checked) {
                onBulkUnhideModeChange(false);
                onBulkClickReportModeChange(false);
              }
            }}
            className='mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500'
          />
          <span className='flex flex-col gap-1'>
            <span className='text-sm font-medium text-gray-900'>
              {copy.bulkHide.modeToggle}
            </span>
            <span className='text-sm text-gray-600'>
              {copy.bulkHide.modeHint}
            </span>
          </span>
        </label>

        {bundleIdFilter !== null ? (
          <label className='inline-flex flex-1 items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm'>
            <input
              type='checkbox'
              checked={bulkClickReportMode}
              onChange={e => {
                onBulkClickReportModeChange(e.target.checked);
                if (e.target.checked) {
                  onBulkHideModeChange(false);
                  onBulkUnhideModeChange(false);
                }
              }}
              className='mt-1 h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500'
            />
            <span className='flex flex-col gap-1'>
              <span className='text-sm font-medium text-gray-900'>
                {copy.bulkClickReport.modeToggle}
              </span>
              <span className='text-sm text-gray-600'>
                {copy.bulkClickReport.modeHint}
              </span>
            </span>
          </label>
        ) : null}

        <label className='inline-flex flex-1 items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm'>
          <input
            type='checkbox'
            checked={bulkUnhideMode}
            onChange={e => {
              onBulkUnhideModeChange(e.target.checked);
              if (e.target.checked) {
                onBulkHideModeChange(false);
                onBulkClickReportModeChange(false);
              }
            }}
            className='mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500'
          />
          <span className='flex flex-col gap-1'>
            <span className='text-sm font-medium text-gray-900'>
              {copy.bulkUnhide.modeToggle}
            </span>
            <span className='text-sm text-gray-600'>
              {copy.bulkUnhide.modeHint}
            </span>
          </span>
        </label>

        <label className='inline-flex flex-1 items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm'>
          <input
            type='checkbox'
            checked={showHiddenCampaigns}
            onChange={e => onShowHiddenCampaignsChange(e.target.checked)}
            className='mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500'
          />
          <span className='flex flex-col gap-1'>
            <span className='text-sm font-medium text-gray-900'>
              {copy.showHiddenCampaigns.toggle}
            </span>
            <span className='text-sm text-gray-600'>
              {copy.showHiddenCampaigns.hint}
            </span>
          </span>
        </label>
      </div>
    </div>
  );
};

export default FiltersBar;
