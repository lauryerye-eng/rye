export type Priority = "low" | "medium" | "high";
export type AssignmentStatus = "pending" | "in_progress" | "completed" | "overdue";
export type StudySessionStatus = "planned" | "completed" | "skipped";

export interface Subject {
  id: string;
  name: string;
  color: string; // tailwind color key e.g. "blue", "green", "purple"
  creditHours: number;
  gradeGoal: number; // 0-100
  examBoard: string; // UK exam board: AQA, Edexcel, OCR, WJEC, CCEA
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  priority: Priority;
  status: AssignmentStatus;
  weight: number; // % of final grade
  score: number | null; // 0-100 or null if not graded
  createdAt: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string; // ISO date string
  location: string;
  weight: number; // % of final grade
  score: number | null; // 0-100 or null if not taken
  notes: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  title: string;
  date: string; // ISO date string
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  status: StudySessionStatus;
  notes: string;
}

export interface GradeEntry {
  id: string;
  subjectId: string;
  title: string;
  type: "assignment" | "exam" | "quiz" | "project" | "participation" | "other";
  weight: number; // % of final grade
  score: number | null; // 0-100 or null if not yet graded
  maxScore: number; // usually 100
  date: string; // ISO date string
}

export interface AppState {
  subjects: Subject[];
  assignments: Assignment[];
  exams: Exam[];
  studySessions: StudySession[];
  gradeEntries: GradeEntry[];
}
