"use client";

import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "shrink-0 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap",
              "min-h-[44px]",
              isActive
                ? "bg-[var(--color-gold)] text-[var(--color-charcoal)]"
                : "text-[var(--color-sand)] hover:bg-[var(--color-glass-bg-light)]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
