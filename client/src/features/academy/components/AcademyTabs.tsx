import React from 'react';

export default function AcademyTabs({ value, onChange }: { value: 'overview' | 'courses' | 'membership'; onChange: (v: 'overview' | 'courses' | 'membership') => void; }) {
  const tabs: Array<{ id: 'overview'|'courses'|'membership'; label: string; }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses' },
    { id: 'membership', label: 'Membership' },
  ];

  return (
    <div className="flex gap-4">
      {tabs.map((t) => (
        <button key={t.id}
          onClick={() => onChange(t.id)}
          className={`pb-2 text-xs tracking-[0.2em] uppercase font-light transition-colors ${value===t.id?'text-stone-950 border-b-2 border-stone-950':'text-stone-500 hover:text-stone-700'}`}
        >{t.label}</button>
      ))}
    </div>
  );
}

