export const SUBJECT_COLORS = [
  "blue", "violet", "amber", "green", "rose", "cyan", "orange", "pink", "teal", "indigo",
  "pastel-blue", "pastel-lavender", "pastel-yellow", "pastel-mint", "pastel-peach", "pastel-rose", "pastel-sky", "pastel-lemon", "pastel-lime", "pastel-wine",
] as const;

export type SubjectColor = (typeof SUBJECT_COLORS)[number];

export const COLOR_CLASSES: Record<string, {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  badge: string;
  dot: string;
}> = {
  blue: {
    bg: "bg-blue-600",
    bgLight: "bg-blue-600/10",
    text: "text-blue-400",
    border: "border-blue-600/30",
    badge: "bg-blue-600/20 text-blue-300 border border-blue-600/30",
    dot: "bg-blue-400",
  },
  violet: {
    bg: "bg-violet-600",
    bgLight: "bg-violet-600/10",
    text: "text-violet-400",
    border: "border-violet-600/30",
    badge: "bg-violet-600/20 text-violet-300 border border-violet-600/30",
    dot: "bg-violet-400",
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    dot: "bg-amber-400",
  },
  green: {
    bg: "bg-green-600",
    bgLight: "bg-green-600/10",
    text: "text-green-400",
    border: "border-green-600/30",
    badge: "bg-green-600/20 text-green-300 border border-green-600/30",
    dot: "bg-green-400",
  },
  rose: {
    bg: "bg-rose-600",
    bgLight: "bg-rose-600/10",
    text: "text-rose-400",
    border: "border-rose-600/30",
    badge: "bg-rose-600/20 text-rose-300 border border-rose-600/30",
    dot: "bg-rose-400",
  },
  cyan: {
    bg: "bg-cyan-600",
    bgLight: "bg-cyan-600/10",
    text: "text-cyan-400",
    border: "border-cyan-600/30",
    badge: "bg-cyan-600/20 text-cyan-300 border border-cyan-600/30",
    dot: "bg-cyan-400",
  },
  orange: {
    bg: "bg-orange-500",
    bgLight: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    dot: "bg-orange-400",
  },
  pink: {
    bg: "bg-pink-600",
    bgLight: "bg-pink-600/10",
    text: "text-pink-400",
    border: "border-pink-600/30",
    badge: "bg-pink-600/20 text-pink-300 border border-pink-600/30",
    dot: "bg-pink-400",
  },
  teal: {
    bg: "bg-teal-600",
    bgLight: "bg-teal-600/10",
    text: "text-teal-400",
    border: "border-teal-600/30",
    badge: "bg-teal-600/20 text-teal-300 border border-teal-600/30",
    dot: "bg-teal-400",
  },
  indigo: {
    bg: "bg-indigo-600",
    bgLight: "bg-indigo-600/10",
    text: "text-indigo-400",
    border: "border-indigo-600/30",
    badge: "bg-indigo-600/20 text-indigo-300 border border-indigo-600/30",
    dot: "bg-indigo-400",
  },
  "pastel-blue": {
    bg: "bg-blue-200",
    bgLight: "bg-blue-200/20",
    text: "text-blue-300",
    border: "border-blue-300/30",
    badge: "bg-blue-200/20 text-blue-300 border border-blue-300/30",
    dot: "bg-blue-300",
  },
  "pastel-lavender": {
    bg: "bg-violet-200",
    bgLight: "bg-violet-200/20",
    text: "text-violet-300",
    border: "border-violet-300/30",
    badge: "bg-violet-200/20 text-violet-300 border border-violet-300/30",
    dot: "bg-violet-300",
  },
  "pastel-yellow": {
    bg: "bg-yellow-200",
    bgLight: "bg-yellow-200/20",
    text: "text-yellow-300",
    border: "border-yellow-300/30",
    badge: "bg-yellow-200/20 text-yellow-300 border border-yellow-300/30",
    dot: "bg-yellow-300",
  },
  "pastel-mint": {
    bg: "bg-emerald-200",
    bgLight: "bg-emerald-200/20",
    text: "text-emerald-300",
    border: "border-emerald-300/30",
    badge: "bg-emerald-200/20 text-emerald-300 border border-emerald-300/30",
    dot: "bg-emerald-300",
  },
  "pastel-peach": {
    bg: "bg-orange-200",
    bgLight: "bg-orange-200/20",
    text: "text-orange-300",
    border: "border-orange-300/30",
    badge: "bg-orange-200/20 text-orange-300 border border-orange-300/30",
    dot: "bg-orange-300",
  },
  "pastel-rose": {
    bg: "bg-rose-200",
    bgLight: "bg-rose-200/20",
    text: "text-rose-300",
    border: "border-rose-300/30",
    badge: "bg-rose-200/20 text-rose-300 border border-rose-300/30",
    dot: "bg-rose-300",
  },
  "pastel-sky": {
    bg: "bg-sky-200",
    bgLight: "bg-sky-200/20",
    text: "text-sky-300",
    border: "border-sky-300/30",
    badge: "bg-sky-200/20 text-sky-300 border border-sky-300/30",
    dot: "bg-sky-300",
  },
  "pastel-lemon": {
    bg: "bg-lime-200",
    bgLight: "bg-lime-200/20",
    text: "text-lime-300",
    border: "border-lime-300/30",
    badge: "bg-lime-200/20 text-lime-300 border border-lime-300/30",
    dot: "bg-lime-300",
  },
  "pastel-lime": {
    bg: "bg-green-200",
    bgLight: "bg-green-200/20",
    text: "text-green-300",
    border: "border-green-300/30",
    badge: "bg-green-200/20 text-green-300 border border-green-300/30",
    dot: "bg-green-300",
  },
  "pastel-wine": {
    bg: "bg-fuchsia-200",
    bgLight: "bg-fuchsia-200/20",
    text: "text-fuchsia-300",
    border: "border-fuchsia-300/30",
    badge: "bg-fuchsia-200/20 text-fuchsia-300 border border-fuchsia-300/30",
    dot: "bg-fuchsia-300",
  },
};

export function getColorClasses(color: string) {
  return COLOR_CLASSES[color] ?? COLOR_CLASSES["blue"];
}
