"use client";

import { useState } from "react";
import {
  useApp, genId,
  calcCurrentGrade, predictFinalGrade, gradeLetterFromScore,
} from "@/lib/store";
import { getColorClasses, SUBJECT_COLORS } from "@/lib/colors";
import type { GradeEntry, Subject } from "@/lib/types";

const ENTRY_TYPES = ["assignment", "exam", "quiz", "project", "participation", "other"] as const;

export default function GradeTracker() {
  const { state, dispatch } = useApp();
  const { subjects, gradeEntries } = state;

  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id ?? "");
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  const subject = subjects.find((s) => s.id === selectedSubject);
  const c = getColorClasses(subject?.color ?? "blue");

  const subjectEntries = gradeEntries
    .filter((g) => g.subjectId === selectedSubject)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentGrade = calcCurrentGrade(gradeEntries, selectedSubject);
  const predictedGrade = predictFinalGrade(gradeEntries, selectedSubject);

  const gradedEntries = subjectEntries.filter((g) => g.score !== null);
  const ungradedEntries = subjectEntries.filter((g) => g.score === null);

  const totalGradedWeight = gradedEntries.reduce((s, g) => s + g.weight, 0);
  const totalWeight = subjectEntries.reduce((s, g) => s + g.weight, 0);

  const editingGrade = editingGradeId ? gradeEntries.find((g) => g.id === editingGradeId) : null;
  const editingSubject = editingSubjectId ? subjects.find((s) => s.id === editingSubjectId) : null;

  /** Points needed on remaining items to hit goal */
  function neededForGoal(): number | null {
    if (!subject) return null;
    const goal = subject.gradeGoal;
    const graded = subjectEntries.filter(g => g.score !== null);
    const ungraded = subjectEntries.filter(g => g.score === null);
    if (ungraded.length === 0) return null;
    const gradedWeight = graded.reduce((s, g) => s + g.weight, 0);
    const ungradedWeight = ungraded.reduce((s, g) => s + g.weight, 0);
    const earnedPoints = graded.reduce((s, g) => s + (g.score! / g.maxScore) * 100 * g.weight, 0);
    // goal * totalWeight = earnedPoints + needed * ungradedWeight
    const needed = (goal * (gradedWeight + ungradedWeight) - earnedPoints) / ungradedWeight;
    return Math.max(0, needed);
  }

  const needed = neededForGoal();

  function deleteGrade(id: string) {
    dispatch({ type: "DELETE_GRADE_ENTRY", payload: id });
  }

  function deleteSubject(id: string) {
    if (!confirm("Delete this subject? This will also remove all its grade entries.")) return;
    dispatch({ type: "DELETE_SUBJECT", payload: id });
    dispatch({
      type: "LOAD_STATE",
      payload: {
        ...state,
        subjects: state.subjects.filter(s => s.id !== id),
        gradeEntries: state.gradeEntries.filter(g => g.subjectId !== id),
      },
    });
    const remaining = subjects.filter(s => s.id !== id);
    if (remaining.length > 0) setSelectedSubject(remaining[0].id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-lg font-bold text-pink-100">Grade Tracker</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingSubjectId(null); setShowSubjectForm(true); }}
            className="px-3 py-1.5 bg-pink-950 hover:bg-neutral-700 text-pink-200 text-sm font-medium rounded-lg transition-colors border border-pink-800"
          >
            + Subject
          </button>
          {subject && (
            <button
              onClick={() => { setEditingGradeId(null); setShowGradeForm(true); }}
              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-pink-100 text-sm font-medium rounded-lg transition-colors"
            >
              + Grade Entry
            </button>
          )}
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-16 text-pink-500">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-medium">No subjects yet</p>
          <p className="text-sm mt-1">Add a subject to start tracking grades.</p>
        </div>
      ) : (
        <>
          {/* Subject tabs */}
          <div className="flex gap-2 flex-wrap">
            {subjects.map((s) => {
              const sc = getColorClasses(s.color);
              const cur = calcCurrentGrade(gradeEntries, s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    selectedSubject === s.id
                      ? `${sc.bgLight} ${sc.border} ${sc.text}`
                      : "bg-pink-950/50 border-pink-900 text-pink-400 hover:border-pink-800 hover:text-pink-100"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                  <span>{s.name}</span>
                  <span className="text-xs text-pink-600">{s.examBoard} {s.examSpec && `• ${s.examSpec}`}</span>
                  {cur !== null && (
                    <span className={`text-xs font-bold ${selectedSubject === s.id ? "" : "text-pink-500"}`}>
                      {gradeLetterFromScore(cur)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {subject && (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <GradeCard
                  label="Current Grade"
                  value={currentGrade !== null ? gradeLetterFromScore(currentGrade) : "—"}
                  sub={currentGrade !== null ? gradeLetterFromScore(currentGrade) : "No data"}
                  color={
                    currentGrade === null ? "neutral" :
                    currentGrade >= subject.gradeGoal ? "green" :
                    currentGrade >= subject.gradeGoal - 5 ? "amber" : "rose"
                  }
                />
                <GradeCard
                  label="Predicted Final"
                  value={predictedGrade !== null ? gradeLetterFromScore(predictedGrade) : "—"}
                  sub={predictedGrade !== null ? gradeLetterFromScore(predictedGrade) : "No graded items"}
                  color={
                    predictedGrade === null ? "neutral" :
                    predictedGrade >= subject.gradeGoal ? "green" :
                    predictedGrade >= subject.gradeGoal - 5 ? "amber" : "rose"
                  }
                  tooltip="Based on current average applied to remaining items"
                />
                <GradeCard
                  label="Goal"
                  value={gradeLetterFromScore(subject.gradeGoal)}
                  sub={`${subject.gradeGoal}%`}
                  color="blue"
                />
                <GradeCard
                  label="Needed on Remaining"
                  value={needed !== null ? gradeLetterFromScore(needed) : "—"}
                  sub={needed === null ? "All graded" : needed > 100 ? "Goal unreachable" : needed <= subject.gradeGoal ? "On track!" : "Above average"}
                  color={
                    needed === null ? "neutral" :
                    needed > 100 ? "rose" :
                    needed <= subject.gradeGoal ? "green" : "amber"
                  }
                />
              </div>

              {/* Progress bar */}
              <div className="bg-pink-950/50 border border-pink-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-pink-200">Grade Progress</span>
                  <div className="flex items-center gap-4 text-xs text-pink-500">
                    <span>Graded weight: {totalGradedWeight}% / {totalWeight}%</span>
                    <button
                      onClick={() => { setEditingSubjectId(subject.id); setShowSubjectForm(true); }}
                      className="text-pink-500 hover:text-pink-100 transition-colors"
                    >
                      Edit subject ✎
                    </button>
                    <button
                      onClick={() => deleteSubject(subject.id)}
                      className="text-pink-500 hover:text-rose-400 transition-colors"
                    >
                      Delete ✕
                    </button>
                  </div>
                </div>
                <div className="relative h-4 rounded-full bg-white/5 overflow-hidden">
                  {/* Earned so far */}
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${c.bg}`}
                    style={{ width: `${Math.min(currentGrade ?? 0, 100)}%` }}
                  />
                  {/* Predicted (lighter overlay) */}
                  {predictedGrade !== null && predictedGrade > (currentGrade ?? 0) && (
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full opacity-30 ${c.bg}`}
                      style={{ width: `${Math.min(predictedGrade, 100)}%` }}
                    />
                  )}
                  {/* Goal marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10"
                    style={{ left: `${subject.gradeGoal}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-pink-500 mt-1">
                  <span>0%</span>
                  <span className="text-pink-100/40" style={{ marginLeft: `${subject.gradeGoal - 5}%` }}>Goal: {subject.gradeGoal}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Grade entries table */}
              <div className="bg-pink-950/50 border border-pink-900 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-pink-900 flex items-center justify-between">
                  <span className="text-sm font-medium text-pink-100">Grade Entries</span>
                  <span className="text-xs text-pink-500">{gradedEntries.length} graded · {ungradedEntries.length} pending</span>
                </div>
                {subjectEntries.length === 0 ? (
                  <div className="text-center py-8 text-pink-500 text-sm">
                    No grade entries yet. Add one above.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {subjectEntries.map((entry) => (
                      <GradeRow
                        key={entry.id}
                        entry={entry}
                        onEdit={() => { setEditingGradeId(entry.id); setShowGradeForm(true); }}
                        onDelete={() => deleteGrade(entry.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* GPA / weighted average breakdown */}
              {gradedEntries.length > 0 && (
                <div className="bg-pink-950/50 border border-pink-900 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-pink-100 mb-3">Breakdown by Type</h3>
                  <div className="space-y-2">
                    {ENTRY_TYPES.map((type) => {
                      const typeEntries = gradedEntries.filter(g => g.type === type);
                      if (typeEntries.length === 0) return null;
                      const totalW = typeEntries.reduce((s, g) => s + g.weight, 0);
                      const avg = typeEntries.reduce((s, g) => s + (g.score! / g.maxScore) * 100 * g.weight, 0) / totalW;
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <span className="text-xs text-pink-400 capitalize w-24 shrink-0">{type}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                            <div className={`h-full rounded-full ${c.bg}`} style={{ width: `${avg}%` }} />
                          </div>
                          <span className="text-xs font-medium text-pink-100 w-12 text-right">{gradeLetterFromScore(avg)}</span>
                          <span className="text-xs text-pink-500 w-14 text-right">{totalW}% weight</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Grade Entry Form */}
      {showGradeForm && (
        <GradeEntryForm
          entry={editingGrade ?? null}
          subjects={subjects}
          defaultSubjectId={selectedSubject}
          onClose={() => { setShowGradeForm(false); setEditingGradeId(null); }}
          onSave={(data) => {
            if (editingGrade) {
              dispatch({ type: "UPDATE_GRADE_ENTRY", payload: { ...editingGrade, ...data } });
            } else {
              dispatch({ type: "ADD_GRADE_ENTRY", payload: { id: genId(), ...data } });
            }
            setShowGradeForm(false);
            setEditingGradeId(null);
          }}
        />
      )}

      {/* Subject Form */}
      {showSubjectForm && (
        <SubjectForm
          subject={editingSubject ?? null}
          onClose={() => { setShowSubjectForm(false); setEditingSubjectId(null); }}
          onSave={(data) => {
            if (editingSubject) {
              dispatch({ type: "UPDATE_SUBJECT", payload: { ...editingSubject, ...data } });
            } else {
              const newId = genId();
              dispatch({ type: "ADD_SUBJECT", payload: { id: newId, ...data } });
              setSelectedSubject(newId);
            }
            setShowSubjectForm(false);
            setEditingSubjectId(null);
          }}
        />
      )}
    </div>
  );
}

function GradeCard({
  label, value, sub, color, tooltip,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  tooltip?: string;
}) {
  const c = getColorClasses(color);
  return (
    <div
      title={tooltip}
      className={`p-3 rounded-xl border ${c.bgLight} ${c.border}`}
    >
      <div className={`text-xl font-black ${c.text}`}>{value}</div>
      <div className="text-xs text-pink-100 font-medium mt-0.5">{label}</div>
      <div className="text-xs text-pink-500 mt-0.5">{sub}</div>
    </div>
  );
}

function GradeRow({
  entry, onEdit, onDelete,
}: {
  entry: GradeEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pct = entry.score !== null ? (entry.score / entry.maxScore) * 100 : null;
  const letter = pct !== null ? gradeLetterFromScore(pct) : null;

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 hover:bg-white/2 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-pink-100 font-medium truncate">{entry.title}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-700 text-pink-400 capitalize shrink-0">
            {entry.type}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-pink-500">
            {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="text-xs text-pink-600">Weight: {entry.weight}%</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        {pct !== null ? (
          <>
            <span className={`text-sm font-bold ${
              pct >= 90 ? "text-green-400" :
              pct >= 80 ? "text-blue-400" :
              pct >= 70 ? "text-amber-400" :
              "text-rose-400"
            }`}>
              {letter}
            </span>
            <div className="text-xs text-pink-600">{entry.score}/{entry.maxScore}</div>
          </>
        ) : (
          <span className="text-xs text-pink-500">Pending</span>
        )}
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/5 text-pink-400 hover:text-pink-100 text-xs">✎</button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-rose-600/20 text-pink-400 hover:text-rose-400 text-xs">✕</button>
      </div>
    </div>
  );
}

type GradeEntryFormData = Omit<GradeEntry, "id">;

function GradeEntryForm({
  entry, subjects, defaultSubjectId, onClose, onSave,
}: {
  entry: GradeEntry | null;
  subjects: Subject[];
  defaultSubjectId: string;
  onClose: () => void;
  onSave: (data: GradeEntryFormData) => void;
}) {
  const [form, setForm] = useState<GradeEntryFormData>({
    subjectId: entry?.subjectId ?? defaultSubjectId,
    title: entry?.title ?? "",
    type: entry?.type ?? "assignment",
    weight: entry?.weight ?? 10,
    score: entry?.score ?? null,
    maxScore: entry?.maxScore ?? 100,
    date: entry?.date ?? new Date().toISOString().split("T")[0],
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-black border border-pink-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-pink-900">
          <h2 className="font-bold text-pink-100">{entry ? "Edit Grade Entry" : "New Grade Entry"}</h2>
          <button onClick={onClose} className="text-pink-400 hover:text-pink-100">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="e.g. Midterm Exam"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Subject</label>
              <select
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as GradeEntry["type"] })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2"
              >
                {ENTRY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Weight (%)</label>
              <input
                type="number" min={0} max={100}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Score</label>
              <input
                type="number" min={0} max={form.maxScore}
                value={form.score ?? ""}
                onChange={(e) => setForm({ ...form, score: e.target.value === "" ? null : Number(e.target.value) })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Max Score</label>
              <input
                type="number" min={1}
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
            />
          </div>
          {form.score !== null && (
            <div className={`p-3 rounded-lg text-sm font-medium text-center ${
              (form.score / form.maxScore) * 100 >= 90 ? "bg-green-600/20 text-green-400" :
              (form.score / form.maxScore) * 100 >= 80 ? "bg-blue-600/20 text-blue-400" :
              (form.score / form.maxScore) * 100 >= 70 ? "bg-amber-600/20 text-amber-400" :
              "bg-rose-600/20 text-rose-400"
            }`}>
              {gradeLetterFromScore((form.score / form.maxScore) * 100)} · {form.score}/{form.maxScore}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-pink-950 text-pink-200 text-sm font-medium hover:bg-neutral-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-pink-600 text-pink-100 text-sm font-medium hover:bg-pink-500 transition-colors">
              {entry ? "Save Changes" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type SubjectFormData = Omit<Subject, "id">;

function SubjectForm({
  subject, onClose, onSave,
}: {
  subject: Subject | null;
  onClose: () => void;
  onSave: (data: SubjectFormData) => void;
}) {
  const [form, setForm] = useState<SubjectFormData>({
    name: subject?.name ?? "",
    color: subject?.color ?? "blue",
    creditHours: subject?.creditHours ?? 3,
    gradeGoal: subject?.gradeGoal ?? 90,
    examBoard: subject?.examBoard ?? "AQA",
    examSpec: subject?.examSpec ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-black border border-pink-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-pink-900">
          <h2 className="font-bold text-pink-100">{subject ? "Edit Subject" : "New Subject"}</h2>
          <button onClick={onClose} className="text-pink-400 hover:text-pink-100">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Subject Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="e.g. Mathematics"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((color) => {
                const cc = getColorClasses(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-full ${cc.bg} border-2 border-white/20 transition-transform ${
                      form.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110" : "opacity-90 hover:opacity-100"
                    }`}
                    title={color.replace("pastel-", "pastel ")}
                  />
                );
              })}
            </div>
            <p className="text-xs text-pink-500 mt-2">Click to select • Hover for name</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Exam Board</label>
            <select
              value={form.examBoard}
              onChange={(e) => setForm({ ...form, examBoard: e.target.value })}
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2"
            >
              <option value="AQA">AQA</option>
              <option value="Edexcel">Edexcel (Pearson)</option>
              <option value="OCR">OCR</option>
              <option value="WJEC">WJEC</option>
              <option value="CCEA">CCEA</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Exam Specification</label>
            <input
              value={form.examSpec}
              onChange={(e) => setForm({ ...form, examSpec: e.target.value })}
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="e.g. Combined Science Trilogy, Mathematics, Physics"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Credit Hours</label>
              <input
                type="number" min={1} max={6}
                value={form.creditHours}
                onChange={(e) => setForm({ ...form, creditHours: Number(e.target.value) })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1.5">Grade Goal (1-9)</label>
              <input
                type="number" min={1} max={9}
                value={form.gradeGoal}
                onChange={(e) => setForm({ ...form, gradeGoal: Number(e.target.value) })}
                className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
                placeholder="e.g. 7"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-pink-950 text-pink-200 text-sm font-medium hover:bg-neutral-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-pink-600 text-pink-100 text-sm font-medium hover:bg-pink-500 transition-colors">
              {subject ? "Save Changes" : "Add Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
