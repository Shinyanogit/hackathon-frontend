"use client";

type Category = {
  id: string;
  label: string;
};

type Props = {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function CategoryTabs({ categories, activeId, onSelect }: Props) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-3">
        {categories.map(({ id, label }) => {
          const isActive = id === activeId;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.15)]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
