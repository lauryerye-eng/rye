"use client";

import { useState } from "react";
import { useApp, genId } from "@/lib/store";
import { getColorClasses } from "@/lib/colors";
import type { StudySession, StudySessionStatus } from "@/lib/types";

function formatDuration(start: string, end: string): string {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const totalMin = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMin <= 0) return "";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

function getWeekDates(base: Date): Date[] {
  const start = new Date(base);
  const day = start.getDay(); // 0 = Sun
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudyPlanner() {
  const { state, dispatch } = useApp();
  const { studySessions, subjects } = state;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<"week" | "list">("week");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(baseDate);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  function sessionsForDay(date: Date): StudySession[] {
    const dateStr = fmt(date);
    return studySessions
      .filter((s) => s.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  function toggleStatus(session: StudySession) {
    const next: StudySessionStatus =
      session.status === "planned" ? "completed" :
      session.status === "completed" ? "skipped" : "planned";
    dispatch({ type: "UPDATE_STUDY_SESSION", payload: { ...session, status: next } });
  }

  const editingSession = editingId ? studySessions.find((s) => s.id === editingId) : null;

  const sortedSessions = [...studySessions].sort(
    (a, b) => new Date(a.date + "T" + a.startTime).getTime() - new Date(b.date + "T" + b.startTime).getTime()
  );

  const totalHoursThisWeek = weekDates.reduce((sum, d) => {
    return sum + sessionsForDay(d)
      .filter(s => s.status !== "skipped")
      .reduce((s2, sess) => {
        const [sh, sm] = sess.startTime.split(":").map(Number);
        const [eh, em] = sess.endTime.split(":").map(Number);
        const min = (eh * 60 + em) - (sh * 60 + sm);
        return s2 + Math.max(0, min);
      }, 0);
  }, 0) / 60;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-lg font-bold text-pink-100">Study Planner</h1>
          <p className="text-xs text-pink-400 mt-0.5">
            {totalHoursThisWeek.toFixed(1)}h planned this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-pink-950 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${view === "week" ? "bg-white/10 text-pink-100" : "text-pink-400 hover:text-pink-100"}`}
            >
              Week
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${view === "list" ? "bg-white/10 text-pink-100" : "text-pink-400 hover:text-pink-100"}`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-pink-100 text-sm font-medium rounded-lg transition-colors"
          >
            + Add Session
          </button>
        </div>
      </div>

      {/* Week view */}
      {view === "week" && (
        <div>
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-pink-400 hover:text-pink-100 transition-colors"
            >
              ←
            </button>
            <div className="text-sm font-medium text-pink-100">
              {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
              {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {weekOffset === 0 && <span className="ml-2 text-xs text-violet-400">(This week)</span>}
            </div>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-pink-400 hover:text-pink-100 transition-colors"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((date, i) => {
              const isToday = fmt(date) === fmt(today);
              const sessions = sessionsForDay(date);
              return (
                <div key={i} className={`rounded-xl border min-h-24 p-1.5 transition-colors ${
                  isToday ? "bg-pink-600/10 border-violet-600/30" : "bg-pink-950/30 border-pink-900"
                }`}>
                  <div className={`text-center mb-1.5 ${isToday ? "text-violet-400" : "text-pink-400"}`}>
                    <div className="text-xs font-medium">{DAY_LABELS[date.getDay()]}</div>
                    <div className={`text-base font-bold leading-tight ${isToday ? "text-pink-100" : ""}`}>
                      {date.getDate()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {sessions.map((session) => {
                      const subject = subjects.find(s => s.id === session.subjectId);
                      const c = getColorClasses(subject?.color ?? "blue");
                      return (
                        <button
                          key={session.id}
                          onClick={() => toggleStatus(session)}
                          title={`${session.title} · ${session.startTime}–${session.endTime}\nClick to toggle status`}
                          className={`w-full text-left px-1.5 py-1 rounded-md text-xs font-medium transition-colors ${
                            session.status === "completed" ? "bg-green-600/20 text-green-400 line-through opacity-60" :
                            session.status === "skipped" ? "bg-neutral-700/50 text-pink-500 line-through opacity-50" :
                            `${c.bgLight} ${c.text}`
                          }`}
                        >
                          <div className="truncate">{session.title}</div>
                          <div className="opacity-70 font-normal">{session.startTime}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-pink-600 mt-2 text-center">Click a session to cycle its status: planned → completed → skipped</p>
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="space-y-2">
          {sortedSessions.length === 0 ? (
            <div className="text-center py-12 text-pink-500">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-medium">No study sessions planned</p>
            </div>
          ) : (
            sortedSessions.map((session) => {
              const subject = subjects.find(s => s.id === session.subjectId);
              const c = getColorClasses(subject?.color ?? "blue");
              const duration = formatDuration(session.startTime, session.endTime);
              const sessionDate = new Date(session.date);
              const isToday = session.date === fmt(today);
              const isPast = new Date(session.date) < today;
              return (
                <div
                  key={session.id}
                  className={`group flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                    session.status === "completed" ? "bg-white/2 border-pink-900 opacity-60" :
                    session.status === "skipped" ? "bg-white/2 border-pink-900 opacity-40" :
                    "bg-pink-950/50 border-pink-900 hover:border-white/10"
                  }`}
                >
                  {/* Status dot */}
                  <button
                    onClick={() => toggleStatus(session)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                      session.status === "completed" ? "bg-green-600 border-green-600 text-pink-100" :
                      session.status === "skipped" ? "bg-neutral-700 border-neutral-600" :
                      `border-neutral-600 hover:${c.border}`
                    }`}
                  >
                    {session.status === "completed" && <span className="text-xs leading-none">✓</span>}
                    {session.status === "skipped" && <span className="text-xs leading-none text-pink-500">–</span>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium text-pink-100 ${session.status !== "planned" ? "line-through" : ""}`}>
                        {session.title}
                      </span>
                      {isToday && <span className="text-xs px-1.5 py-0.5 rounded bg-pink-600/20 text-violet-300 font-medium">Today</span>}
                    </div>
                    <p className={`text-xs mt-0.5 ${c.text}`}>{subject?.name}</p>
                    {session.notes && <p className="text-xs text-pink-500 mt-0.5 truncate">{session.notes}</p>}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-neutral-300">
                      {sessionDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-pink-400">{session.startTime}–{session.endTime}</p>
                    {duration && <p className="text-xs text-pink-500">{duration}</p>}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => { setEditingId(session.id); setShowForm(true); }}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-pink-400 hover:text-pink-100 text-xs"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => dispatch({ type: "DELETE_STUDY_SESSION", payload: session.id })}
                      className="p-1.5 rounded-lg hover:bg-rose-600/20 text-pink-400 hover:text-rose-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <StudySessionForm
          session={editingSession ?? null}
          subjects={subjects}
          onClose={() => { setShowForm(false); setEditingId(null); }}
          onSave={(data) => {
            if (editingSession) {
              dispatch({ type: "UPDATE_STUDY_SESSION", payload: { ...editingSession, ...data } });
            } else {
              dispatch({ type: "ADD_STUDY_SESSION", payload: { id: genId(), ...data } });
            }
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

type StudySessionFormData = Omit<StudySession, "id">;

function StudySessionForm({
  session, subjects, onClose, onSave,
}: {
  session: StudySession | null;
  subjects: { id: string; name: string }[];
  onClose: () => void;
  onSave: (data: StudySessionFormData) => void;
}) {
  const [form, setForm] = useState<StudySessionFormData>({
    subjectId: session?.subjectId ?? (subjects[0]?.id ?? ""),
    title: session?.title ?? "",
    date: session?.date ?? new Date().toISOString().split("T")[0],
    startTime: session?.startTime ?? "09:00",
    endTime: session?.endTime ?? "11:00",
    status: session?.status ?? "planned",
    notes: session?.notes ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.subjectId) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-black border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-pink-900">
          <h2 className="font-bold text-pink-100">{session ? "Edit Session" : "New Study Session"}</h2>
          <button onClick={onClose} className="text-pink-400 hover:text-pink-100 transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="e.g. Integration Practice"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Subject *</label>
            <select
              required
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2"
            >
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Date *</label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Start Time *</label>
              <input
                required
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">End Time *</label>
              <input
                required
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as StudySessionStatus })}
              className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2"
            >
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-pink-500"
              placeholder="What to focus on..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-pink-950 text-neutral-300 text-sm font-medium hover:bg-neutral-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-pink-600 text-pink-100 text-sm font-medium hover:bg-pink-500 transition-colors">
              {session ? "Save Changes" : "Add Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
