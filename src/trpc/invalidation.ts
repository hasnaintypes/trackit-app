"use client";

import type { api } from "@/trpc/react";

type Utils = ReturnType<typeof api.useUtils>;

/**
 * Centralized query invalidation helpers.
 *
 * Every domain defines which queries must be refreshed after a mutation.
 * Consumers call these instead of scattering invalidation logic across hooks
 * and components. When a new query is added, update this single file.
 */

/** After creating/updating/deleting a transaction */
export function invalidateTransactions(utils: Utils) {
  return Promise.all([
    utils.transaction.list.invalidate(),
    utils.account.list.invalidate(),
    utils.budget.all.invalidate(),
  ]);
}

/** After creating/updating/deleting an account */
export function invalidateAccounts(utils: Utils) {
  return utils.account.list.invalidate();
}

/** After any category mutation */
export function invalidateCategories(utils: Utils) {
  return utils.category.list.invalidate();
}

/** After creating/updating/deleting a budget */
export function invalidateBudgets(utils: Utils) {
  return utils.budget.invalidate();
}

/** After revoking sessions */
export function invalidateSessions(utils: Utils) {
  return utils.session.list.invalidate();
}

/** After updating any settings (notifications, display, regional) */
export function invalidateSettings(utils: Utils) {
  return utils.settings.getAll.invalidate();
}

/** After marking notifications as read */
export function invalidateNotifications(utils: Utils) {
  return Promise.all([
    utils.notification.getLatest.invalidate(),
    utils.notification.getUnreadCount.invalidate(),
  ]);
}

/** After generating a report */
export function invalidateReports(utils: Utils) {
  return utils.report.list.invalidate();
}

/** After updating user profile */
export function invalidateUser(utils: Utils) {
  return utils.user.getMe.invalidate();
}

/** After creating/updating/deleting a contact */
export function invalidateContacts(utils: Utils) {
  return utils.contact.list.invalidate();
}

/** After creating/updating/deleting a group or group membership */
export function invalidateGroups(utils: Utils) {
  return Promise.all([
    utils.group.list.invalidate(),
    utils.overview.splitSummary.invalidate(),
  ]);
}

/** After creating/updating/deleting an expense */
export function invalidateExpenses(utils: Utils) {
  return Promise.all([
    utils.expense.list.invalidate(),
    utils.overview.splitSummary.invalidate(),
  ]);
}

/** After creating a settlement */
export function invalidateSettlements(utils: Utils) {
  return Promise.all([
    utils.settlement.list.invalidate(),
    utils.overview.splitSummary.invalidate(),
  ]);
}

/** After any mutation inside a group detail page */
export function invalidateGroupDetail(utils: Utils, groupId: string) {
  return Promise.all([
    utils.group.getById.invalidate({ id: groupId }),
    utils.group.getBalances.invalidate({ id: groupId }),
    utils.group.getSimplifiedDebts.invalidate({ id: groupId }),
    utils.group.activityFeed.invalidate({ id: groupId }),
    utils.expense.list.invalidate({ groupId }),
    utils.settlement.list.invalidate({ groupId }),
    utils.overview.splitSummary.invalidate(),
  ]);
}
