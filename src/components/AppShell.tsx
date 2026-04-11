"use client";

import { useState } from "react";
import { AppProvider } from "@/lib/store";
import Nav, { type Tab } from "./Nav";
import Dashboard from "./Dashboard";
import AssignmentTracker from "./AssignmentTracker";
import ExamCountdown from "./ExamCountdown";
import StudyPlanner from "./StudyPlanner";
import GradeTracker from "./GradeTracker";

export default function AppShell({ userId }: { userId: number }) {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <AppProvider userId={userId}>
      <div className="min-h-screen bg-black text-pink-100">
        <Nav active={tab} onChange={setTab} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {tab === "dashboard" && <Dashboard onNavigate={setTab} />}
          {tab === "assignments" && <AssignmentTracker />}
          {tab === "exams" && <ExamCountdown />}
          {tab === "study" && <StudyPlanner />}
          {tab === "grades" && <GradeTracker />}
        </main>
      </div>
    </AppProvider>
  );
}
