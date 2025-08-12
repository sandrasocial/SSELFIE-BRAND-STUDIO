import { ReactNode } from 'react';

interface EditorialCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  children: React.ReactNode;
  className?: string;
}

export const EditorialCard: React.FC<EditorialCardProps> = ({
  title,
  subtitle,
  image,
  children,
  className = ''
}) => {
  return (
    <article className={`bg-white border border-gray-200 ${className}`}>
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="font-serif text-2xl font-normal text-gray-900 mb-2">
          {title}
        </h3>
        {subtitle && (
          <p className="font-serif text-lg text-gray-600 mb-4">
            {subtitle}
          </p>
        )}
        <div className="prose prose-lg">
          {children}
        </div>
      </div>
    </article>
  );
};