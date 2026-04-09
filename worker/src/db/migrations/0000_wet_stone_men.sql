CREATE TABLE `emails` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text,
	`sender` text NOT NULL,
	`from_header` text NOT NULL,
	`to_header` text NOT NULL,
	`subject` text DEFAULT '' NOT NULL,
	`body_preview` text DEFAULT '',
	`raw_size` integer DEFAULT 0,
	`spf_pass` integer DEFAULT false,
	`dkim_pass` integer DEFAULT false,
	`status` text DEFAULT 'pending' NOT NULL,
	`classification` text,
	`classification_reason` text,
	`raw_storage_key` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`actioned_at` text
);
--> statement-breakpoint
CREATE TABLE `senders` (
	`address` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`status` text DEFAULT 'unknown' NOT NULL,
	`email_count` integer DEFAULT 0,
	`first_seen` text DEFAULT (datetime('now')) NOT NULL,
	`last_seen` text DEFAULT (datetime('now')) NOT NULL,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
