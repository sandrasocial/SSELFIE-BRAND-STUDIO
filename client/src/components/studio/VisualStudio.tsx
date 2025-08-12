import { FC } from 'react';
import { cn } from '@/lib/utils';

export interface VisualStudioProps {
  className?: string;
}

export const VisualStudio: FC<VisualStudioProps> = ({
  className,
}) => {
  return (
    <div className={cn(
      'w-full min-h-screen bg-black text-white',
      'font-times-new-roman', // Luxury typography
      className
    )}>
      <header className="px-8 py-12 border-b border-gray-800">
        <h1 className="text-4xl font-normal tracking-tight">
          Visual Studio
        </h1>
        <p className="mt-2 text-lg text-gray-400 font-light">
          Create your visual narrative
        </p>
      </header>

      <main className="px-8 py-12 grid grid-cols-12 gap-8">
        {/* Editorial Grid Layout */}
        <section className="col-span-8 space-y-8">
          <div className="aspect-[4/3] bg-gray-900 rounded-sm flex items-center justify-center">
            <span className="text-xl text-gray-600">Visual Canvas</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className="aspect-square bg-gray-900 rounded-sm flex items-center justify-center">
                <span className="text-sm text-gray-600">Asset {i}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="col-span-4 space-y-8">
          <div className="p-6 bg-gray-900 rounded-sm">
            <h3 className="text-xl mb-4">Controls</h3>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 border border-white/20 rounded-sm hover:bg-white/10 transition">
                Add Asset
              </button>
              <button className="w-full px-4 py-2 border border-white/20 rounded-sm hover:bg-white/10 transition">
                Edit Layout
              </button>
              <button className="w-full px-4 py-2 border border-white/20 rounded-sm hover:bg-white/10 transition">
                Export Design
              </button>
            </div>
          </div>

          <div className="p-6 bg-gray-900 rounded-sm">
            <h3 className="text-xl mb-4">Properties</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Canvas Size: 1920 x 1080</p>
              <p>Assets: 3</p>
              <p>Last Modified: Just now</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};