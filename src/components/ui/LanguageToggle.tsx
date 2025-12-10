"use client";

type Locale = "ja" | "en";

type Props = {
  value: Locale;
  onChange: (locale: Locale) => void;
};

const options: { value: Locale; label: string }[] = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
];

export function LanguageToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 text-xs shadow-sm">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1 font-semibold transition ${
              isActive
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
