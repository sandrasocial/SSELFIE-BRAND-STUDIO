interface QuickActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  onClick?: () => void;
}

export default function QuickActionCard({ title, description, buttonText, onClick }: QuickActionCardProps) {
  return (
    <div className="bg-gray-50 p-8 text-center hover:bg-gray-100 transition-colors duration-200">
      <h3 
        className="text-2xl font-light tracking-[0.2em] uppercase mb-4 text-black"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        {title.split('').join(' ')}
      </h3>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {description}
      </p>
      <button 
        className="bg-black text-white px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-800 transition-colors"
        onClick={onClick}
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        {buttonText.split('').join(' ')}
      </button>
    </div>
  );
}