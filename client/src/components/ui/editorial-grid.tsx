import { FC } from 'react';
interface EditorialGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const EditorialGrid: FC<EditorialGridProps> = ({
  children,
  columns = 3,
  className = ''
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-8 ${className}`}>
      {children}
    </div>
  );
};