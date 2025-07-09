interface MoodboardImage {
  url: string;
  alt: string;
  span: number;
  aspect: 'square' | 'wide' | 'tall';
}

interface MoodboardSectionProps {
  images: MoodboardImage[];
  backgroundColor?: string;
  padding?: string;
}

export const MoodboardSection: React.FC<MoodboardSectionProps> = ({
  images,
  backgroundColor = 'bg-editorial-gray',
  padding = 'p-2'
}) => {
  return (
    <section className={`portfolio-grid ${backgroundColor} ${padding}`}>
      {images.map((image, index) => (
        <div key={index} className={`grid-item span-${image.span} aspect-${image.aspect}`}>
          <img 
            src={image.url} 
            alt={image.alt} 
            className="w-full h-full object-cover editorial-hover"
          />
        </div>
      ))}
    </section>
  );
};
