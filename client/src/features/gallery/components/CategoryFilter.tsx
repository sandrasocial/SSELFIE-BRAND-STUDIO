import React from 'react';

const CATEGORIES = ['Close up', 'Half body', 'Full scenery', 'Flatlays'] as const;
export type Category = typeof CATEGORIES[number] | 'All';

export default function CategoryFilter({
  value,
  onChange,
}: {
  value: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {(['All', ...CATEGORIES] as Category[]).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`px-4 py-2 rounded-2xl border text-xs tracking-[0.15em] uppercase font-light transition-colors ${
            value === c
              ? 'bg-stone-950 border-stone-950 text-stone-50'
              : 'bg-white border-stone-200/60 text-stone-600 hover:border-stone-300'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

