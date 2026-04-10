"use client";

type Tab = "dashboard" | "assignments" | "exams" | "study" | "grades";

interface NavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "assignments", label: "Assignments", icon: "✓" },
  { id: "exams", label: "Exams", icon: "⏰" },
  { id: "study", label: "Study Planner", icon: "📅" },
  { id: "grades", label: "Grades", icon: "📊" },
];

export default function Nav({ active, onChange }: NavProps) {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-pink-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-6 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-sm font-bold text-white">S</div>
            <span className="font-semibold text-pink-100 hidden sm:block">StudySync</span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto flex-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  active === tab.id
                    ? "bg-pink-900/30 text-pink-100"
                    : "text-pink-700 hover:text-pink-200 hover:bg-pink-900/20"
                }`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export type { Tab };