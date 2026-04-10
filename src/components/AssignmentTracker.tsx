"use client";

import { useState } from "react";
import { useApp, genId, daysUntil } from "@/lib/store";
import { getColorClasses } from "@/lib/colors";
import type { Assignment, AssignmentStatus, Priority } from "@/lib/types";

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-neutral-700 text-pink-200",
  medium: "bg-amber-600/20 text-amber-300 border border-amber-600/30",
  high: "bg-rose-600/20 text-rose-300 border border-rose-600/30",
};

export default function AssignmentTracker() {
  const { state, dispatch } = useApp();
  const { assignments, subjects } = state;

  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | "all">("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = assignments
    .filter((a) => filterStatus === "all" || a.status === filterStatus)
    .filter((a) => filterSubject === "all" || a.subjectId === filterSubject)
    .sort((a, b) => {
      // pending/in_progress first, then by due date
      const statusOrder: Record<AssignmentStatus, number> = { overdue: 0, in_progress: 1, pending: 2, completed: 3 };
      const so = statusOrder[a.status] - statusOrder[b.status];
      if (so !== 0) return so;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  function markStatus(id: string, status: AssignmentStatus) {
    const a = assignments.find((x) => x.id === id);
    if (!a) return;
    dispatch({ type: "UPDATE_ASSIGNMENT", payload: { ...a, status } });
  }

  function deleteAssignment(id: string) {
    dispatch({ type: "DELETE_ASSIGNMENT", payload: id });
  }

  const editingAssignment = editingId ? assignments.find((a) => a.id === editingId) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-lg font-bold text-pink-100">Assignments</h1>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-pink-100 text-sm font-medium rounded-lg transition-colors"
        >
          + Add Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as AssignmentStatus | "all")}
          className="bg-pink-950 border border-pink-800 text-pink-200 text-sm rounded-lg px-3 py-1.5"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="bg-pink-950 border border-pink-800 text-pink-200 text-sm rounded-lg px-3 py-1.5"
        >
          <option value="all">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-pink-500">
          <div className="text-4xl mb-3">✓</div>
          <p className="font-medium">No assignments found</p>
          <p className="text-sm mt-1">Add one or adjust your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => {
            const subject = subjects.find((s) => s.id === a.subjectId);
            const c = getColorClasses(subject?.color ?? "blue");
            const days = daysUntil(a.dueDate);
            const isOverdue = days < 0 && a.status !== "completed";
            return (
              <div
                key={a.id}
                className={`group flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  a.status === "completed"
                    ? "bg-white/2 border-pink-900 opacity-60"
                    : "bg-pink-950/50 border-pink-900 hover:border-pink-800"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => markStatus(a.id, a.status === "completed" ? "pending" : "completed")}
                  className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    a.status === "completed"
                      ? "bg-green-600 border-green-600 text-pink-100"
                      : "border-neutral-600 hover:border-violet-500"
                  }`}
                >
                  {a.status === "completed" && <span className="text-xs leading-none">✓</span>}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className={`text-sm font-medium text-pink-100 ${a.status === "completed" ? "line-through" : ""}`}>
                      {a.title}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[a.priority]}`}>
                      {a.priority}
                    </span>
                    {a.status === "in_progress" && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-600/30 font-medium">
                        In Progress
                      </span>
                    )}
                  </div>
                  {a.description && (
                    <p className="text-xs text-pink-400 mt-0.5 truncate">{a.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className={`text-xs font-medium ${c.text}`}>{subject?.name ?? "—"}</span>
                    <span className={`text-xs font-semibold ${
                      a.status === "completed" ? "text-pink-500" :
                      isOverdue ? "text-rose-400" :
                      days <= 2 ? "text-amber-400" :
                      "text-pink-400"
                    }`}>
                      {a.status === "completed"
                        ? `Submitted · ${a.score !== null ? `${a.score}%` : "Not graded"}`
                        : isOverdue
                        ? `Overdue by ${Math.abs(days)}d`
                        : days === 0 ? "Due today"
                        : days === 1 ? "Due tomorrow"
                        : `Due in ${days}d`}
                    </span>
                    <span className="text-xs text-neutral-600">Weight: {a.weight}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {a.status !== "completed" && a.status !== "in_progress" && (
                    <button
                      onClick={() => markStatus(a.id, "in_progress")}
                      title="Mark as in progress"
                      className="text-xs px-2 py-1 rounded-md bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 transition-colors"
                    >
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingId(a.id); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-pink-800/30 text-pink-400 hover:text-pink-100 transition-colors text-sm"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteAssignment(a.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-600/20 text-pink-400 hover:text-rose-400 transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <AssignmentForm
          assignment={editingAssignment ?? null}
          subjects={subjects}
          onClose={() => { setShowForm(false); setEditingId(null); }}
          onSave={(data) => {
            if (editingAssignment) {
              dispatch({ type: "UPDATE_ASSIGNMENT", payload: { ...editingAssignment, ...data } });
            } else {
              dispatch({
                type: "ADD_ASSIGNMENT",
                payload: {
                  id: genId(),
                  createdAt: new Date().toISOString().split("T")[0],
                  ...data,
                },
              });
            }
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

type AssignmentFormData = Omit<Assignment, "id" | "createdAt">;

function AssignmentForm({
  assignment, subjects, onClose, onSave,
}: {
  assignment: Assignment | null;
  subjects: { id: string; name: string; color: string }[];
  onClose: () => void;
  onSave: (data: AssignmentFormData) => void;
}) {
  const [form, setForm] = useState<AssignmentFormData>({
    subjectId: assignment?.subjectId ?? (subjects[0]?.id ?? ""),
    title: assignment?.title ?? "",
    description: assignment?.description ?? "",
    dueDate: assignment?.dueDate ?? new Date().toISOString().split("T")[0],
    priority: assignment?.priority ?? "medium",
    status: assignment?.status ?? "pending",
    weight: assignment?.weight ?? 10,
    score: assignment?.score ?? null,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.subjectId) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-black border border-pink-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-pink-900">
          <h2 className="font-bold text-pink-100">{assignment ? "Edit Assignment" : "New Assignment"}</h2>
          <button onClick={onClose} className="text-pink-400 hover:text-pink-100 transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="Assignment title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Subject *</label>
            <select
              required
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2"
            >
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-pink-500"
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Due Date *</label>
              <input
                required
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Weight (%)</label>
              <input
                type="number"
                min={0} max={100}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AssignmentStatus })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2"
              >
                {(Object.keys(STATUS_LABELS) as AssignmentStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
          {form.status === "completed" && (
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Score (0–100)</label>
              <input
                type="number"
                min={0} max={100}
                value={form.score ?? ""}
                onChange={(e) => setForm({ ...form, score: e.target.value === "" ? null : Number(e.target.value) })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
                placeholder="e.g. 88"
              />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-pink-950 text-pink-200 text-sm font-medium hover:bg-neutral-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-pink-600 text-pink-100 text-sm font-medium hover:bg-pink-500 transition-colors">
              {assignment ? "Save Changes" : "Add Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
