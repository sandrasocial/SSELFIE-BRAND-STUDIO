import { FC } from 'react';
interface MoodboardSectionProps {
  title: string;
  images: string[];
  backgroundColor?: string;
  padding?: string;
}

export const MoodboardSection: FC<MoodboardSectionProps> = ({
  title,
  images
}) => {
  return (
    <div className="text-center">
      <h4 className="font-serif text-lg mb-6 tracking-wide">{title}</h4>
      <div className="grid grid-cols-1 gap-4">
        {images.map((image, index) => (
          <div key={index} className="aspect-[4/5] overflow-hidden">
            <img 
              src={image} 
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
