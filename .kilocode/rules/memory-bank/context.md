# Active Context: Next.js Starter Template

## Current State

**App Status**: ✅ StudySync — Assignment & Grade Tracker fully built

A complete student productivity app built on the Next.js starter. All core features are implemented and passing typecheck + lint.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] StudySync app — full assignment/exam/study/grade tracker
- [x] Pink and black theme applied to all components

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Renders AppShell | ✅ Done |
| `src/app/layout.tsx` | Root layout with StudySync metadata | ✅ Done |
| `src/app/globals.css` | Global styles | ✅ Done |
| `src/lib/types.ts` | TypeScript types for all entities | ✅ Done |
| `src/lib/store.tsx` | AppContext with useReducer + localStorage | ✅ Done |
| `src/lib/colors.ts` | Subject color utility classes | ✅ Done |
| `src/components/AppShell.tsx` | Root shell wrapping AppProvider + Nav | ✅ Done |
| `src/components/Nav.tsx` | Top navigation bar with 5 tabs | ✅ Done |
| `src/components/Dashboard.tsx` | Overview: stats, due soon, countdowns, grades | ✅ Done |
| `src/components/AssignmentTracker.tsx` | CRUD assignments, status/priority, filtering | ✅ Done |
| `src/components/ExamCountdown.tsx` | Countdown cards with urgency colors | ✅ Done |
| `src/components/StudyPlanner.tsx` | Week calendar + list view for study sessions | ✅ Done |
| `src/components/GradeTracker.tsx` | Per-subject: current grade, prediction, goal, breakdown | ✅ Done |

## Current Focus

The app is complete. Potential extensions:
- Add GPA calculator across all subjects
- Export to PDF/CSV
- Notification reminders
- Dark/light theme toggle

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-04-10 | Built full StudySync app: assignments, exams, study planner, grade tracker |
