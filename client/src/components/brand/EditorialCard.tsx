import { FC, ReactNode } from 'react';
interface EditorialCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  children: ReactNode;
}

export const EditorialCard: FC<EditorialCardProps> = ({
  title,
  subtitle,
  image,
  children
}) => {
  return (
    <article className="bg-white border border-gray-200 p-8 mb-8">
      {image && (
        <div className="mb-8">
          <img
            src={image}
            alt={title}
            className="w-full h-[400px] object-cover"
          />
        </div>
      )}
      
      <header className="mb-6">
        <h2 className="font-serif text-3xl text-gray-900 mb-2">{title}</h2>
        {subtitle && (
          <p className="font-serif text-xl text-gray-600 italic">{subtitle}</p>
        )}
      </header>

      <div className="prose prose-lg font-serif">
        {children}
      </div>
    </article>
  );
};