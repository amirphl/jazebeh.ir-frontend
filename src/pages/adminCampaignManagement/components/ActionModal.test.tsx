import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, jest } from '@jest/globals';
import { AdminGetCampaignResponse } from '../../../types/admin';
import { RESCHEDULE_MIN_LEAD_MINUTES } from '../constants';
import { getAdminCampaignManagementCopy } from '../translations';
import ActionModal from './ActionModal';

const copy = getAdminCampaignManagementCopy('en');

const campaign: AdminGetCampaignResponse = {
  id: 42,
  uuid: '886ea124-14a9-4d20-8912-b52df59d8515',
  status: 'waiting-for-approval',
  created_at: '2026-08-18T10:00:00Z',
  platform: 'sms',
};

describe('ActionModal', () => {
  it('requires at least 7 minutes of lead time for rescheduling', () => {
    expect(RESCHEDULE_MIN_LEAD_MINUTES).toBe(7);
  });

  it.each([
    ['approve', copy.modal.approve, ''],
    ['reject', copy.modal.reject, 'Invalid campaign details'],
  ] as const)(
    'keeps the %s control outside the scrolling campaign details',
    (actionType, actionLabel, actionComment) => {
      const onClose = jest.fn();
      const onSubmit = jest.fn();

      render(
        <ActionModal
          actionType={actionType}
          actionCampaign={campaign}
          actionComment={actionComment}
          actionError={null}
          actionSubmitting={false}
          copy={copy}
          resolveStatusLabel={() => copy.filters.statuses.waitingForApproval}
          formatDateTime={value => value || ''}
          onClose={onClose}
          onCommentChange={jest.fn()}
          onSubmit={onSubmit}
        />
      );

      const scrollArea = screen.getByTestId(
        'campaign-action-modal-scroll-area'
      );
      const footer = screen.getByTestId('campaign-action-modal-footer');
      const actionButton = within(footer).getByRole('button', {
        name: actionLabel,
      });

      expect(scrollArea.className).toContain('flex-1');
      expect(scrollArea.className).toContain('overflow-y-auto');
      expect(
        within(scrollArea).queryByRole('button', { name: actionLabel })
      ).toBeNull();

      if (actionType === 'approve') {
        expect(screen.queryByRole('textbox')).toBeNull();
      } else {
        expect(screen.getByRole('textbox')).not.toBeNull();
      }

      fireEvent.click(actionButton);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    }
  );
});
