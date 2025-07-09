import { cn } from '@/lib/utils';
import { Link } from 'wouter';

export function AuthLayout({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <main className={cn(
      'min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] px-6 py-12',
      className
    )}>
      <div className="w-full max-w-md bg-white shadow-xl p-10 flex flex-col gap-6">
        <Link href="/" className="block mb-2 text-3xl text-[#0a0a0a] text-center tracking-tight hover:opacity-90 transition" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
          SSELFIE
        </Link>
        <h1 className="text-2xl text-[#0a0a0a] text-center mb-1" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
          Welcome Back
        </h1>
        <p className="text-center text-[#666] text-base mb-4 font-inter">
          Real talk: you don't have to have it all together to start. Just log in and let's get you back to building.
        </p>
        {children}
      </div>
      <p className="mt-6 text-sm text-[#666] text-center max-w-md font-inter">
        "Your mess is your message. Let's turn it into money."
      </p>
    </main>
  );
}