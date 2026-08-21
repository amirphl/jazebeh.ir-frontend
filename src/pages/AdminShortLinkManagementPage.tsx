import React, { useEffect, useState } from 'react';
import { AdminShortLinkUploadJobDTO } from '../types/admin';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigation } from '../contexts/NavigationContext';
import { ROUTES } from '../config/routes';
import adminApi from '../services/adminApi';
import { getApiUrl } from '../config/environment';

const AdminShortLinkManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { navigate } = useNavigation();

  const [selectedDomain, setSelectedDomain] =
    useState<string>('https://jo1n.ir');
  const [file, setFile] = useState<File | null>(null);
  const [scenarioName, setScenarioName] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );
  const [uploadedScenarioId, setUploadedScenarioId] = useState<number | null>(
    null
  );
  const [uploadJob, setUploadJob] = useState<AdminShortLinkUploadJobDTO | null>(
    null
  );
  const [scenarioId, setScenarioId] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadMessage, setDownloadMessage] = useState<string>('');
  const [downloadType, setDownloadType] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [scenarioIdClicks, setScenarioIdClicks] = useState<string>('');
  const [downloadingClicks, setDownloadingClicks] = useState<boolean>(false);
  const [downloadMessageClicks, setDownloadMessageClicks] =
    useState<string>('');
  const [downloadTypeClicks, setDownloadTypeClicks] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [scenarioFromRange, setScenarioFromRange] = useState<string>('');
  const [scenarioToRange, setScenarioToRange] = useState<string>('');
  const [downloadingRange, setDownloadingRange] = useState<boolean>(false);
  const [downloadMessageRange, setDownloadMessageRange] = useState<string>('');
  const [downloadTypeRange, setDownloadTypeRange] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [scenarioNameRegex, setScenarioNameRegex] = useState<string>('');
  const [downloadingByName, setDownloadingByName] = useState<boolean>(false);
  const [downloadByNameMessage, setDownloadByNameMessage] =
    useState<string>('');
  const [downloadByNameType, setDownloadByNameType] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const uploadJobId = uploadJob?.id;
  const uploadJobStatus = uploadJob?.status;

  useEffect(() => {
    if (
      !uploadJobId ||
      (uploadJobStatus && ['completed', 'failed'].includes(uploadJobStatus))
    ) {
      return;
    }

    let cancelled = false;
    const poll = async () => {
      const resp = await adminApi.getShortLinkUploadStatus(uploadJobId);
      if (cancelled) return;
      if (resp.success && resp.data) {
        setUploadJob(resp.data);
        if (resp.data.status === 'completed') {
          setStatusMessage(t('adminShortLinks.messages.completed'));
          setStatusType('success');
        } else if (resp.data.status === 'failed') {
          setStatusMessage(
            resp.data.last_error ||
              t('adminShortLinks.messages.processingFailed')
          );
          setStatusType('error');
        }
      } else {
        setStatusMessage(
          resp.message || t('adminShortLinks.messages.statusError')
        );
        setStatusType('error');
      }
    };

    const timer = window.setInterval(poll, 2500);
    poll();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [t, uploadJobId, uploadJobStatus]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    setStatusMessage('');
    setStatusType('idle');
    setUploadedScenarioId(null);
    setUploadJob(null);

    if (!file) {
      setStatusMessage(t('adminShortLinks.messages.validationFileRequired'));
      setStatusType('error');
      return;
    }

    if (!scenarioName.trim()) {
      setStatusMessage(
        t('adminShortLinks.messages.validationScenarioNameRequired')
      );
      setStatusType('error');
      return;
    }

    try {
      setSubmitting(true);
      const resp = await adminApi.uploadShortLinksCSV(
        file,
        selectedDomain,
        scenarioName
      );
      if (resp.success && resp.data) {
        setUploadedScenarioId(resp.data.scenario_id);
        setUploadJob(resp.data.job);
        setStatusMessage(
          resp.message || t('adminShortLinks.messages.uploadStarted')
        );
        setStatusType('success');
      } else {
        setStatusMessage(resp.message || t('adminShortLinks.messages.error'));
        setStatusType('error');
      }
    } catch (err) {
      setStatusMessage(t('adminShortLinks.messages.error'));
      setStatusType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const onDownload = async () => {
    setDownloadMessage('');
    setDownloadType('idle');

    const idNum = parseInt(scenarioId, 10);
    if (!idNum || idNum <= 0) {
      setDownloadMessage(t('adminShortLinks.download.error'));
      setDownloadType('error');
      return;
    }

    try {
      setDownloading(true);
      const token = adminApi.getAccessToken();
      const url = getApiUrl('/admin/short-links/download');
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/csv, application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ scenario_id: idNum }),
        signal: AbortSignal.timeout(300000),
      });

      const contentType = resp.headers.get('Content-Type') || '';
      if (resp.ok && contentType.includes('text/csv')) {
        const blob = await resp.blob();
        const cd = resp.headers.get('Content-Disposition') || '';
        const match = cd.match(/filename\s*=\s*([^;]+)/i);
        const filename = match
          ? match[1].replace(/"/g, '').trim()
          : `short-links-${idNum}.csv`;
        const urlObj = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlObj;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(urlObj);
        setDownloadMessage(t('adminShortLinks.download.success'));
        setDownloadType('success');
      } else {
        let errorText = t('adminShortLinks.download.error');
        try {
          const data = await resp.json();
          errorText = data?.message || data?.error?.code || errorText;
        } catch {}
        setDownloadMessage(errorText);
        setDownloadType('error');
      }
    } catch {
      setDownloadMessage(t('adminShortLinks.download.error'));
      setDownloadType('error');
    } finally {
      setDownloading(false);
    }
  };

  const onDownloadWithClicks = async () => {
    setDownloadMessageClicks('');
    setDownloadTypeClicks('idle');

    const idNum = parseInt(scenarioIdClicks, 10);
    if (!idNum || idNum <= 0) {
      setDownloadMessageClicks(t('adminShortLinks.downloadWithClicks.error'));
      setDownloadTypeClicks('error');
      return;
    }

    try {
      setDownloadingClicks(true);
      const token = adminApi.getAccessToken();
      const url = getApiUrl('/admin/short-links/download-with-clicks');
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/csv, application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ scenario_id: idNum }),
        signal: AbortSignal.timeout(300000),
      });

      const contentType = resp.headers.get('Content-Type') || '';
      if (resp.ok && contentType.includes('text/csv')) {
        const blob = await resp.blob();
        const cd = resp.headers.get('Content-Disposition') || '';
        const match = cd.match(/filename\s*=\s*([^;]+)/i);
        const filename = match
          ? match[1].replace(/"/g, '').trim()
          : `short-links-with-clicks-${idNum}.csv`;
        const urlObj = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlObj;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(urlObj);
        setDownloadMessageClicks(
          t('adminShortLinks.downloadWithClicks.success')
        );
        setDownloadTypeClicks('success');
      } else {
        let errorText = t('adminShortLinks.downloadWithClicks.error');
        try {
          const data = await resp.json();
          errorText = data?.message || data?.error?.code || errorText;
        } catch {}
        setDownloadMessageClicks(errorText);
        setDownloadTypeClicks('error');
      }
    } catch {
      setDownloadMessageClicks(t('adminShortLinks.downloadWithClicks.error'));
      setDownloadTypeClicks('error');
    } finally {
      setDownloadingClicks(false);
    }
  };

  const onDownloadWithClicksRange = async () => {
    setDownloadMessageRange('');
    setDownloadTypeRange('idle');

    const fromNum = parseInt(scenarioFromRange, 10);
    const toNum = parseInt(scenarioToRange, 10);
    if (!fromNum || !toNum || fromNum <= 0 || toNum <= 0 || toNum <= fromNum) {
      setDownloadMessageRange(
        t('adminShortLinks.downloadWithClicksRange.error')
      );
      setDownloadTypeRange('error');
      return;
    }

    try {
      setDownloadingRange(true);
      const token = adminApi.getAccessToken();
      const url = getApiUrl('/admin/short-links/download-with-clicks-range');
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/csv, application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ scenario_from: fromNum, scenario_to: toNum }),
        signal: AbortSignal.timeout(300000),
      });

      const contentType = resp.headers.get('Content-Type') || '';
      if (resp.ok && contentType.includes('text/csv')) {
        const blob = await resp.blob();
        const cd = resp.headers.get('Content-Disposition') || '';
        const match = cd.match(/filename\s*=\s*([^;]+)/i);
        const filename = match
          ? match[1].replace(/"/g, '').trim()
          : `short-links-with-clicks-${fromNum}-${toNum}.csv`;
        const urlObj = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlObj;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(urlObj);
        setDownloadMessageRange(
          t('adminShortLinks.downloadWithClicksRange.success')
        );
        setDownloadTypeRange('success');
      } else {
        let errorText = t('adminShortLinks.downloadWithClicksRange.error');
        try {
          const data = await resp.json();
          errorText = data?.message || data?.error?.code || errorText;
        } catch {}
        setDownloadMessageRange(errorText);
        setDownloadTypeRange('error');
      }
    } catch {
      setDownloadMessageRange(
        t('adminShortLinks.downloadWithClicksRange.error')
      );
      setDownloadTypeRange('error');
    } finally {
      setDownloadingRange(false);
    }
  };

  const onDownloadWithClicksByScenarioName = async () => {
    setDownloadByNameMessage('');
    setDownloadByNameType('idle');

    const regex = scenarioNameRegex.trim();
    if (!regex) {
      setDownloadByNameMessage(t('adminShortLinks.downloadByName.error'));
      setDownloadByNameType('error');
      return;
    }

    try {
      setDownloadingByName(true);
      const token = adminApi.getAccessToken();
      const url = getApiUrl(
        '/admin/short-links/download-with-clicks-by-scenario-name'
      );
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ scenario_name_regex: regex }),
        signal: AbortSignal.timeout(300000),
      });

      const contentType = resp.headers.get('Content-Type') || '';
      if (
        resp.ok &&
        contentType.includes(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      ) {
        const blob = await resp.blob();
        const cd = resp.headers.get('Content-Disposition') || '';
        const match = cd.match(/filename\s*=\s*([^;]+)/i);
        const filename = match
          ? match[1].replace(/"/g, '').trim()
          : `short-links-by-name.xlsx`;
        const urlObj = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlObj;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(urlObj);
        setDownloadByNameMessage(t('adminShortLinks.downloadByName.success'));
        setDownloadByNameType('success');
      } else {
        let errorText = t('adminShortLinks.downloadByName.error');
        try {
          const data = await resp.json();
          errorText = data?.message || data?.error?.code || errorText;
        } catch {}
        setDownloadByNameMessage(errorText);
        setDownloadByNameType('error');
      }
    } catch {
      setDownloadByNameMessage(t('adminShortLinks.downloadByName.error'));
      setDownloadByNameType('error');
    } finally {
      setDownloadingByName(false);
    }
  };

  return (
    <div className='px-4 sm:px-6 lg:px-8 py-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-xl font-semibold'>{t('adminShortLinks.title')}</h1>
        <button
          className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded'
          onClick={() => navigate(ROUTES.ADMIN_SARDIS.path)}
        >
          {t('adminCommon.backToSardis')}
        </button>
      </div>

      <p className='text-gray-600 mb-6'>{t('adminShortLinks.subtitle')}</p>

      <form onSubmit={onSubmit} className='max-w-xl space-y-5'>
        <div>
          <label className='block text-sm font-medium mb-1' htmlFor='domain'>
            {t('adminShortLinks.form.domainLabel')}
          </label>
          <select
            id='domain'
            value={selectedDomain}
            onChange={e => setSelectedDomain(e.target.value)}
            className='w-full border border-gray-300 rounded px-3 py-2 bg-white'
          >
            <option value='https://jo1n.ir'>
              {t('adminShortLinks.domain.jo1n')}
            </option>
            <option value='https://jzbe.ir'>
              {t('adminShortLinks.domain.joinsahel')}
            </option>
          </select>
        </div>

        <div>
          <label
            className='block text-sm font-medium mb-1'
            htmlFor='scenario-name'
          >
            {t('adminShortLinks.form.scenarioNameLabel')}
          </label>
          <input
            id='scenario-name'
            type='text'
            value={scenarioName}
            onChange={e => setScenarioName(e.target.value)}
            placeholder={t('adminShortLinks.form.scenarioNamePlaceholder')}
            required
            className='w-full border border-gray-300 rounded px-3 py-2 bg-white'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1' htmlFor='csv'>
            {t('adminShortLinks.form.fileLabel')}
          </label>
          <input
            id='csv'
            type='file'
            accept='.csv'
            onChange={e =>
              setFile(
                e.target.files && e.target.files[0] ? e.target.files[0] : null
              )
            }
            className='w-full border border-gray-300 rounded px-3 py-2 bg-white'
          />
        </div>

        <div
          className={`flex ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} items-center`}
        >
          <button
            type='submit'
            disabled={submitting}
            className={`px-4 py-2 rounded text-white ${submitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {submitting
              ? t('adminShortLinks.form.uploading')
              : t('adminShortLinks.form.upload')}
          </button>

          {statusMessage && (
            <span
              className={`${statusType === 'error' ? 'text-red-600' : statusType === 'success' ? 'text-green-600' : 'text-gray-600'} text-sm`}
            >
              {statusMessage}
            </span>
          )}
        </div>

        {uploadedScenarioId !== null && (
          <div className='text-sm text-gray-700'>
            {t('adminShortLinks.result.scenarioId', { id: uploadedScenarioId })}
          </div>
        )}

        {uploadJob && (
          <div className='rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-1'>
            <div className='font-medium'>
              {t('adminShortLinks.result.jobStatus', {
                status: uploadJob.status,
              })}
            </div>
            <div>
              {t('adminShortLinks.result.progress', {
                created: uploadJob.created,
                skipped: uploadJob.skipped,
                published: uploadJob.published,
                total: uploadJob.total_rows,
              })}
            </div>
            <div>
              {t('adminShortLinks.result.attempts', {
                count: uploadJob.attempts,
              })}
            </div>
            {uploadJob.last_error && (
              <div className='text-red-600'>
                {t('adminShortLinks.result.lastError', {
                  error: uploadJob.last_error,
                })}
              </div>
            )}
          </div>
        )}
      </form>

      {/* Download by Scenario */}
      <div className='mt-10 max-w-xl border-t border-gray-200 pt-6'>
        <h2 className='text-lg font-semibold mb-4'>
          {t('adminShortLinks.download.title')}
        </h2>
        <div className='space-y-4'>
          <div>
            <label
              className='block text-sm font-medium mb-1'
              htmlFor='scenario-id'
            >
              {t('adminShortLinks.download.scenarioIdLabel')}
            </label>
            <input
              id='scenario-id'
              type='number'
              inputMode='numeric'
              value={scenarioId}
              onChange={e => setScenarioId(e.target.value)}
              placeholder={t('adminShortLinks.download.scenarioIdPlaceholder')}
              className='w-full border border-gray-300 rounded px-3 py-2 bg-white'
            />
          </div>

          <div
            className={`flex ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} items-center`}
          >
            <button
              type='button'
              onClick={onDownload}
              disabled={downloading}
              className={`px-4 py-2 rounded text-white ${downloading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {downloading
                ? t('adminShortLinks.download.downloading')
                : t('adminShortLinks.download.download')}
            </button>

            {downloadMessage && (
              <span
                className={`${downloadType === 'error' ? 'text-red-600' : downloadType === 'success' ? 'text-green-600' : 'text-gray-600'} text-sm`}
              >
                {downloadMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Download with Clicks by Scenario */}
      <div className='mt-10 max-w-xl border-t border-gray-200 pt-6'>
        <h2 className='text-lg font-semibold mb-4'>
          {t('adminShortLinks.downloadWithClicks.title')}
        </h2>
        <div className='space-y-4'>
          <div>
            <label
              className='block text-sm font-medium mb-1'
              htmlFor='scenario-id-clicks'
            >
              {t('adminShortLinks.downloadWithClicks.scenarioIdLabel')}
            </label>
            <input
              id='scenario-id-clicks'
              type='number'
              inputMode='numeric'
              value={scenarioIdClicks}
              onChange={e => setScenarioIdClicks(e.target.value)}
              placeholder={t(
                'adminShortLinks.downloadWithClicks.scenarioIdPlaceholder'
              )}
              className='w-full border border-gray-300 rounded px-3 py-2 bg-white'
            />
          </div>

          <div
            className={`flex ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} items-center`}
          >
            <button
              type='button'
              onClick={onDownloadWithClicks}
              disabled={downloadingClicks}
              className={`px-4 py-2 rounded text-white ${downloadingClicks ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {downloadingClicks
                ? t('adminShortLinks.downloadWithClicks.downloading')
                : t('adminShortLinks.downloadWithClicks.download')}
            </button>

            {downloadMessageClicks && (
              <span
                className={`${downloadTypeClicks === 'error' ? 'text-red-600' : downloadTypeClicks === 'success' ? 'text-green-600' : 'text-gray-600'} text-sm`}
              >
                {downloadMessageClicks}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Download with Clicks by Scenario Range */}
      <div className='mt-10 max-w-xl border-t border-gray-200 pt-6'>
        <h2 className='text-lg font-semibold mb-4'>
          {t('adminShortLinks.downloadWithClicksRange.title')}
        </h2>
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                className='block text-sm font-medium mb-1'
                htmlFor='scenario-from'
              >
                {t('adminShortLinks.downloadWithClicksRange.scenarioFromLabel')}
              </label>
              <input
                id='scenario-from'
                type='number'
                inputMode='numeric'
                value={scenarioFromRange}
                onChange={e => setScenarioFromRange(e.target.value)}
                placeholder={t(
                  'adminShortLinks.downloadWithClicksRange.scenarioFromPlaceholder'
                )}
                className='w-full border border-gray-300 rounded px-3 py-2 bg-white'
              />
            </div>
            <div>
              <label
                className='block text-sm font-medium mb-1'
                htmlFor='scenario-to'
              >
                {t('adminShortLinks.downloadWithClicksRange.scenarioToLabel')}
              </label>
              <input
                id='scenario-to'
                type='number'
                inputMode='numeric'
                value={scenarioToRange}
                onChange={e => setScenarioToRange(e.target.value)}
                placeholder={t(
                  'adminShortLinks.downloadWithClicksRange.scenarioToPlaceholder'
                )}
                className='w-full border border-gray-300 rounded px-3 py-2 bg-white'
              />
            </div>
          </div>

          <div
            className={`flex ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} items-center`}
          >
            <button
              type='button'
              onClick={onDownloadWithClicksRange}
              disabled={downloadingRange}
              className={`px-4 py-2 rounded text-white ${downloadingRange ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {downloadingRange
                ? t('adminShortLinks.downloadWithClicksRange.downloading')
                : t('adminShortLinks.downloadWithClicksRange.download')}
            </button>

            {downloadMessageRange && (
              <span
                className={`${downloadTypeRange === 'error' ? 'text-red-600' : downloadTypeRange === 'success' ? 'text-green-600' : 'text-gray-600'} text-sm`}
              >
                {downloadMessageRange}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Download with Clicks by Scenario Name (Regex) */}
      <div className='mt-10 max-w-xl border-t border-gray-200 pt-6'>
        <h2 className='text-lg font-semibold mb-4'>
          {t('adminShortLinks.downloadByName.title')}
        </h2>
        <div className='space-y-4'>
          <div>
            <label
              className='block text-sm font-medium mb-1'
              htmlFor='scenario-name-regex'
            >
              {t('adminShortLinks.downloadByName.scenarioNameRegexLabel')}
            </label>
            <input
              id='scenario-name-regex'
              type='text'
              value={scenarioNameRegex}
              onChange={e => setScenarioNameRegex(e.target.value)}
              placeholder={t(
                'adminShortLinks.downloadByName.scenarioNameRegexPlaceholder'
              )}
              className='w-full border border-gray-300 rounded px-3 py-2 bg-white'
            />
          </div>

          <div
            className={`flex ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} items-center`}
          >
            <button
              type='button'
              onClick={onDownloadWithClicksByScenarioName}
              disabled={downloadingByName}
              className={`px-4 py-2 rounded text-white ${downloadingByName ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {downloadingByName
                ? t('adminShortLinks.downloadByName.downloading')
                : t('adminShortLinks.downloadByName.download')}
            </button>

            {downloadByNameMessage && (
              <span
                className={`${downloadByNameType === 'error' ? 'text-red-600' : downloadByNameType === 'success' ? 'text-green-600' : 'text-gray-600'} text-sm`}
              >
                {downloadByNameMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminShortLinkManagementPage;
