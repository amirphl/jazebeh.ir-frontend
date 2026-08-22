import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { apiService } from '../../../services/api';
import {
  BundleActionFileItem,
  BundleActionSummary,
  BundleActionTagMetric,
} from '../../../types/bundle';
import { downloadBlob } from '../../wallet/utils/download';
import { BundlesCopy } from '../translations';

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const POLL_MS = 8000;
const pending = (status: BundleActionFileItem['status']) =>
  status === 'pending' ||
  status === 'processing' ||
  status === 'delete_pending';
const atr = (value: number | null | undefined, unavailable: string) =>
  typeof value === 'number' && Number.isFinite(value)
    ? `${(value * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
    : unavailable;
const count = (value: number | null | undefined, unavailable: string) =>
  typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString()
    : unavailable;

export const BUNDLE_ACTION_DATA_CHANGED = 'bundle-action-data-changed';
export const notifyBundleActionDataChanged = (bundleId: number) =>
  window.dispatchEvent(
    new CustomEvent(BUNDLE_ACTION_DATA_CHANGED, { detail: { bundleId } })
  );

const BundleActionDataSection: React.FC<{
  bundleId: number;
  copy: BundlesCopy;
}> = ({ bundleId, copy }) => {
  const labels = copy.detailPage.actionData;
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<BundleActionFileItem[]>([]);
  const [summary, setSummary] = useState<BundleActionSummary | null>(null);
  const [metrics, setMetrics] = useState<BundleActionTagMetric[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    total_pages: 1,
  });
  const [file, setFile] = useState<File | null>(null);
  const [actionLevel, setActionLevel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const pollInFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    apiService.setAccessToken(accessToken);
    const [fileResponse, summaryResponse, metricResponse] = await Promise.all([
      apiService.listBundleActionFiles(
        bundleId,
        { page, limit: 50 },
        controller.signal
      ),
      apiService.getBundleActionSummary(bundleId, controller.signal),
      apiService.getBundleActionTagMetrics(bundleId, controller.signal),
    ]);
    if (controller.signal.aborted) return;
    if (fileResponse.success && fileResponse.data) {
      setFiles(
        [...fileResponse.data.items]
          .filter(item => item.status !== 'deleted')
          .sort(
            (left, right) =>
              new Date(right.created_at).getTime() -
              new Date(left.created_at).getTime()
          )
      );
      setPagination(fileResponse.data.pagination);
    }
    if (summaryResponse.success && summaryResponse.data)
      setSummary(summaryResponse.data);
    if (metricResponse.success && metricResponse.data)
      setMetrics(metricResponse.data);
    if (
      !fileResponse.success &&
      !summaryResponse.success &&
      !metricResponse.success
    )
      setError(labels.loadFailed);
  }, [accessToken, bundleId, labels.loadFailed, page]);

  useEffect(() => {
    refresh();
    return () => controllerRef.current?.abort();
  }, [refresh]);
  useEffect(() => {
    if (!files.some(item => pending(item.status))) return;
    const timer = window.setInterval(async () => {
      if (pollInFlightRef.current) return;
      if (document.visibilityState === 'hidden') return;
      const active = files.filter(item => pending(item.status));
      if (!active.length) return;
      pollInFlightRef.current = true;
      try {
        const updates = await Promise.all(
          active.map(item => apiService.getBundleActionFile(bundleId, item.id))
        );
        let final = false;
        setFiles(current =>
          current
            .map(item => {
              const update = updates.find(
                response => response.success && response.data?.id === item.id
              )?.data;
              if (!update) return item;
              if (
                (update.status === 'processed' || update.status === 'deleted') &&
                update.status !== item.status
              )
                final = true;
              return update;
            })
            .filter(item => item.status !== 'deleted')
        );
        if (final) {
          await refresh();
          notifyBundleActionDataChanged(bundleId);
        }
      } finally {
        pollInFlightRef.current = false;
      }
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [bundleId, files, refresh]);

  const upload = async () => {
    if (!file) {
      setError(labels.invalidFile);
      return;
    }
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError(labels.invalidFile);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(labels.fileTooLarge);
      return;
    }
    if (!accessToken) return;
    setUploading(true);
    setError(null);
    apiService.setAccessToken(accessToken);
    const response = await apiService.uploadBundleActionFile(
      bundleId,
      file,
      actionLevel
    );
    setUploading(false);
    if (!response.success || !response.data) {
      setError(response.message || labels.uploadFailed);
      return;
    }
    setNotice(labels.processing);
    setFiles(current => [
      response.data!,
      ...current.filter(item => item.id !== response.data!.id),
    ]);
  };
  const downloadTemplate = async () => {
    setDownloading(true);
    const response =
      await apiService.downloadBundleActionFileTemplate(bundleId);
    setDownloading(false);
    if (!response.success || !response.blob) {
      setError(labels.templateFailed);
      return;
    }
    downloadBlob(response.blob, 'bundle_action_template.xlsx');
  };
  const remove = async (item: BundleActionFileItem) => {
    if (!window.confirm(labels.deleteConfirm)) return;
    const response = await apiService.deleteBundleActionFile(bundleId, item.id);
    if (!response.success) {
      setError(response.message || labels.deleteFailed);
      return;
    }
    setNotice(labels.deletePending);
    setFiles(current =>
      current.map(row =>
        row.id === item.id ? { ...row, status: 'delete_pending' } : row
      )
    );
  };
  const statuses = useMemo(
    () => ({
      pending: labels.processing,
      processing: labels.processing,
      processed: labels.processed,
      failed: labels.failed,
      delete_pending: labels.deletePending,
      deleted: labels.deleted,
    }),
    [labels]
  );
  const counters = (item: BundleActionFileItem) => [
    ['Total rows', item.total_row_count],
    ['Unique UIDs', item.unique_uid_count],
    ['Accepted / new UIDs', item.new_action_uid_count],
    ['Duplicates in file', item.duplicate_in_file_count],
    ['Duplicates in active files', item.duplicate_in_other_files_count],
    ['Invalid UIDs', item.invalid_uid_count],
    ['Outside Bundle', item.outside_bundle_count],
    ['Unassigned tag', item.unassigned_tag_count],
    ['Missing delivery', item.missing_delivery_count],
    ['Eligible action UIDs', item.eligible_action_uid_count],
  ];
  return (
    <section
      className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'
      aria-labelledby='bundle-action-data-title'
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h2
            id='bundle-action-data-title'
            className='text-xl font-semibold text-gray-900'
          >
            {labels.title}
          </h2>
          <p className='mt-1 text-sm text-gray-600'>{labels.description}</p>
        </div>
        <Button
          variant='outline'
          onClick={downloadTemplate}
          disabled={downloading}
        >
          {labels.downloadTemplate}
        </Button>
      </div>
      <div className='mt-5 grid gap-3 rounded-xl bg-gray-50 p-4 md:grid-cols-[1fr_1fr_auto]'>
        <input
          aria-label={labels.selectedFile}
          type='file'
          accept='.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          disabled={uploading}
          onChange={event => {
            setFile(event.target.files?.[0] || null);
            setError(null);
          }}
        />
        <input
          aria-label={labels.actionLevel}
          value={actionLevel}
          disabled={uploading}
          onChange={event => setActionLevel(event.target.value)}
          placeholder={labels.actionLevelPlaceholder}
          className='rounded-md border border-gray-300 px-3 py-2 text-sm'
        />
        <Button onClick={upload} disabled={uploading}>
          {uploading ? labels.uploading : labels.upload}
        </Button>
        {file ? (
          <p className='text-sm text-gray-600 md:col-span-3'>
            {labels.selectedFile}: {file.name}
          </p>
        ) : null}
      </div>
      <p className='mt-3 text-sm text-gray-600'>{labels.helper}</p>
      <p className='sr-only' aria-live='polite'>
        {notice}
      </p>
      {error ? (
        <p role='alert' className='mt-3 text-sm text-red-700'>
          {error}
        </p>
      ) : null}
      <div className='mt-6'>
        <h3 className='font-semibold text-gray-900'>{labels.summary}</h3>
        <div className='mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            [
              labels.actionCount,
              count(summary?.action_count, labels.unavailable),
            ],
            [
              labels.eligibleDelivered,
              count(summary?.eligible_delivered_count, labels.unavailable),
            ],
            [
              labels.averageAtr,
              atr(summary?.bundle_avg_atr, labels.unavailable),
            ],
            [
              labels.updatedAt,
              summary?.updated_at
                ? new Date(summary.updated_at).toLocaleString()
                : labels.unavailable,
            ],
          ].map(([name, value]) => (
            <div key={name} className='rounded-xl border border-gray-200 p-3'>
              <p className='text-xs text-gray-500'>{name}</p>
              <p className='mt-1 font-semibold text-gray-900'>{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className='mt-6 overflow-x-auto'>
        <h3 className='mb-3 font-semibold text-gray-900'>{labels.files}</h3>
        {files.length ? (
          <table className='w-full min-w-[760px] text-sm'>
            <thead>
              <tr className='border-b text-left text-gray-500'>
                {[
                  labels.filename,
                  labels.actionLevel,
                  labels.uploadedAt,
                  labels.status,
                  labels.accepted,
                  labels.details,
                  '',
                ].map(name => (
                  <th key={name} className='px-2 py-2'>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {files.map(item => (
                <React.Fragment key={item.id}>
                  <tr className='border-b'>
                    <td className='px-2 py-3'>{item.original_file_name}</td>
                    <td className='px-2 py-3'>
                      {item.action_level || labels.unavailable}
                    </td>
                    <td className='px-2 py-3'>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className='px-2 py-3'>{statuses[item.status]}</td>
                    <td className='px-2 py-3'>
                      {count(item.new_action_uid_count, labels.unavailable)}
                    </td>
                    <td className='px-2 py-3'>
                      <button
                        type='button'
                        onClick={() =>
                          setExpanded(expanded === item.id ? null : item.id)
                        }
                        aria-expanded={expanded === item.id}
                        className='text-primary-700 underline'
                      >
                        {expanded === item.id
                          ? labels.hideDetails
                          : labels.details}
                      </button>
                    </td>
                    <td className='px-2 py-3'>
                      {item.status === 'processed' ? (
                        <button
                          type='button'
                          onClick={() => remove(item)}
                          className='text-red-700 underline'
                        >
                          {labels.delete}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                  {expanded === item.id ? (
                    <tr className='border-b bg-gray-50'>
                      <td colSpan={7} className='p-3'>
                        <dl className='grid gap-2 sm:grid-cols-2'>
                          {counters(item).map(([name, value]) => (
                            <div key={name}>
                              <dt className='inline text-gray-500'>{name}: </dt>
                              <dd className='inline font-medium'>
                                {count(value as number, labels.unavailable)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                        {item.status === 'failed' && item.error_message ? (
                          <p className='mt-2 text-red-700'>
                            {item.error_message}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p className='text-sm text-gray-500'>{labels.noFiles}</p>
        )}
        {pagination.total_pages > 1 ? (
          <nav
            className='mt-4 flex items-center justify-end gap-3 text-sm'
            aria-label={labels.files}
          >
            <button
              type='button'
              onClick={() => setPage(current => Math.max(1, current - 1))}
              disabled={page <= 1}
              className='rounded border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {copy.pagination.previous}
            </button>
            <span>
              {pagination.page} / {pagination.total_pages}
            </span>
            <button
              type='button'
              onClick={() =>
                setPage(current =>
                  Math.min(pagination.total_pages, current + 1)
                )
              }
              disabled={page >= pagination.total_pages}
              className='rounded border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {copy.pagination.next}
            </button>
          </nav>
        ) : null}
      </div>
      <div className='mt-6 overflow-x-auto'>
        <h3 className='mb-3 font-semibold text-gray-900'>
          {labels.tagMetrics}
        </h3>
        <table className='w-full min-w-[520px] text-sm'>
          <thead>
            <tr className='border-b text-left text-gray-500'>
              {[labels.tagId, labels.testAtr, labels.overallAtr].map(name => (
                <th key={name} className='px-2 py-2'>
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map(metric => (
              <tr key={metric.tag_id} className='border-b'>
                <td className='px-2 py-3'>{metric.tag_id}</td>
                <td className='px-2 py-3'>
                  {atr(metric.test_phase_avg_atr, labels.unavailable)} (
                  {count(metric.test_action_count, labels.unavailable)}/
                  {count(
                    metric.test_eligible_delivered_count,
                    labels.unavailable
                  )}
                  )
                </td>
                <td className='px-2 py-3'>
                  {atr(metric.overall_avg_atr, labels.unavailable)} (
                  {count(metric.overall_action_count, labels.unavailable)}/
                  {count(
                    metric.overall_eligible_delivered_count,
                    labels.unavailable
                  )}
                  )
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
export default BundleActionDataSection;
