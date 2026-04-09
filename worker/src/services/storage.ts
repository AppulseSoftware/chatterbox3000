import { eq, desc, and, sql, like, or } from "drizzle-orm";
import { emails, senders, settings } from "../db/schema.ts";
import type { Database } from "../db/index.ts";

export async function getEmails(
  db: Database,
  status?: string,
  limit = 50,
  offset = 0,
) {
  const conditions = status ? eq(emails.status, status as any) : undefined;
  return db.query.emails.findMany({
    where: conditions,
    orderBy: desc(emails.createdAt),
    limit,
    offset,
  });
}

export async function getEmailById(db: Database, id: string) {
  return db.query.emails.findFirst({
    where: eq(emails.id, id),
  });
}

export async function storeEmail(
  db: Database,
  email: {
    messageId?: string;
    sender: string;
    fromHeader: string;
    toHeader: string;
    subject: string;
    bodyPreview?: string;
    rawSize?: number;
    spfPass?: boolean;
    dkimPass?: boolean;
    status?: string;
    classification?: string;
    classificationReason?: string;
    rawStorageKey?: string;
  },
) {
  const [result] = await db
    .insert(emails)
    .values(email as any)
    .returning();
  return result;
}

export async function approveEmail(db: Database, id: string) {
  const [result] = await db
    .update(emails)
    .set({ status: "approved", actionedAt: sql`(datetime('now'))` })
    .where(eq(emails.id, id))
    .returning();
  return result;
}

export async function rejectEmail(db: Database, id: string) {
  const [result] = await db
    .update(emails)
    .set({ status: "rejected", actionedAt: sql`(datetime('now'))` })
    .where(eq(emails.id, id))
    .returning();
  return result;
}

export async function markForwarded(db: Database, id: string) {
  return db
    .update(emails)
    .set({ status: "forwarded", actionedAt: sql`(datetime('now'))` })
    .where(eq(emails.id, id));
}

export async function bulkAction(
  db: Database,
  ids: string[],
  action: "approve" | "reject",
) {
  const status = action === "approve" ? "approved" : "rejected";
  const results = [];
  for (const id of ids) {
    const [result] = await db
      .update(emails)
      .set({ status, actionedAt: sql`(datetime('now'))` })
      .where(eq(emails.id, id))
      .returning();
    if (result) results.push(result);
  }
  return results;
}

export async function upsertSender(
  db: Database,
  address: string,
  displayName: string | null,
) {
  return db
    .insert(senders)
    .values({ address, displayName })
    .onConflictDoUpdate({
      target: senders.address,
      set: {
        lastSeen: sql`(datetime('now'))`,
        emailCount: sql`${senders.emailCount} + 1`,
      },
    });
}

export async function getSenders(db: Database, status?: string) {
  const conditions = status
    ? eq(senders.status, status as any)
    : undefined;
  return db.query.senders.findMany({
    where: conditions,
    orderBy: desc(senders.lastSeen),
  });
}

export async function getSender(db: Database, address: string) {
  return db.query.senders.findFirst({
    where: eq(senders.address, address),
  });
}

export async function allowSender(db: Database, address: string) {
  await db
    .update(senders)
    .set({ status: "allowed" })
    .where(eq(senders.address, address));

  return db
    .update(emails)
    .set({ status: "approved", actionedAt: sql`(datetime('now'))` })
    .where(and(eq(emails.sender, address), eq(emails.status, "pending")));
}

export async function blockSender(db: Database, address: string) {
  await db
    .update(senders)
    .set({ status: "blocked" })
    .where(eq(senders.address, address));

  return db
    .update(emails)
    .set({ status: "rejected", actionedAt: sql`(datetime('now'))` })
    .where(and(eq(emails.sender, address), eq(emails.status, "pending")));
}

export async function resetSender(db: Database, address: string) {
  return db
    .update(senders)
    .set({ status: "unknown" })
    .where(eq(senders.address, address));
}

export async function getSettings(db: Database) {
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function updateSettings(
  db: Database,
  updates: Record<string, string>,
) {
  for (const [key, value] of Object.entries(updates)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value },
      });
  }
}

export async function getStats(db: Database) {
  const allEmails = await db.select().from(emails);
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  const stats = {
    total: allEmails.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    forwarded: 0,
    last24h: 0,
    last7d: 0,
    last30d: 0,
  };

  for (const email of allEmails) {
    const s = email.status as keyof typeof stats;
    if (s in stats) (stats[s] as number)++;

    const created = new Date(email.createdAt).getTime();
    const age = now.getTime() - created;
    if (age < day) stats.last24h++;
    if (age < 7 * day) stats.last7d++;
    if (age < 30 * day) stats.last30d++;
  }

  return stats;
}
