import React from 'react';

interface EditorialGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export const EditorialGrid: React.FC<EditorialGridProps> = ({
  children,
  columns = 3
}) => {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3', 
    4: 'md:grid-cols-4'
  };

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-8`}>
      {children}
    </div>
  );
};