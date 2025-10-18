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

export default function CourseCard({ course, onOpen }: { course: AcademyCourse; onOpen: () => void; }) {
  return (
    <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-5 hover:border-white/80 transition-all duration-300 shadow-lg shadow-stone-900/5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-stone-950 font-medium">{course.title}</div>
          {course.level && <div className="text-xs text-stone-600">{course.level}</div>}
        </div>
        {typeof course.progressPercent === 'number' && (
          <div className="text-xs text-stone-600">{Math.round(course.progressPercent)}%</div>
        )}
      </div>
      {course.description && <div className="text-sm text-stone-600 mb-4 line-clamp-2">{course.description}</div>}
      <div className="flex items-center justify-between">
        <div className="text-xs text-stone-500">
          {course.lessons ? `${course.lessons} lessons` : ''}{course.duration ? ` • ${course.duration}` : ''}
        </div>
        <button onClick={onOpen} className="px-4 py-2 bg-stone-950 text-white rounded-2xl hover:bg-stone-800 transition-all text-xs tracking-wide">
          {course.enrolled ? 'Resume' : 'Start'}
        </button>
      </div>
    </div>
  );
}

