import React from 'react';
import { ReportsCopy } from '../translations';

interface BulkClickReportActionBarProps {
  copy: ReportsCopy;
  selectedCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

const BulkClickReportActionBar: React.FC<BulkClickReportActionBarProps> = ({
  copy,
  selectedCount,
  isSubmitting,
  onSubmit,
}) => (
  <div className='mt-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
    <div className='text-sm text-gray-700'>
      {copy.bulkClickReport.selectionCount(selectedCount)}
    </div>

    <button
      type='button'
      onClick={onSubmit}
      disabled={isSubmitting || selectedCount === 0}
      className='inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
    >
      {isSubmitting
        ? copy.bulkClickReport.submitting
        : copy.bulkClickReport.button}
    </button>
  </div>
);

export default BulkClickReportActionBar;
