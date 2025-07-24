import React from 'react';

// Hero Section with Full Bleed Editorial Image
export const EditorialHero = ({ 
  backgroundImage, 
  title, 
  subtitle, 
  overlayOpacity = 0.3 
}: {
  backgroundImage: string;
  title: string;
  subtitle?: string;
  overlayOpacity?: number;
}) => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, ${overlayOpacity}), rgba(0, 0, 0, ${overlayOpacity})), url(${backgroundImage})`,
          backgroundPosition: '50% 30%'
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 
            className="text-6xl font-light tracking-[0.3em] uppercase opacity-90 mb-4"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {title.split('').join(' ')}
          </h1>
          {subtitle && (
            <p 
              className="text-xl font-light tracking-[0.2em] opacity-80"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Editorial Card with Image + Text Overlay
export const EditorialCard = ({ 
  backgroundImage, 
  title, 
  description, 
  onClick 
}: {
  backgroundImage: string;
  title: string;
  description?: string;
  onClick?: () => void;
}) => {
  return (
    <div 
      className="relative bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-200"
      onClick={onClick}
    >
      <div 
        className="h-96 bg-cover bg-center relative"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
          backgroundPosition: '50% 30%'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <h3 
              className="text-2xl font-light tracking-[0.3em] uppercase opacity-90 mb-2"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {title.split('').join(' ')}
            </h3>
            {description && (
              <p 
                className="text-sm font-light tracking-[0.1em] opacity-80"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Full Bleed Image Page Break
export const EditorialPageBreak = ({ 
  backgroundImage, 
  height = "h-64" 
}: {
  backgroundImage: string;
  height?: string;
}) => {
  return (
    <div className={`w-full ${height} relative overflow-hidden my-12`}>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: '50% 30%'
        }}
      />
    </div>
  );
};

// Portfolio Style Component for Data Presentation
export const EditorialPortfolio = ({ 
  items 
}: {
  items: Array<{
    id: string;
    image: string;
    title: string;
    category?: string;
    description?: string;
  }>;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
      {items.map((item) => (
        <div key={item.id} className="group">
          <div className="relative overflow-hidden rounded-lg mb-4">
            <img 
              src={item.image} 
              alt={item.title}
              className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
          </div>
          <div className="text-center">
            {item.category && (
              <p 
                className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-1"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {item.category}
              </p>
            )}
            <h4 
              className="text-lg font-light tracking-[0.1em] mb-2"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {item.title}
            </h4>
            {item.description && (
              <p 
                className="text-sm text-gray-600 font-light"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Editorial Text Block with Luxury Typography
export const EditorialText = ({ 
  title, 
  content, 
  centered = false 
}: {
  title?: string;
  content: string;
  centered?: boolean;
}) => {
  return (
    <div className={`max-w-4xl mx-auto py-16 px-8 ${centered ? 'text-center' : ''}`}>
      {title && (
        <h2 
          className="text-4xl font-light tracking-[0.2em] uppercase mb-8"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {title}
        </h2>
      )}
      <div 
        className="text-lg leading-relaxed font-light"
        style={{ fontFamily: 'Times New Roman, serif' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

// Luxury Navigation Component
export const EditorialNavigation = ({ 
  items, 
  currentPath,
  onNavigate 
}: {
  items: Array<{ path: string; label: string; }>;
  currentPath: string;
  onNavigate: (path: string) => void;
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="text-2xl font-light tracking-[0.3em] uppercase"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            SSELFIE
          </div>
          <div className="flex space-x-8">
            {items.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`
                  text-sm font-light tracking-[0.1em] uppercase transition-all duration-200
                  ${currentPath === item.path 
                    ? 'text-black border-b border-black' 
                    : 'text-gray-600 hover:text-black'
                  }
                `}
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main Luxury Editorial Layout Wrapper
export const EditorialLayout = ({ 
  children, 
  navigation 
}: {
  children: React.ReactNode;
  navigation?: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen bg-white">
      {navigation}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
};

// Default export for the main component
export default EditorialLayout;