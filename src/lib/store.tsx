"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { db } from "@/db";
import { subjects as subjectsTable, gradeEntries as gradeEntriesTable, assignments as assignmentsTable, exams as examsTable, studySessions as studySessionsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type {
  Subject,
  Assignment,
  Exam,
  StudySession,
  GradeEntry,
} from "./types";

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

interface AppState {
  subjects: Subject[];
  assignments: Assignment[];
  exams: Exam[];
  studySessions: StudySession[];
  gradeEntries: GradeEntry[];
}

const EMPTY_STATE: AppState = {
  subjects: [],
  assignments: [],
  exams: [],
  studySessions: [],
  gradeEntries: [],
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

async function loadUserData(userId: number): Promise<AppState> {
  const userSubjects = await db.select().from(subjectsTable).where(eq(subjectsTable.userId, userId));
  const userGradeEntries = await db.select().from(gradeEntriesTable).where(eq(gradeEntriesTable.userId, userId));
  const userAssignments = await db.select().from(assignmentsTable).where(eq(assignmentsTable.userId, userId));
  const userExams = await db.select().from(examsTable).where(eq(examsTable.userId, userId));
  const userSessions = await db.select().from(studySessionsTable).where(eq(studySessionsTable.userId, userId));

  if (userSubjects.length === 0) {
    const seedSubjects = [
      { name: "Mathematics", color: "blue", currentGrade: 75, gradeGoal: 70, examBoard: "Edexcel", examSpec: "Mathematics" },
      { name: "Computer Science", color: "violet", currentGrade: 82, gradeGoal: 80, examBoard: "OCR", examSpec: "Computer Science" },
      { name: "Physics", color: "amber", currentGrade: 68, gradeGoal: 70, examBoard: "AQA", examSpec: "Physics" },
    ];
    
    for (const s of seedSubjects) {
      await db.insert(subjectsTable).values({
        id: genId(),
        userId,
        name: s.name,
        color: s.color,
        currentGrade: s.currentGrade,
        gradeGoal: s.gradeGoal,
        examBoard: s.examBoard,
        examSpec: s.examSpec,
      });
    }

    const newSubjects = await db.select().from(subjectsTable).where(eq(subjectsTable.userId, userId));
    return {
      subjects: newSubjects.map((s: typeof subjectsTable.$inferSelect) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        currentGrade: s.currentGrade,
        gradeGoal: s.gradeGoal,
        examBoard: s.examBoard,
        examSpec: s.examSpec ?? "",
      })),
      gradeEntries: [],
      assignments: [],
      exams: [],
      studySessions: [],
    };
  }

  return {
    subjects: userSubjects.map((s: typeof subjectsTable.$inferSelect) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      currentGrade: s.currentGrade,
      gradeGoal: s.gradeGoal,
      examBoard: s.examBoard,
      examSpec: s.examSpec ?? "",
    })),
    gradeEntries: userGradeEntries.map((g: typeof gradeEntriesTable.$inferSelect) => ({
      id: g.id,
      subjectId: g.subjectId,
      title: g.title,
      type: g.type as GradeEntry["type"],
      weight: g.weight,
      score: g.score,
      maxScore: g.maxScore,
      date: g.date,
    })),
    assignments: userAssignments.map((a: typeof assignmentsTable.$inferSelect) => ({
      id: a.id,
      subjectId: a.subjectId,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      priority: a.priority as Assignment["priority"],
      status: a.status as Assignment["status"],
      weight: a.weight,
      score: a.score,
      createdAt: a.createdAt,
    })),
    exams: userExams.map((e: typeof examsTable.$inferSelect) => ({
      id: e.id,
      subjectId: e.subjectId,
      title: e.title,
      date: e.date,
      time: e.time,
      location: e.location ?? "",
      weight: e.weight,
      score: e.score,
      notes: e.notes ?? "",
    })),
    studySessions: userSessions.map((s: typeof studySessionsTable.$inferSelect) => ({
      id: s.id,
      subjectId: s.subjectId,
      title: s.title,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status as StudySession["status"],
      notes: s.notes ?? "",
    })),
  };
}

export function AppProvider({ children, userId }: { children: ReactNode; userId: number }) {
  const [state, dispatch] = useReducer(reducer, EMPTY_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadUserData(userId).then((data) => {
      dispatch({ type: "LOAD_STATE", payload: data });
      setLoaded(true);
    });
  }, [userId]);

  if (!loaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-pink-400">Loading...</div>;
  }

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
