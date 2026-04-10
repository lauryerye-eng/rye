"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type {
  AppState,
  Subject,
  Assignment,
  Exam,
  StudySession,
  GradeEntry,
} from "./types";

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_SUBJECTS: Subject[] = [
  { id: "s1", name: "Mathematics", color: "blue", creditHours: 4, gradeGoal: 70, examBoard: "Edexcel", examSpec: "Mathematics" },
  { id: "s2", name: "Computer Science", color: "violet", creditHours: 3, gradeGoal: 80, examBoard: "OCR", examSpec: "Computer Science" },
  { id: "s3", name: "Physics", color: "amber", creditHours: 3, gradeGoal: 70, examBoard: "AQA", examSpec: "Physics" },
  { id: "s4", name: "English Literature", color: "green", creditHours: 2, gradeGoal: 70, examBoard: "WJEC", examSpec: "English Literature" },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: "a1", subjectId: "s1", title: "Problem Set 5",
    description: "Chapters 8–10 integration problems",
    dueDate: fmt(addDays(today, 3)), priority: "high", status: "in_progress",
    weight: 10, score: null, createdAt: fmt(today),
  },
  {
    id: "a2", subjectId: "s2", title: "Binary Search Tree Implementation",
    description: "Implement BST with insert, delete, search",
    dueDate: fmt(addDays(today, 7)), priority: "high", status: "pending",
    weight: 15, score: null, createdAt: fmt(today),
  },
  {
    id: "a3", subjectId: "s3", title: "Lab Report — Wave Motion",
    description: "Document experiment results and analysis",
    dueDate: fmt(addDays(today, 5)), priority: "medium", status: "pending",
    weight: 8, score: null, createdAt: fmt(today),
  },
  {
    id: "a4", subjectId: "s4", title: "Essay: Symbolism in Gatsby",
    description: "1500 word analytical essay",
    dueDate: fmt(addDays(today, 10)), priority: "medium", status: "pending",
    weight: 12, score: null, createdAt: fmt(today),
  },
  {
    id: "a5", subjectId: "s1", title: "Problem Set 4",
    description: "Completed differential equations",
    dueDate: fmt(addDays(today, -5)), priority: "medium", status: "completed",
    weight: 10, score: 87, createdAt: fmt(addDays(today, -14)),
  },
];

const SEED_EXAMS: Exam[] = [
  {
    id: "e1", subjectId: "s1", title: "Midterm Exam",
    date: fmt(addDays(today, 14)), time: "09:00", location: "Hall A, Room 201",
    weight: 30, score: null, notes: "Covers chapters 1–10",
  },
  {
    id: "e2", subjectId: "s2", title: "Practical Exam",
    date: fmt(addDays(today, 21)), time: "13:00", location: "CS Lab 3",
    weight: 25, score: null, notes: "Bring student ID",
  },
  {
    id: "e3", subjectId: "s3", title: "Final Exam",
    date: fmt(addDays(today, 35)), time: "09:00", location: "Main Hall",
    weight: 40, score: null, notes: "Comprehensive — all units",
  },
  {
    id: "e4", subjectId: "s4", title: "Midterm",
    date: fmt(addDays(today, -10)), time: "14:00", location: "Room 105",
    weight: 35, score: 82, notes: "",
  },
];

const SEED_SESSIONS: StudySession[] = [
  {
    id: "ss1", subjectId: "s1", title: "Integration Practice",
    date: fmt(addDays(today, 1)), startTime: "09:00", endTime: "11:00",
    status: "planned", notes: "Focus on u-substitution",
  },
  {
    id: "ss2", subjectId: "s2", title: "BST Coding Session",
    date: fmt(addDays(today, 2)), startTime: "14:00", endTime: "16:30",
    status: "planned", notes: "Work through deletion edge cases",
  },
  {
    id: "ss3", subjectId: "s3", title: "Wave Motion Review",
    date: fmt(today), startTime: "10:00", endTime: "12:00",
    status: "planned", notes: "",
  },
  {
    id: "ss4", subjectId: "s1", title: "Derivatives Review",
    date: fmt(addDays(today, -2)), startTime: "09:00", endTime: "10:30",
    status: "completed", notes: "Covered chain rule thoroughly",
  },
];

const SEED_GRADES: GradeEntry[] = [
  { id: "g1", subjectId: "s1", title: "Problem Set 1", type: "assignment", weight: 10, score: 92, maxScore: 100, date: fmt(addDays(today, -60)) },
  { id: "g2", subjectId: "s1", title: "Problem Set 2", type: "assignment", weight: 10, score: 88, maxScore: 100, date: fmt(addDays(today, -45)) },
  { id: "g3", subjectId: "s1", title: "Problem Set 3", type: "assignment", weight: 10, score: 95, maxScore: 100, date: fmt(addDays(today, -30)) },
  { id: "g4", subjectId: "s1", title: "Problem Set 4", type: "assignment", weight: 10, score: 87, maxScore: 100, date: fmt(addDays(today, -5)) },
  { id: "g5", subjectId: "s1", title: "Quiz 1", type: "quiz", weight: 5, score: 90, maxScore: 100, date: fmt(addDays(today, -50)) },
  { id: "g6", subjectId: "s2", title: "Project 1 — Linked List", type: "project", weight: 20, score: 96, maxScore: 100, date: fmt(addDays(today, -40)) },
  { id: "g7", subjectId: "s2", title: "Quiz 1", type: "quiz", weight: 10, score: 88, maxScore: 100, date: fmt(addDays(today, -25)) },
  { id: "g8", subjectId: "s3", title: "Lab Report 1", type: "assignment", weight: 8, score: 78, maxScore: 100, date: fmt(addDays(today, -35)) },
  { id: "g9", subjectId: "s3", title: "Midterm Quiz", type: "quiz", weight: 12, score: 82, maxScore: 100, date: fmt(addDays(today, -20)) },
  { id: "g10", subjectId: "s4", title: "Essay 1", type: "assignment", weight: 15, score: 91, maxScore: 100, date: fmt(addDays(today, -28)) },
  { id: "g11", subjectId: "s4", title: "Midterm", type: "exam", weight: 35, score: 82, maxScore: 100, date: fmt(addDays(today, -10)) },
];

const INITIAL_STATE: AppState = {
  subjects: SEED_SUBJECTS,
  assignments: SEED_ASSIGNMENTS,
  exams: SEED_EXAMS,
  studySessions: SEED_SESSIONS,
  gradeEntries: SEED_GRADES,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD_SUBJECT"; payload: Subject }
  | { type: "UPDATE_SUBJECT"; payload: Subject }
  | { type: "DELETE_SUBJECT"; payload: string }
  | { type: "ADD_ASSIGNMENT"; payload: Assignment }
  | { type: "UPDATE_ASSIGNMENT"; payload: Assignment }
  | { type: "DELETE_ASSIGNMENT"; payload: string }
  | { type: "ADD_EXAM"; payload: Exam }
  | { type: "UPDATE_EXAM"; payload: Exam }
  | { type: "DELETE_EXAM"; payload: string }
  | { type: "ADD_STUDY_SESSION"; payload: StudySession }
  | { type: "UPDATE_STUDY_SESSION"; payload: StudySession }
  | { type: "DELETE_STUDY_SESSION"; payload: string }
  | { type: "ADD_GRADE_ENTRY"; payload: GradeEntry }
  | { type: "UPDATE_GRADE_ENTRY"; payload: GradeEntry }
  | { type: "DELETE_GRADE_ENTRY"; payload: string }
  | { type: "LOAD_STATE"; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_STATE": return action.payload;
    case "ADD_SUBJECT": return { ...state, subjects: [...state.subjects, action.payload] };
    case "UPDATE_SUBJECT": return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? action.payload : s) };
    case "DELETE_SUBJECT": return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };
    case "ADD_ASSIGNMENT": return { ...state, assignments: [...state.assignments, action.payload] };
    case "UPDATE_ASSIGNMENT": return { ...state, assignments: state.assignments.map(a => a.id === action.payload.id ? action.payload : a) };
    case "DELETE_ASSIGNMENT": return { ...state, assignments: state.assignments.filter(a => a.id !== action.payload) };
    case "ADD_EXAM": return { ...state, exams: [...state.exams, action.payload] };
    case "UPDATE_EXAM": return { ...state, exams: state.exams.map(e => e.id === action.payload.id ? action.payload : e) };
    case "DELETE_EXAM": return { ...state, exams: state.exams.filter(e => e.id !== action.payload) };
    case "ADD_STUDY_SESSION": return { ...state, studySessions: [...state.studySessions, action.payload] };
    case "UPDATE_STUDY_SESSION": return { ...state, studySessions: state.studySessions.map(s => s.id === action.payload.id ? action.payload : s) };
    case "DELETE_STUDY_SESSION": return { ...state, studySessions: state.studySessions.filter(s => s.id !== action.payload) };
    case "ADD_GRADE_ENTRY": return { ...state, gradeEntries: [...state.gradeEntries, action.payload] };
    case "UPDATE_GRADE_ENTRY": return { ...state, gradeEntries: state.gradeEntries.map(g => g.id === action.payload.id ? action.payload : g) };
    case "DELETE_GRADE_ENTRY": return { ...state, gradeEntries: state.gradeEntries.filter(g => g.id !== action.payload) };
    default: return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "studysync_data";

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        dispatch({ type: "LOAD_STATE", payload: parsed });
      }
    } catch {
      // ignore parse errors, use seed data
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

// ─── Helper hooks ─────────────────────────────────────────────────────────────

export function useSubject(id: string) {
  const { state } = useApp();
  return state.subjects.find(s => s.id === id);
}

/** Calculate current weighted average for a subject (graded entries only) */
export function calcCurrentGrade(gradeEntries: GradeEntry[], subjectId: string): number | null {
  const entries = gradeEntries.filter(g => g.subjectId === subjectId && g.score !== null);
  if (entries.length === 0) return null;
  const totalWeight = entries.reduce((sum, g) => sum + g.weight, 0);
  if (totalWeight === 0) return null;
  const weighted = entries.reduce((sum, g) => sum + (g.score! / g.maxScore) * 100 * g.weight, 0);
  return weighted / totalWeight;
}

/** Predict final grade assuming average performance on remaining items */
export function predictFinalGrade(gradeEntries: GradeEntry[], subjectId: string): number | null {
  const allEntries = gradeEntries.filter(g => g.subjectId === subjectId);
  if (allEntries.length === 0) return null;

  const graded = allEntries.filter(g => g.score !== null);
  const ungraded = allEntries.filter(g => g.score === null);

  const gradedWeight = graded.reduce((sum, g) => sum + g.weight, 0);
  const ungradedWeight = ungraded.reduce((sum, g) => sum + g.weight, 0);

  const currentScore = graded.length > 0
    ? graded.reduce((sum, g) => sum + (g.score! / g.maxScore) * 100 * g.weight, 0) / gradedWeight
    : null;

  if (currentScore === null) return null;
  if (ungradedWeight === 0) return currentScore;

  // Assume average performance on remaining
  const predictedTotal =
    (currentScore * gradedWeight + currentScore * ungradedWeight) / (gradedWeight + ungradedWeight);
  return predictedTotal;
}

/** Grade letter from score (UK grades: U, 1-9) */
export function gradeLetterFromScore(score: number): string {
  if (score >= 90) return "9";
  if (score >= 80) return "8";
  if (score >= 70) return "7";
  if (score >= 60) return "6";
  if (score >= 50) return "5";
  if (score >= 40) return "4";
  if (score >= 30) return "3";
  if (score >= 20) return "2";
  if (score >= 10) return "1";
  return "U";
}

/** Days until date */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Generate a random ID */
export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}
