// Re-export from main sandra-images library
export { SandraImages, ImageRules } from '@/lib/sandra-images';

// Image component with editorial hover effects
interface EditorialImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'tall';
}

export const EditorialImage: React.FC<EditorialImageProps> = ({
  src,
  alt,
  className = "",
  aspectRatio = "square"
}) => {
  const aspectClass = {
    square: "aspect-square",
    wide: "aspect-wide", 
    tall: "aspect-tall"
  }[aspectRatio];

  return (
    <div className={`${aspectClass} overflow-hidden ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover editorial-hover"
        loading="lazy"
      />
    </div>
  );
};