// src/components/admin/AdminQuickActions.tsx
import React from 'react';
import { 
  Users, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Shield,
  Upload
} from 'lucide-react';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  variant = 'secondary' 
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-lg border text-left transition-all duration-200 hover:shadow-md group ${
        variant === 'primary' 
          ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' 
          : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${
          variant === 'primary' 
            ? 'bg-white/10' 
            : 'bg-slate-100 group-hover:bg-slate-200'
        }`}>
          <Icon className={`w-5 h-5 ${
            variant === 'primary' ? 'text-white' : 'text-slate-700'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-serif text-lg font-medium mb-1 ${
            variant === 'primary' ? 'text-white' : 'text-slate-900'
          }`}>
            {title}
          </h3>
          <p className={`text-sm ${
            variant === 'primary' ? 'text-white/80' : 'text-slate-600'
          }`}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export function AdminQuickActions() {
  const actions = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts, permissions, and activity',
      icon: Users,
      onClick: () => console.log('Navigate to users'),
      variant: 'primary' as const
    },
    {
      title: 'Analytics',
      description: 'Deep dive into performance metrics and user behavior',
      icon: BarChart3,
      onClick: () => console.log('Navigate to analytics')
    },
    {
      title: 'Community',
      description: 'Monitor community engagement and moderation',
      icon: MessageSquare,
      onClick: () => console.log('Navigate to community')
    },
    {
      title: 'Content Management',
      description: 'Upload and manage AI models, templates, and assets',
      icon: Upload,
      onClick: () => console.log('Navigate to content')
    },
    {
      title: 'Security',
      description: 'Monitor security, manage API keys, and access controls',
      icon: Shield,
      onClick: () => console.log('Navigate to security')
    },
    {
      title: 'Settings',
      description: 'Configure system settings and integrations',
      icon: Settings,
      onClick: () => console.log('Navigate to settings')
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="font-serif text-2xl font-light text-slate-900 mb-6">
        Quick Actions
      </h2>
      <div className="space-y-4">
        {actions.map((action, index) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </div>
    </div>
  );
}