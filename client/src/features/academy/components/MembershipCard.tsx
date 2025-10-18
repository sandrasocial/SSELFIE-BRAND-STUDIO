import React from 'react';

type AcademyMembership = {
  tier: string | null;
  status: 'active' | 'inactive' | 'trial' | 'canceled' | null;
  access?: string[];
};

export default function MembershipCard({ membership, onManage }: { membership: AcademyMembership; onManage: () => void; }) {
  const tier = membership.tier || 'No Membership';
  const status = membership.status || 'inactive';
  return (
    <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-5 sm:p-6 shadow-lg shadow-stone-900/10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-stone-600 mb-1">Membership</div>
          <div className="text-xl font-semibold text-stone-950">{tier}</div>
          <div className="text-sm text-stone-600">{status}</div>
        </div>
        <button onClick={onManage} className="px-4 py-2 bg-stone-950 text-white rounded-2xl hover:bg-stone-800 transition-all text-xs tracking-wide">Manage</button>
      </div>

      {membership.access?.length ? (
        <div className="mt-4">
          <div className="text-xs tracking-[0.2em] uppercase text-stone-600 mb-2">Access</div>
          <div className="flex flex-wrap gap-2">
            {membership.access.map((a) => (
              <span key={a} className="text-xs px-2 py-1 rounded-full bg-white/60 border border-white/70 text-stone-700">{a}</span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

