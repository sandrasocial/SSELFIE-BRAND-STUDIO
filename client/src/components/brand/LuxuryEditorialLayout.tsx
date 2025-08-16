import { FC, ReactNode } from 'react';
interface LuxuryEditorialLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const LuxuryEditorialLayout: FC<LuxuryEditorialLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <header className="py-16 text-center">
          {title && (
            <h1 className="font-serif text-4xl md:text-6xl text-gray-900 tracking-tight leading-tight mb-4">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="font-serif text-xl md:text-2xl text-gray-600 italic">
              {subtitle}
            </p>
          )}
        </header>

        {/* Luxury Content Container */}
        <main className="prose prose-lg max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-2">
              {/* Left Editorial Margin */}
              <div className="h-full border-r border-gray-200" />
            </div>
            
            <div className="md:col-span-8">
              {/* Main Content */}
              <div className="font-serif">{children}</div>
            </div>

            <div className="md:col-span-2">
              {/* Right Editorial Margin */}
              <div className="h-full border-l border-gray-200" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};