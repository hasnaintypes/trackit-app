import { type PrismaClient, type SplitMethod } from "@prisma/client";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logging";
import { toNum } from "@shared/decimal";

type DbClient = PrismaClient;

const logger = createLogger("splitService");

export interface SplitParticipant {
  contactId: string | null; // null = self (current user)
  customValue?: number; // exact amount, percentage, or share count
}

export interface SplitResult {
  contactId: string | null;
  owedAmount: number;
}

export class SplitService {
  /**
   * Calculate split amounts based on method.
   * Returns the owed amount per participant.
   */
  static calculateSplit(
    totalAmount: number,
    participants: SplitParticipant[],
    method: SplitMethod,
  ): SplitResult[] {
    if (participants.length === 0) {
      throw new Error("At least one participant is required");
    }

    switch (method) {
      case "EQUAL":
        return this.splitEqual(totalAmount, participants);
      case "EXACT":
        return this.splitExact(totalAmount, participants);
      case "PERCENTAGE":
        return this.splitPercentage(totalAmount, participants);
      case "SHARES":
        return this.splitShares(totalAmount, participants);
      default:
        throw new Error(`Unknown split method: ${String(method)}`);
    }
  }

  private static splitEqual(
    totalAmount: number,
    participants: SplitParticipant[],
  ): SplitResult[] {
    const count = participants.length;
    const baseAmount = Math.floor((totalAmount / count) * 100) / 100;
    const remainder =
      Math.round((totalAmount - baseAmount * count) * 100) / 100;

    return participants.map((p, i) => ({
      contactId: p.contactId,
      // Give the remainder cent(s) to the first participant
      owedAmount: i === 0 ? baseAmount + remainder : baseAmount,
    }));
  }

  private static splitExact(
    totalAmount: number,
    participants: SplitParticipant[],
  ): SplitResult[] {
    const sum = participants.reduce((acc, p) => acc + (p.customValue ?? 0), 0);
    const roundedSum = Math.round(sum * 100) / 100;
    const roundedTotal = Math.round(totalAmount * 100) / 100;

    if (roundedSum !== roundedTotal) {
      logger.warn("Exact split amounts don't sum to total", {
        sum: roundedSum,
        total: roundedTotal,
      });
      throw new Error(
        `Exact amounts sum to ${roundedSum} but total is ${roundedTotal}`,
      );
    }

    return participants.map((p) => ({
      contactId: p.contactId,
      owedAmount: Math.round((p.customValue ?? 0) * 100) / 100,
    }));
  }

  private static splitPercentage(
    totalAmount: number,
    participants: SplitParticipant[],
  ): SplitResult[] {
    const totalPercent = participants.reduce(
      (acc, p) => acc + (p.customValue ?? 0),
      0,
    );
    const roundedPercent = Math.round(totalPercent * 100) / 100;

    if (roundedPercent !== 100) {
      throw new Error(
        `Percentages sum to ${roundedPercent}% but must equal 100%`,
      );
    }

    const results = participants.map((p) => ({
      contactId: p.contactId,
      owedAmount:
        Math.round(totalAmount * ((p.customValue ?? 0) / 100) * 100) / 100,
    }));

    // Adjust for rounding: give difference to first participant
    const resultSum = results.reduce((acc, r) => acc + r.owedAmount, 0);
    const diff = Math.round((totalAmount - resultSum) * 100) / 100;
    if (diff !== 0 && results[0]) {
      results[0].owedAmount =
        Math.round((results[0].owedAmount + diff) * 100) / 100;
    }

    return results;
  }

  private static splitShares(
    totalAmount: number,
    participants: SplitParticipant[],
  ): SplitResult[] {
    const totalShares = participants.reduce(
      (acc, p) => acc + (p.customValue ?? 1),
      0,
    );

    if (totalShares <= 0) {
      throw new Error("Total shares must be greater than zero");
    }

    const results = participants.map((p) => ({
      contactId: p.contactId,
      owedAmount:
        Math.round(totalAmount * ((p.customValue ?? 1) / totalShares) * 100) /
        100,
    }));

    // Adjust for rounding
    const resultSum = results.reduce((acc, r) => acc + r.owedAmount, 0);
    const diff = Math.round((totalAmount - resultSum) * 100) / 100;
    if (diff !== 0 && results[0]) {
      results[0].owedAmount =
        Math.round((results[0].owedAmount + diff) * 100) / 100;
    }

    return results;
  }

  // ─── Balance Calculation ───────────────────────────────────────────

  /**
   * Calculate net balance per member for a group.
   * Positive = owed money (others owe you), Negative = you owe money.
   * Key is contactId or "self" for the current user (null contactId).
   */
  static async calculateGroupBalances(
    groupId: string,
    _userId: string,
    dbClient: DbClient = db,
  ): Promise<Map<string, number>> {
    const balances = new Map<string, number>();

    const key = (contactId: string | null) => contactId ?? "self";

    // Get all expenses with participants
    const expenses = await dbClient.expense.findMany({
      where: { groupId },
      select: {
        participants: {
          select: {
            contactId: true,
            isPayer: true,
            paidAmount: true,
            owedAmount: true,
          },
        },
      },
    });

    for (const expense of expenses) {
      for (const p of expense.participants) {
        const k = key(p.contactId);
        const current = balances.get(k) ?? 0;
        // Payer paid money → positive credit
        // Everyone owes their share → negative debit
        const paid = p.isPayer ? toNum(p.paidAmount) : 0;
        const owed = toNum(p.owedAmount);
        balances.set(k, Math.round((current + paid - owed) * 100) / 100);
      }
    }

    // Get all settlements
    const settlements = await dbClient.settlement.findMany({
      where: { groupId },
      select: {
        fromContactId: true,
        toContactId: true,
        amount: true,
      },
    });

    for (const s of settlements) {
      const fromKey = key(s.fromContactId);
      const toKey = key(s.toContactId);
      const amount = toNum(s.amount);

      // "from" paid money to "to", reducing from's debt
      balances.set(
        fromKey,
        Math.round(((balances.get(fromKey) ?? 0) + amount) * 100) / 100,
      );
      // "to" received money, reducing what's owed to them
      balances.set(
        toKey,
        Math.round(((balances.get(toKey) ?? 0) - amount) * 100) / 100,
      );
    }

    return balances;
  }

  /**
   * Calculate pairwise debts: who owes whom and how much.
   * Returns simplified list of { from, to, amount } where amount > 0.
   */
  static async calculatePairwiseDebts(
    groupId: string,
    _userId: string,
    dbClient: DbClient = db,
  ): Promise<Debt[]> {
    const balances = await this.calculateGroupBalances(
      groupId,
      _userId,
      dbClient,
    );

    // Separate into debtors (negative balance) and creditors (positive)
    const debtors: Array<{ key: string; amount: number }> = [];
    const creditors: Array<{ key: string; amount: number }> = [];

    for (const [key, balance] of balances) {
      if (balance < -0.01) {
        debtors.push({ key, amount: Math.abs(balance) });
      } else if (balance > 0.01) {
        creditors.push({ key, amount: balance });
      }
    }

    // Sort by amount descending for greedy matching
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debts: Debt[] = [];
    let di = 0;
    let ci = 0;

    while (di < debtors.length && ci < creditors.length) {
      const debtor = debtors[di]!;
      const creditor = creditors[ci]!;
      const transfer = Math.min(debtor.amount, creditor.amount);
      const rounded = Math.round(transfer * 100) / 100;

      if (rounded > 0) {
        debts.push({
          from: debtor.key,
          to: creditor.key,
          amount: rounded,
        });
      }

      debtor.amount = Math.round((debtor.amount - transfer) * 100) / 100;
      creditor.amount = Math.round((creditor.amount - transfer) * 100) / 100;

      if (debtor.amount < 0.01) di++;
      if (creditor.amount < 0.01) ci++;
    }

    return debts;
  }

  /**
   * Calculate total owed/owing across ALL groups for a user.
   * Used for the dashboard summary card.
   */
  static async calculateTotalBalance(
    userId: string,
  ): Promise<{ youOwe: number; youAreOwed: number }> {
    const groups = await db.group.findMany({
      where: { userId, isArchived: false },
      select: { id: true },
    });

    let youOwe = 0;
    let youAreOwed = 0;

    for (const group of groups) {
      const balances = await this.calculateGroupBalances(group.id, userId);
      const selfBalance = balances.get("self") ?? 0;

      if (selfBalance < 0) {
        youOwe += Math.abs(selfBalance);
      } else if (selfBalance > 0) {
        youAreOwed += selfBalance;
      }
    }

    return {
      youOwe: Math.round(youOwe * 100) / 100,
      youAreOwed: Math.round(youAreOwed * 100) / 100,
    };
  }

  /**
   * Simplify debts: minimize the number of transactions needed to settle.
   * Uses greedy algorithm on net balances.
   */
  static simplifyDebts(debts: Debt[]): Debt[] {
    // Build net balance per person from raw pairwise debts
    const netMap = new Map<string, number>();
    for (const d of debts) {
      netMap.set(d.from, (netMap.get(d.from) ?? 0) - d.amount);
      netMap.set(d.to, (netMap.get(d.to) ?? 0) + d.amount);
    }

    const debtors: Array<{ key: string; amount: number }> = [];
    const creditors: Array<{ key: string; amount: number }> = [];

    for (const [key, balance] of netMap) {
      if (balance < -0.01) {
        debtors.push({ key, amount: Math.abs(balance) });
      } else if (balance > 0.01) {
        creditors.push({ key, amount: balance });
      }
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const simplified: Debt[] = [];
    let di = 0;
    let ci = 0;

    while (di < debtors.length && ci < creditors.length) {
      const debtor = debtors[di]!;
      const creditor = creditors[ci]!;
      const transfer =
        Math.round(Math.min(debtor.amount, creditor.amount) * 100) / 100;

      if (transfer > 0) {
        simplified.push({
          from: debtor.key,
          to: creditor.key,
          amount: transfer,
        });
      }

      debtor.amount = Math.round((debtor.amount - transfer) * 100) / 100;
      creditor.amount = Math.round((creditor.amount - transfer) * 100) / 100;

      if (debtor.amount < 0.01) di++;
      if (creditor.amount < 0.01) ci++;
    }

    return simplified;
  }

  /**
   * Get activity feed for a group (expenses + settlements merged chronologically).
   */
  static async getActivityFeed(
    groupId: string,
    limit = 30,
    cursor?: string,
    dbClient: DbClient = db,
  ) {
    const [expenses, settlements] = await Promise.all([
      dbClient.expense.findMany({
        where: { groupId },
        select: {
          id: true,
          description: true,
          amount: true,
          date: true,
          splitMethod: true,
          isSettlement: true,
          createdBy: { select: { id: true, name: true } },
          participants: {
            select: {
              contactId: true,
              isPayer: true,
              contact: { select: { name: true } },
            },
          },
        },
        orderBy: { date: "desc" },
        take: limit,
      }),
      dbClient.settlement.findMany({
        where: { groupId },
        select: {
          id: true,
          amount: true,
          date: true,
          notes: true,
          fromContactId: true,
          toContactId: true,
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
        take: limit,
      }),
    ]);

    type ActivityItem =
      | {
          type: "expense";
          id: string;
          date: Date;
          data: (typeof expenses)[number];
        }
      | {
          type: "settlement";
          id: string;
          date: Date;
          data: (typeof settlements)[number];
        };

    const items: ActivityItem[] = [
      ...expenses.map((e) => ({
        type: "expense" as const,
        id: e.id,
        date: e.date,
        data: e,
      })),
      ...settlements.map((s) => ({
        type: "settlement" as const,
        id: s.id,
        date: s.date,
        data: s,
      })),
    ];

    items.sort((a, b) => b.date.getTime() - a.date.getTime());

    const sliced = cursor
      ? items.filter((i) => i.id !== cursor).slice(0, limit)
      : items.slice(0, limit);

    return sliced.map((item) => ({
      type: item.type,
      id: item.id,
      date: item.date.toISOString(),
      amount: toNum(item.data.amount),
      ...(item.type === "expense"
        ? {
            description: item.data.description,
            splitMethod: item.data.splitMethod,
            isSettlement: item.data.isSettlement,
            createdByName: item.data.createdBy.name,
            participantCount: item.data.participants.length,
            payerName:
              item.data.participants.find((p) => p.isPayer)?.contact?.name ??
              "You",
          }
        : {
            notes: item.data.notes,
            fromContactId: item.data.fromContactId,
            toContactId: item.data.toContactId,
            createdByName: item.data.createdBy.name,
          }),
    }));
  }
}

export interface Debt {
  from: string; // contactId or "self"
  to: string;
  amount: number;
}
