import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const subjects = sqliteTable("subjects", {
  id: text("id").notNull().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  color: text("color").notNull(),
  currentGrade: integer("current_grade"),
  gradeGoal: integer("grade_goal").notNull(),
  examBoard: text("exam_board").notNull(),
  examSpec: text("exam_spec"),
});

export const gradeEntries = sqliteTable("grade_entries", {
  id: text("id").notNull().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subjectId: text("subject_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  weight: integer("weight").notNull(),
  score: integer("score"),
  maxScore: integer("max_score").notNull(),
  date: text("date").notNull(),
});

export const assignments = sqliteTable("assignments", {
  id: text("id").notNull().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subjectId: text("subject_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: text("due_date").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  weight: integer("weight").notNull(),
  score: integer("score"),
  createdAt: text("created_at").notNull(),
});

export const exams = sqliteTable("exams", {
  id: text("id").notNull().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subjectId: text("subject_id").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location"),
  weight: integer("weight").notNull(),
  score: integer("score"),
  notes: text("notes"),
});

export const studySessions = sqliteTable("study_sessions", {
  id: text("id").notNull().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subjectId: text("subject_id").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
});