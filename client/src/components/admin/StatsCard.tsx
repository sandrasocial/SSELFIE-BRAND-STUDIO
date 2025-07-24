interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  image: string;
  onClick?: () => void;
}

export default function StatsCard({ title, value, change, image, onClick }: StatsCardProps) {
  return (
    <div 
      className="relative bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-200 shadow-lg"
      onClick={onClick}
    >
      <div 
        className="h-96 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${image}')`,
          backgroundPosition: '50% 30%'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h3 
              className="text-2xl font-light tracking-[0.3em] uppercase opacity-90 mb-4"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {title.split('').join(' ')}
            </h3>
            <div 
              className="text-4xl font-light mb-2" 
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {value}
            </div>
            <div className="text-sm opacity-80 tracking-[0.1em]">
              {change}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}