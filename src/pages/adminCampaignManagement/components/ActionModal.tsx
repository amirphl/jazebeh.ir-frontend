import React from 'react';
import { AdminGetCampaignResponse } from '../../../types/admin';
import { CampaignActionType } from '../constants';
import { AdminCampaignManagementCopy } from '../translations';
import { requiresComment } from '../utils';

interface ActionModalProps {
  actionType: CampaignActionType | null;
  actionCampaign: AdminGetCampaignResponse | null;
  actionComment: string;
  actionError: string | null;
  actionSubmitting: boolean;
  copy: AdminCampaignManagementCopy;
  resolveStatusLabel: (status?: string | null) => string;
  formatDateTime: (value?: string | null) => string;
  onClose: () => void;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  actionType,
  actionCampaign,
  actionComment,
  actionError,
  actionSubmitting,
  copy,
  resolveStatusLabel,
  formatDateTime,
  onClose,
  onCommentChange,
  onSubmit,
}) => {
  if (!actionType || !actionCampaign) return null;

  const renderArray = (value?: string[] | null): string =>
    Array.isArray(value) && value.length > 0 ? value.join(', ') : '-';

  const isCommentRequired = requiresComment(actionType);
  const modalTitle =
    actionType === 'approve'
      ? copy.modal.approveTitle
      : actionType === 'reject'
        ? copy.modal.rejectTitle
        : copy.modal.cancelTitle;

  const submitText =
    actionType === 'approve'
      ? copy.modal.approve
      : actionType === 'reject'
        ? copy.modal.reject
        : copy.modal.cancel;

  const submitClass =
    actionType === 'approve'
      ? 'bg-green-600 hover:bg-green-700'
      : actionType === 'reject'
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-amber-600 hover:bg-amber-700';

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4'>
      <div
        className='flex h-screen max-h-screen w-full flex-col overflow-hidden rounded-none bg-white shadow-lg supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:max-h-[100dvh] sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-4xl sm:rounded'
        role='dialog'
        aria-modal='true'
        aria-labelledby='campaign-action-modal-title'
      >
        <div className='mb-0 flex shrink-0 items-center justify-between border-b border-gray-200 p-4 sm:p-5'>
          <h2
            id='campaign-action-modal-title'
            className='text-lg font-semibold'
          >
            {modalTitle}
          </h2>
          <button
            type='button'
            className='text-gray-500'
            onClick={onClose}
            aria-label={copy.modal.closeLabel}
          >
            ✕
          </button>
        </div>

        <div
          className='min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 sm:p-5'
          data-testid='campaign-action-modal-scroll-area'
        >
          <div className='grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-gray-700 md:grid-cols-2'>
            <div>
              <span className='font-medium'>{copy.table.headers.id}:</span>{' '}
              {typeof actionCampaign.id === 'number' ? actionCampaign.id : '-'}
            </div>
            <div>
              <span className='font-medium'>{copy.modal.uuid}:</span>{' '}
              <span className='font-mono break-all'>{actionCampaign.uuid}</span>
            </div>
            <div>
              <span className='font-medium'>
                {copy.table.headers.scheduleAt}:
              </span>{' '}
              {formatDateTime(actionCampaign.scheduleat) || '-'}
            </div>
            <div>
              <span className='font-medium'>{copy.modal.title}:</span>{' '}
              {actionCampaign.title || '-'}
            </div>
            <div>
              <span className='font-medium'>{copy.modal.currentStatus}:</span>{' '}
              {resolveStatusLabel(actionCampaign.status)}
            </div>
            <div>
              <span className='font-medium'>{copy.modal.platform}:</span>{' '}
              {actionCampaign.platform || '-'}
            </div>
            <div>
              <span className='font-medium'>
                {copy.table.headers.createdAt}:
              </span>{' '}
              {formatDateTime(actionCampaign.created_at) || '-'}
            </div>
            <div>
              <span className='font-medium'>
                {copy.table.headers.updatedAt}:
              </span>{' '}
              {formatDateTime(actionCampaign.updated_at) || '-'}
            </div>
            <div>
              <span className='font-medium'>
                {copy.modal.platformSettingsId}:
              </span>{' '}
              {typeof actionCampaign.platform_settings_id === 'number'
                ? actionCampaign.platform_settings_id
                : '-'}
            </div>
            <div>
              <span className='font-medium'>{copy.modal.mediaUuid}:</span>{' '}
              {actionCampaign.media_uuid || '-'}
            </div>
            <div>
              <span className='font-medium'>{copy.table.headers.segment}:</span>{' '}
              {actionCampaign.level1 || '-'}
            </div>
            <div>
              <span className='font-medium'>
                {copy.table.headers.subsegment}:
              </span>{' '}
              {renderArray(actionCampaign.level2s)}
            </div>
            <div className='md:col-span-2'>
              <span className='font-medium'>{copy.table.headers.adLink}:</span>{' '}
              <span className='break-all'>{actionCampaign.adlink || '-'}</span>
            </div>
            <div className='md:col-span-2 whitespace-pre-wrap break-words'>
              <span className='font-medium'>{copy.table.headers.content}:</span>{' '}
              {actionCampaign.content || '-'}
            </div>
            <div>
              <span className='font-medium'>
                {copy.table.headers.lineNumber}:
              </span>{' '}
              {actionCampaign.line_number || '-'}
            </div>
            <div>
              <span className='font-medium'>{copy.table.headers.budget}:</span>{' '}
              {typeof actionCampaign.budget === 'number'
                ? actionCampaign.budget.toLocaleString()
                : '-'}
            </div>
            <div>
              <span className='font-medium'>{copy.table.headers.sex}:</span>{' '}
              {actionCampaign.sex || '-'}
            </div>
            <div>
              <span className='font-medium'>{copy.table.headers.city}:</span>{' '}
              {renderArray(actionCampaign.city)}
            </div>
            <div className='md:col-span-2 whitespace-pre-wrap break-words'>
              <span className='font-medium'>{copy.table.headers.comment}:</span>{' '}
              {actionCampaign.comment || '-'}
            </div>
          </div>

          {actionType !== 'approve' ? (
            <div>
              <label className='mb-1 block text-sm font-medium'>
                {isCommentRequired
                  ? copy.modal.commentLabelRequired
                  : copy.modal.commentLabelOptional}
              </label>
              <textarea
                className='min-h-[100px] w-full rounded border px-3 py-2'
                value={actionComment}
                onChange={e => onCommentChange(e.target.value)}
                maxLength={1000}
              />
              <div className='mt-1 text-xs text-gray-500'>
                {copy.modal.maxChars}
              </div>
            </div>
          ) : null}

          {actionError ? (
            <div className='text-sm text-red-600'>{actionError}</div>
          ) : null}
        </div>

        <div
          className='flex shrink-0 gap-3 border-t border-gray-200 bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-end sm:px-5 sm:py-4'
          data-testid='campaign-action-modal-footer'
        >
          <button
            type='button'
            className='min-h-11 flex-1 rounded border px-4 py-2 sm:flex-none'
            onClick={onClose}
            disabled={actionSubmitting}
          >
            {copy.common.cancel}
          </button>
          <button
            type='button'
            className={`${submitClass} min-h-11 flex-1 rounded px-4 py-2 text-white disabled:opacity-60 sm:flex-none`}
            onClick={onSubmit}
            disabled={
              actionSubmitting || (isCommentRequired && !actionComment.trim())
            }
          >
            {actionSubmitting ? copy.modal.submitting : submitText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
