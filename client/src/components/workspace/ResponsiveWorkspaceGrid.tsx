import { ReactNode } from 'react';
interface ResponsiveWorkspaceGridProps {
  children: ReactNode;
}

export function ResponsiveWorkspaceGrid({ children }: ResponsiveWorkspaceGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
      {children}
    </div>
  );
}