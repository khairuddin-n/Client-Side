export function canReviewActivity(activity, session) {
  if (!activity || !session?.userId) return false;
  const status = activity.activityData?.activityStatus;
  return (
    (status === 'PENDING_CHECKER' &&
      session.role === 'CHECKER' &&
      activity.checkerData?.userId === session.userId) ||
    (status === 'PENDING_APPROVER' &&
      session.role === 'APPROVER' &&
      activity.approverData?.userId === session.userId)
  );
}

export function canChangeUser(rule) {
  return Boolean(
    rule?.menu_id &&
    ['NO_APPROVER', 'CHECKER_AND_APPROVER'].includes(rule.action_flow),
  );
}
