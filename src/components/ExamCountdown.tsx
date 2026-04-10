"use client";

import { useState, useRef } from "react";
import { useApp, genId, daysUntil } from "@/lib/store";
import { getColorClasses } from "@/lib/colors";
import { processGCSEImage } from "@/lib/ocr";
import type { Exam } from "@/lib/types";

export default function ExamCountdown() {
  const { state, dispatch } = useApp();
  const { exams, subjects } = state;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upcoming = exams
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const past = exams
    .filter((e) => daysUntil(e.date) < 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const editingExam = editingId ? exams.find((e) => e.id === editingId) : null;

  function deleteExam(id: string) {
    dispatch({ type: "DELETE_EXAM", payload: id });
  }

  async function handleImageImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;
        const result = await processGCSEImage(imageData);
        
        for (const exam of result.exams) {
          const subjectId = subjects[0]?.id ?? "";
          if (subjectId) {
            dispatch({
              type: "ADD_EXAM",
              payload: {
                id: genId(),
                subjectId,
                title: exam.title,
                date: exam.date,
                time: exam.time,
                location: "",
                weight: 10,
                score: null,
                notes: "Imported from timetable",
              },
            });
          }
        }
        setShowImport(false);
        setImporting(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-pink-100">Exams</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-800 hover:bg-pink-700 text-pink-100 text-sm font-medium rounded-lg transition-colors"
          >
            📷 Import Timetable
          </button>
          <button
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-pink-100 text-sm font-medium rounded-lg transition-colors"
          >
            + Add Exam
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-black border border-pink-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-pink-900">
              <h2 className="font-bold text-pink-100">Import GCSE Timetable</h2>
              <button onClick={() => setShowImport(false)} className="text-pink-400 hover:text-pink-100">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-pink-300 text-sm">
                Take a photo of your GCSE exam timetable and we&apos;ll automatically add all your exams.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageImport}
                className="w-full text-pink-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-pink-100 hover:file:bg-pink-500"
              />
              {importing && (
                <div className="text-center py-4">
                  <div className="animate-spin text-2xl mb-2">⏳</div>
                  <p className="text-pink-400 text-sm">Processing image...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming exams */}
      {upcoming.length === 0 ? (
        <div className="text-center py-12 text-pink-500">
          <div className="text-4xl mb-3">⏰</div>
          <p className="font-medium">No upcoming exams</p>
          <p className="text-sm mt-1">Add an exam to start counting down.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {upcoming.map((exam) => {
            const subject = subjects.find((s) => s.id === exam.subjectId);
            const c = getColorClasses(subject?.color ?? "blue");
            const days = daysUntil(exam.date);
            const urgencyRing =
              days <= 3 ? "border-rose-500/50" :
              days <= 7 ? "border-amber-500/50" :
              days <= 14 ? "border-yellow-500/30" :
              c.border;
            const urgencyBg =
              days <= 3 ? "from-rose-600/10" :
              days <= 7 ? "from-amber-600/10" :
              `from-${subject?.color ?? "blue"}-600/10`;

            return (
              <div
                key={exam.id}
                className={`group relative rounded-xl border-2 p-4 bg-gradient-to-br to-neutral-800/50 transition-colors ${urgencyBg} ${urgencyRing}`}
              >
                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingId(exam.id); setShowForm(true); }}
                    className="p-1.5 rounded-lg bg-pink-950/80 text-pink-400 hover:text-pink-100 text-xs transition-colors"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="p-1.5 rounded-lg bg-pink-950/80 text-pink-400 hover:text-rose-400 text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Countdown */}
                <div className="mb-3">
                  <div className={`text-5xl font-black tabular-nums ${
                    days === 0 ? "text-rose-400" :
                    days <= 3 ? "text-rose-400" :
                    days <= 7 ? "text-amber-400" :
                    c.text
                  }`}>
                    {days}
                  </div>
                  <div className="text-pink-400 text-sm">
                    {days === 0 ? "Today!" : days === 1 ? "day away" : "days away"}
                  </div>
                </div>

                <h3 className="font-bold text-pink-100 text-sm mb-0.5 pr-16 truncate">{exam.title}</h3>
                <p className={`text-xs font-medium ${c.text} mb-2`}>{subject?.name}</p>

                <div className="space-y-1 text-xs text-pink-400">
                  <div className="flex items-center gap-1.5">
                    <span>📅</span>
                    <span>{new Date(exam.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                    {exam.time && <span>• {exam.time}</span>}
                  </div>
                  {exam.location && (
                    <div className="flex items-center gap-1.5">
                      <span>📍</span>
                      <span className="truncate">{exam.location}</span>
                    </div>
                  )}

                </div>

                {exam.notes && (
                  <p className="mt-2 text-xs text-pink-500 border-t border-pink-900 pt-2 line-clamp-2">
                    {exam.notes}
                  </p>
                )}

                {/* Progress bar for urgency */}
                <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      days <= 3 ? "bg-rose-500" :
                      days <= 7 ? "bg-amber-500" :
                      days <= 14 ? "bg-yellow-500" :
                      c.bg
                    }`}
                    style={{ width: `${Math.max(5, 100 - Math.min(days, 60) / 60 * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past exams toggle */}
      {past.length > 0 && (
        <div>
          <button
            onClick={() => setShowPast(!showPast)}
            className="text-sm text-pink-400 hover:text-pink-100 transition-colors flex items-center gap-1.5"
          >
            <span className={`transition-transform ${showPast ? "rotate-90" : ""}`}>▶</span>
            {showPast ? "Hide" : "Show"} past exams ({past.length})
          </button>

          {showPast && (
            <div className="mt-3 space-y-2">
              {past.map((exam) => {
                const subject = subjects.find((s) => s.id === exam.subjectId);
                const c = getColorClasses(subject?.color ?? "blue");
                return (
                  <div key={exam.id} className="group flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-pink-900 opacity-70">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-pink-100 text-sm font-medium truncate">{exam.title}</p>
                      <p className={`text-xs ${c.text}`}>{subject?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-pink-400">
                        {new Date(exam.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      {exam.score !== null ? (
                        <p className="text-sm font-bold text-pink-100">{exam.score}%</p>
                      ) : (
                        <p className="text-xs text-pink-500">No score</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingId(exam.id); setShowForm(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-pink-400 hover:text-pink-100 text-xs"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-600/20 text-pink-400 hover:text-rose-400 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <ExamForm
          exam={editingExam ?? null}
          subjects={subjects}
          onClose={() => { setShowForm(false); setEditingId(null); }}
          onSave={(data) => {
            if (editingExam) {
              dispatch({ type: "UPDATE_EXAM", payload: { ...editingExam, ...data } });
            } else {
              dispatch({ type: "ADD_EXAM", payload: { id: genId(), ...data } });
            }
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

type ExamFormData = Omit<Exam, "id">;

function ExamForm({
  exam, subjects, onClose, onSave,
}: {
  exam: Exam | null;
  subjects: { id: string; name: string }[];
  onClose: () => void;
  onSave: (data: ExamFormData) => void;
}) {
  const [form, setForm] = useState<ExamFormData>({
    subjectId: exam?.subjectId ?? (subjects[0]?.id ?? ""),
    title: exam?.title ?? "",
    date: exam?.date ?? new Date().toISOString().split("T")[0],
    time: exam?.time ?? "09:00",
    location: exam?.location ?? "",
    weight: exam?.weight ?? 30,
    score: exam?.score ?? null,
    notes: exam?.notes ?? "",
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
          <h2 className="font-bold text-pink-100">{exam ? "Edit Exam" : "New Exam"}</h2>
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
              placeholder="e.g. Midterm Exam"
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
          <div className="grid grid-cols-3 gap-3">
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
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Weight (%)</label>
              <input
                type="number"
                min={0} max={100}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="e.g. Hall A, Room 201"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Score (if taken)</label>
            <input
              type="number"
              min={0} max={100}
              value={form.score ?? ""}
              onChange={(e) => setForm({ ...form, score: e.target.value === "" ? null : Number(e.target.value) })}
              className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="Leave blank if not taken yet"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-pink-950 border border-white/10 text-pink-100 text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-pink-500"
              placeholder="Topics covered, reminders..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-pink-950 text-neutral-300 text-sm font-medium hover:bg-neutral-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-pink-600 text-pink-100 text-sm font-medium hover:bg-pink-500 transition-colors">
              {exam ? "Save Changes" : "Add Exam"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
