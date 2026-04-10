export const SUBJECT_COLORS = [
  "blue", "violet", "amber", "green", "rose", "cyan", "orange", "pink", "teal", "indigo",
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
};

export function getColorClasses(color: string) {
  return COLOR_CLASSES[color] ?? COLOR_CLASSES["blue"];
}
