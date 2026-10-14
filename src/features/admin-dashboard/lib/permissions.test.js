import { describe, expect, it } from 'vitest';
import {
  canChangeUser,
  canReviewActivity,
} from '@/features/admin-dashboard/lib/permissions.js';

describe('admin review affordances', () => {
  const activity = {
    activityData: { activityStatus: 'PENDING_CHECKER' },
    checkerData: { userId: 'checker-1' },
    approverData: { userId: 'approver-1' },
  };
  it('permits only the assigned checker at the checking stage', () => {
    expect(
      canReviewActivity(activity, { role: 'CHECKER', userId: 'checker-1' }),
    ).toBe(true);
    expect(
      canReviewActivity(activity, { role: 'CHECKER', userId: 'other' }),
    ).toBe(false);
    expect(
      canReviewActivity(activity, { role: 'MAKER', userId: 'checker-1' }),
    ).toBe(false);
  });
  it('permits only the assigned approver at the approval stage', () => {
    const pending = {
      ...activity,
      activityData: { activityStatus: 'PENDING_APPROVER' },
    };
    expect(
      canReviewActivity(pending, { role: 'APPROVER', userId: 'approver-1' }),
    ).toBe(true);
    expect(
      canReviewActivity(pending, { role: 'CHECKER', userId: 'checker-1' }),
    ).toBe(false);
  });
  it('does not expose status changes without a complete allowed API rule', () => {
    expect(canChangeUser(null)).toBe(false);
    expect(canChangeUser({ menu_id: '1', action_flow: 'APPROVER_ONLY' })).toBe(
      false,
    );
    expect(canChangeUser({ menu_id: '1', action_flow: 'NO_APPROVER' })).toBe(
      true,
    );
  });
});
