CREATE TABLE `admin_users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `name` text NOT NULL,
  `password_hash` text NOT NULL,
  `password_salt` text NOT NULL,
  `active` integer DEFAULT 1 NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_admin_users_email` ON `admin_users` (`email`);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
  `token_hash` text PRIMARY KEY NOT NULL,
  `user_id` integer NOT NULL REFERENCES `admin_users`(`id`) ON DELETE CASCADE,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admin_sessions_user_id` ON `admin_sessions` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_admin_sessions_expires_at` ON `admin_sessions` (`expires_at`);
