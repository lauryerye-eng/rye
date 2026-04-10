"use client";

import { useApp, calcCurrentGrade, daysUntil } from "@/lib/store";
import { getColorClasses } from "@/lib/colors";
import type { Tab } from "./Nav";

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { state } = useApp();
  const { subjects, assignments, exams, studySessions, gradeEntries } = state;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingAssignments = assignments.filter(
    (a) => a.status !== "completed" && a.status !== "overdue"
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const upcomingExams = exams
    .filter((e) => e.score === null && daysUntil(e.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const todaySessions = studySessions.filter((s) => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime() && s.status === "planned";
  });

  const urgentAssignments = pendingAssignments.filter((a) => {
    const days = daysUntil(a.dueDate);
    return days <= 3 && days >= 0;
  });

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Pending"
          value={pendingAssignments.length}
          sub="assignments"
          color="amber"
          onClick={() => onNavigate("assignments")}
        />
        <StatCard
          label="Upcoming"
          value={upcomingExams.length}
          sub="exams"
          color="rose"
          onClick={() => onNavigate("exams")}
        />
        <StatCard
          label="Today"
          value={todaySessions.length}
          sub="study sessions"
          color="blue"
          onClick={() => onNavigate("study")}
        />
        <StatCard
          label="Subjects"
          value={subjects.length}
          sub="tracked"
          color="violet"
          onClick={() => onNavigate("grades")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Urgent assignments */}
        <div className="bg-pink-950/30 border border-pink-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-pink-100 text-sm">Due Soon</h2>
            <button
              onClick={() => onNavigate("assignments")}
              className="text-xs text-pink-400 hover:text-pink-100 transition-colors"
            >
              View all →
            </button>
          </div>
          {urgentAssignments.length === 0 ? (
            <p className="text-pink-600 text-sm">No assignments due in the next 3 days.</p>
          ) : (
            <div className="space-y-2">
              {urgentAssignments.map((a) => {
                const subject = subjects.find((s) => s.id === a.subjectId);
                const c = getColorClasses(subject?.color ?? "blue");
                const days = daysUntil(a.dueDate);
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-pink-900/20 border border-pink-900"
                  >
                    <div className={`w-1.5 h-full min-h-8 rounded-full shrink-0 ${c.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-pink-100 text-sm font-medium truncate">{a.title}</p>
                      <p className={`text-xs mt-0.5 ${c.text}`}>{subject?.name}</p>
                    </div>
                    <div className={`text-xs font-semibold shrink-0 px-2 py-0.5 rounded-md ${
                      days === 0 ? "bg-rose-500/20 text-rose-300" :
                      days === 1 ? "bg-amber-500/20 text-amber-300" :
                      "bg-neutral-700 text-neutral-300"
                    }`}>
                      {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Exam countdowns */}
        <div className="bg-pink-950/30 border border-pink-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-pink-100 text-sm">Exam Countdown</h2>
            <button
              onClick={() => onNavigate("exams")}
              className="text-xs text-pink-400 hover:text-pink-100 transition-colors"
            >
              View all →
            </button>
          </div>
          {upcomingExams.length === 0 ? (
            <p className="text-pink-600 text-sm">No upcoming exams.</p>
          ) : (
            <div className="space-y-2">
              {upcomingExams.map((exam) => {
                const subject = subjects.find((s) => s.id === exam.subjectId);
                const c = getColorClasses(subject?.color ?? "blue");
                const days = daysUntil(exam.date);
                const urgency =
                  days <= 3 ? "text-rose-400" :
                  days <= 7 ? "text-amber-400" :
                  "text-neutral-300";
                return (
                  <div
                    key={exam.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-pink-900/20 border border-pink-900"
                  >
                    <div className={`w-10 h-10 rounded-lg shrink-0 flex flex-col items-center justify-center text-xs font-bold ${c.bgLight} ${c.text}`}>
                      <span className="text-lg leading-none font-black">{days}</span>
                      <span className="opacity-70">days</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-pink-100 text-sm font-medium truncate">{exam.title}</p>
                      <p className={`text-xs mt-0.5 ${c.text}`}>{subject?.name}</p>
                    </div>
                    <span className={`text-xs font-medium shrink-0 ${urgency}`}>
                      {new Date(exam.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Subject grade overview */}
      <div className="bg-pink-950/30 border border-pink-900 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-pink-100 text-sm">Grade Overview</h2>
          <button
            onClick={() => onNavigate("grades")}
            className="text-xs text-pink-400 hover:text-pink-100 transition-colors"
          >
            Details →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {subjects.map((subject) => {
            const current = calcCurrentGrade(gradeEntries, subject.id);
            const c = getColorClasses(subject.color);
            const pct = current ?? 0;
            const onTrack = current !== null && current >= subject.gradeGoal;
            return (
              <div key={subject.id} className={`rounded-lg border p-3 ${c.bgLight} ${c.border}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${c.text}`}>{subject.name}</span>
                  {current !== null && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${onTrack ? "bg-green-600/20 text-green-400" : "bg-rose-600/20 text-rose-400"}`}>
                      {onTrack ? "On track" : "Below goal"}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-pink-400 mb-1">
                    <span>Current: {current !== null ? `${current.toFixed(1)}%` : "—"}</span>
                    <span>Goal: {subject.gradeGoal}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-pink-800/30 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${c.bg}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  {/* Goal marker */}
                  <div className="relative h-0">
                    <div
                      className="absolute top-[-6px] w-0.5 h-3 bg-white/40 rounded"
                      style={{ left: `calc(${subject.gradeGoal}% - 1px)` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's study plan */}
      {todaySessions.length > 0 && (
        <div className="bg-pink-950/30 border border-pink-900 rounded-xl p-4">
          <h2 className="font-semibold text-pink-100 text-sm mb-3">Today&apos;s Study Plan</h2>
          <div className="space-y-2">
            {todaySessions.map((session) => {
              const subject = subjects.find((s) => s.id === session.subjectId);
              const c = getColorClasses(subject?.color ?? "blue");
              return (
                <div key={session.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-pink-900/20 border border-pink-900">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-pink-100 text-sm font-medium">{session.title}</p>
                    <p className={`text-xs ${c.text}`}>{subject?.name}</p>
                  </div>
                  <span className="text-xs text-pink-400 shrink-0">
                    {session.startTime} – {session.endTime}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, sub, color, onClick,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
  onClick: () => void;
}) {
  const c = getColorClasses(color);
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${c.bgLight} ${c.border} hover:bg-white/5`}
    >
      <div className={`text-2xl font-black ${c.text}`}>{value}</div>
      <div className="text-pink-100 text-sm font-medium mt-0.5">{label}</div>
      <div className="text-pink-600 text-xs">{sub}</div>
    </button>
  );
}
