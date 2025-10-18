import React from 'react';

type AcademyCourse = {
  id: string;
  title: string;
  level?: string | null;
  duration?: string | null;
  lessons?: number | null;
  description?: string | null;
  progressPercent?: number;
  enrolled?: boolean;
};

export default function FeaturedCourseCard({ course, onOpen }: { course: AcademyCourse | null; onOpen: () => void; }) {
  if (!course) {
    return (
      <div className="bg-white/40 border border-white/60 rounded-2xl p-6 text-stone-500 text-sm">No featured course available.</div>
    );
  }
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="text-sm text-stone-500 mb-1">Featured Course</div>
        <div className="text-xl sm:text-2xl font-semibold text-stone-950">{course.title}</div>
        {course.description && <p className="text-stone-600 mt-1 max-w-xl">{course.description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {typeof course.progressPercent === 'number' && (
          <div className="text-sm text-stone-600">{Math.round(course.progressPercent)}%</div>
        )}
        <button onClick={onOpen} className="px-4 py-2 bg-stone-950 text-white rounded-2xl hover:bg-stone-800 transition-all text-xs tracking-wide">Open</button>
      </div>
    </div>
  );
}

