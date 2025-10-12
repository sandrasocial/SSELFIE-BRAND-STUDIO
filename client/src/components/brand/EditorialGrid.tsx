import { FC, ReactNode } from 'react';
interface EditorialGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export const EditorialGrid: FC<EditorialGridProps> = ({
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