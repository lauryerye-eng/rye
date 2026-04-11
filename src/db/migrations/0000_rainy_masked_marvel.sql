CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`subject_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`due_date` text NOT NULL,
	`priority` text NOT NULL,
	`status` text NOT NULL,
	`weight` integer NOT NULL,
	`score` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`subject_id` text NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`location` text,
	`weight` integer NOT NULL,
	`score` integer,
	`notes` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `grade_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`subject_id` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`weight` integer NOT NULL,
	`score` integer,
	`max_score` integer NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`subject_id` text NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`status` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`current_grade` integer,
	`grade_goal` integer NOT NULL,
	`exam_board` text NOT NULL,
	`exam_spec` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);