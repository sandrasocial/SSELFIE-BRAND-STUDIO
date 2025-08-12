import { FC, ReactNode } from 'react';
// Luxury editorial grid layout component
export const EditorialGrid: FC<{
  children: ReactNode;
  columns?: number;
}> = ({ children, columns = 3 }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8 md:gap-12 py-12`}>
      {children}
    </div>
  );
}