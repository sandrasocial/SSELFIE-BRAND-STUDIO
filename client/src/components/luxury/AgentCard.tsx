import { Link } from "wouter";

interface AgentCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  link: string;
  status?: string;
  variant?: 'default' | 'tool' | 'agent';
}

export function AgentCard({ 
  id, 
  title, 
  subtitle, 
  description, 
  image, 
  link, 
  status = 'Ready for Analysis',
  variant = 'default' 
}: AgentCardProps) {
  return (
    <div className="group">
      <Link href={link} className="block">
        {/* Image Container - Exact styling from admin dashboard */}
        <div className="relative mb-4 overflow-hidden bg-gray-50" style={{ aspectRatio: variant === 'tool' ? '21/9' : '1/1' }}>
          <img 
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          
          {/* Soft Dark Overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Status Badge */}
          {status && (
            <div className="absolute top-4 left-4">
              <div className="bg-black/80 text-white px-2 py-1 text-xs font-light">
                {status}
              </div>
            </div>
          )}
          
          {/* Title Overlay for agent cards */}
          {variant === 'agent' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="font-serif text-lg md:text-xl font-light tracking-[0.3em] uppercase">
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Card Content */}
        <div className="space-y-2">
          {subtitle && (
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500">
              {subtitle}
            </div>
          )}
          
          <h3 className="font-serif text-sm font-light leading-tight text-black">
            {title}
          </h3>
          
          <p className="text-xs text-gray-600 leading-relaxed font-light">
            {description}
          </p>
        </div>
      </Link>
    </div>
  );
}