import { PasswordReset } from '@stackframe/stack';

export function ResetPasswordPage(props: { searchParams: Record<string, string> }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-[#f5f3f0]">
      <div className="max-w-md w-full px-6 py-12 rounded-xl shadow-lg bg-white/80 border border-[#e5e0d8]">
        <h1 className="font-serif text-3xl text-center mb-6 tracking-tight text-[#1a1a1a]">
          Reset your password
        </h1>
        <p className="text-center text-[#6b5e4e] mb-8 font-light">
          Create a new password for your SSELFIE Studio account.
        </p>
        <PasswordReset
          searchParams={props.searchParams}
          fullPage={false}
        />
      </div>
    </div>
  );
}
