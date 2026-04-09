import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const emails = sqliteTable("emails", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  messageId: text("message_id"),
  sender: text("sender").notNull(),
  fromHeader: text("from_header").notNull(),
  toHeader: text("to_header").notNull(),
  subject: text("subject").notNull().default(""),
  bodyPreview: text("body_preview").default(""),
  rawSize: integer("raw_size").default(0),
  spfPass: integer("spf_pass", { mode: "boolean" }).default(false),
  dkimPass: integer("dkim_pass", { mode: "boolean" }).default(false),
  status: text("status", {
    enum: ["pending", "approved", "rejected", "forwarded"],
  })
    .notNull()
    .default("pending"),
  classification: text("classification", {
    enum: ["cold_outreach", "spam", "newsletter", "legitimate", "unknown"],
  }),
  classificationReason: text("classification_reason"),
  rawStorageKey: text("raw_storage_key"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  actionedAt: text("actioned_at"),
});

export const senders = sqliteTable("senders", {
  address: text("address").primaryKey(),
  displayName: text("display_name"),
  status: text("status", {
    enum: ["allowed", "blocked", "unknown"],
  })
    .notNull()
    .default("unknown"),
  emailCount: integer("email_count").default(0),
  firstSeen: text("first_seen")
    .notNull()
    .default(sql`(datetime('now'))`),
  lastSeen: text("last_seen")
    .notNull()
    .default(sql`(datetime('now'))`),
  notes: text("notes"),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
