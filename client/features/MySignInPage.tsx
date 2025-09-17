import { SignIn } from "@stackframe/stack";

export function MySignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-[#f5f3f0]">
      <div className="max-w-md w-full px-6 py-12 rounded-xl shadow-lg bg-white/80 border border-[#e5e0d8]">
        <h1 className="font-serif text-3xl text-center mb-4 tracking-tight text-[#1a1a1a]">
          Welcome to SSELFIE STUDIO
        </h1>
        <p className="text-center text-[#6b5e4e] mb-8 font-light">
          Sign in to your Studio
        </p>
        <SignIn
          fullPage={false}
          automaticRedirect={true}
          extraInfo={
            <div className="text-xs text-center text-[#8c7b6b] mt-6">
              By signing in, you agree to our <a href="/terms" className="underline hover:text-[#bfa77a]">Terms</a>.
            </div>
          }
        />
      </div>
    </div>
  );
}
