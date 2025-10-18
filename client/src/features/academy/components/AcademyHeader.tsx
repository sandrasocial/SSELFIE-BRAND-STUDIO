import React from 'react';

type AcademyMembership = {
  tier: string | null;
  status: 'active' | 'inactive' | 'trial' | 'canceled' | null;
};

export default function AcademyHeader({ membership, onManage }: { membership: AcademyMembership | null | undefined; onManage: () => void; }) {
  const tier = membership?.tier || 'No Membership';
  const status = membership?.status || 'inactive';
  return (
    <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-5 sm:p-6 shadow-lg shadow-stone-900/10">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-stone-950 tracking-tight">Academy</h2>
          <p className="text-stone-600 mt-1">Professional training</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-[0.2em] uppercase text-stone-500">Membership</div>
          <div className="text-sm font-medium text-stone-900">{tier}</div>
          <div className="text-xs text-stone-600">{status}</div>
          <button onClick={onManage} className="mt-2 px-4 py-2 bg-stone-950 text-white rounded-2xl hover:bg-stone-800 transition-all text-xs tracking-wide">Manage</button>
        </div>
      </div>
    </div>
  );
}

