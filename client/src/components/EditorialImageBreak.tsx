interface EditorialImageBreakProps {
  imageUrl: string;
  alt?: string;
  height?: string;
  overlay?: boolean;
  overlayContent?: React.ReactNode;
}

export const EditorialImageBreak: React.FC<EditorialImageBreakProps> = ({
  imageUrl,
  alt = "Editorial image break",
  height = "40vh",
  overlay = false,
  overlayContent
}) => {
  return (
    <section className="w-full overflow-hidden relative" style={{ height }}>
      <img 
        src={imageUrl} 
        alt={alt} 
        className="w-full h-full object-cover editorial-hover"
      />
      {overlay && overlayContent && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-8">
            {overlayContent}
          </div>
        </div>
      )}
    </section>
  );
};
