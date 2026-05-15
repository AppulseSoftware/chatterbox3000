import type { Env } from "../index.ts";
import type { Database } from "../db/index.ts";
import { emails } from "../db/schema.ts";
import { forwardEmail } from "./forwarder.ts";
import { getSettings, markForwarded } from "./storage.ts";

type EmailRow = typeof emails.$inferSelect;

export async function forwardApprovedEmailRows(
  db: Database,
  env: Env,
  rows: EmailRow[],
): Promise<void> {
  if (rows.length === 0) return;

  const settings = await getSettings(db);
  const destination = settings.destination_email;
  if (!destination) return;

  for (const e of rows) {
    const forwarded = await forwardEmail({
      env,
      to: destination,
      from: e.toHeader,
      subject: e.subject,
      bodyPreview: e.bodyPreview || "",
      originalFrom: e.fromHeader,
      classification: e.classification,
    });
    if (forwarded) {
      await markForwarded(db, e.id);
    }
  }
}
