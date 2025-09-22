import React from 'react';
import { Link } from 'wouter';

interface StudioWidget {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  linkTo: string;
  status?: 'active' | 'coming-soon' | 'in-progress';
  progress?: number;
}

interface StudioWorkspaceWidgetsProps {
  themeImages: string[];
  userAiImages?: string[];
}

export function StudioWorkspaceWidgets({ themeImages, userAiImages }: StudioWorkspaceWidgetsProps) {
  const widgets: StudioWidget[] = [
    {
      id: 'ai-training',
      title: 'AI Training',
      description: 'Train your personalized AI model',
      backgroundImage: themeImages[0] || 'https://i.postimg.cc/QtnSw23T/1.png',
      linkTo: '/model-training',
      status: userAiImages?.length ? 'active' : 'in-progress'
    },
    {
      id: 'ai-generator',
      title: 'AI Generator',
      description: 'Generate editorial SSELFIE images',
      backgroundImage: themeImages[1] || 'https://i.postimg.cc/FKrM4X2W/10.png',
      linkTo: '/ai-generator',
      status: 'active'
    },
    {
      id: 'brandbook',
      title: 'Brandbook Designer',
      description: 'Design your luxury brand identity',
      backgroundImage: themeImages[2] || 'https://i.postimg.cc/HnMYyCW0/100.png',
      linkTo: '/brandbook-onboarding',
      status: 'active'
    },
    {
      id: 'landing-pages',
      title: 'Landing Pages',
      description: 'Create conversion-optimized pages',
      backgroundImage: themeImages[3] || 'https://i.postimg.cc/tTwRJgbC/101.png',
      linkTo: '/landing-builder',
      status: 'active'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Track your business performance',
      backgroundImage: themeImages[4] || 'https://i.postimg.cc/c1t4jf7K/102.png',
      linkTo: '#',
      status: 'coming-soon'
    },
    {
      id: 'bookings',
      title: 'Booking Calendar',
      description: 'Manage client appointments',
      backgroundImage: themeImages[0] || 'https://i.postimg.cc/QtnSw23T/1.png',
      linkTo: '#',
      status: 'coming-soon'
    }
  ];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded">
            ACTIVE
          </div>
        );
      case 'in-progress':
        return (
          <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded">
            IN PROGRESS
          </div>
        );
      case 'coming-soon':
        return (
          <div className="absolute top-3 right-3 bg-gray-500 text-white text-xs px-2 py-1 rounded">
            COMING SOON
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map((widget) => {
        const Component = widget.status === 'coming-soon' ? 'div' : Link;
        const componentProps = widget.status === 'coming-soon' 
          ? { className: "block" }
          : { href: widget.linkTo, className: "block" };

        return (
          <Component key={widget.id} {...componentProps}>
            <div className={`relative aspect-[4/3] overflow-hidden group border border-[#e5e5e5] ${
              widget.status === 'coming-soon' 
                ? 'cursor-not-allowed opacity-75' 
                : 'cursor-pointer hover:border-[#0a0a0a] transition-all'
            }`}>
              <div className="absolute inset-0">
                <img 
                  src={widget.backgroundImage}
                  alt={widget.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    widget.status !== 'coming-soon' ? 'group-hover:scale-110' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-transparent"></div>
              </div>
              
              {getStatusBadge(widget.status)}
              
              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h3 className="text-white text-lg font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {widget.title}
                </h3>
                <p className="text-white/90 text-sm font-light mb-4">
                  {widget.description}
                </p>
                {widget.status !== 'coming-soon' && (
                  <div className="bg-white text-[#0a0a0a] px-4 py-2 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors inline-block w-fit">
                    Open Tool
                  </div>
                )}
              </div>
            </div>
          </Component>
        );
      })}
    </div>
  );
}