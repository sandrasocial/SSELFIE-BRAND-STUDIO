import { FC } from 'react';

// TypeScript interface for component props
interface ZaraTestProps {
  title?: string;
  description?: string;
}

// Component with TypeScript typing
const ZaraTest: FC<ZaraTestProps> = ({ 
  title = 'Default Title', 
  description = 'Default Description' 
}) => {
  return (
    <div className="flex flex-col items-center p-4 space-y-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default ZaraTest;