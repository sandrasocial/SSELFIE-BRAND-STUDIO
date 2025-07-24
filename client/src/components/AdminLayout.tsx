import { ReactNode } from 'react';
import { Link } from 'wouter';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const sidebarItems = [
    { 
      href: '/admin', 
      label: 'O V E R V I E W', 
      icon: '◊',
      image: '/gallery/sandra-power-1.jpg'
    },
    { 
      href: '/admin/users', 
      label: 'U S E R S', 
      icon: '◊',
      image: '/gallery/sandra-confidence-1.jpg'
    },
    { 
      href: '/admin/content', 
      label: 'C O N T E N T', 
      icon: '◊',
      image: '/gallery/sandra-creative-1.jpg'
    },
    { 
      href: '/admin/analytics', 
      label: 'A N A L Y T I C S', 
      icon: '◊',
      image: '/gallery/sandra-success-1.jpg'
    },
    { 
      href: '/admin/settings', 
      label: 'S E T T I N G S', 
      icon: '◊',
      image: '/gallery/sandra-luxury-1.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Luxury Sidebar */}
      <div className="w-80 bg-black text-white flex flex-col">
        {/* Logo */}
        <div className="p-8 border-b border-gray-800">
          <Link href="/">
            <div 
              className="text-2xl font-light tracking-[0.2em] text-center"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {'S S E L F I E'.split('').join(' ')}
            </div>
            <div 
              className="text-sm font-light tracking-[0.3em] text-center mt-2 text-gray-400"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {'A D M I N   S T U D I O'.split('').join(' ')}
            </div>
          </Link>
        </div>

        {/* Navigation Cards */}
        <div className="flex-1 p-6 space-y-4">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="relative bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-200">
                <div 
                  className="h-32 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${item.image}')`,
                    backgroundPosition: '50% 30%'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="text-white text-center text-sm font-light tracking-[0.3em] uppercase opacity-90"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Profile Section */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 bg-cover bg-center rounded-full"
              style={{
                backgroundImage: `url('/gallery/sandra-profile-admin.jpg')`,
                backgroundPosition: '50% 30%'
              }}
            />
            <div>
              <div 
                className="text-sm font-light tracking-[0.1em]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Sandra
              </div>
              <div className="text-xs text-gray-400 tracking-[0.1em]">
                ADMIN
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 
                className="text-3xl font-light tracking-[0.2em] uppercase text-black"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {title.split('').join(' ')}
              </h1>
              {subtitle && (
                <p 
                  className="text-sm text-gray-600 mt-2 tracking-[0.1em]"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-black transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5-5-5h5V3h5v14z" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-black transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}