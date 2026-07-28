export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      {children}
    </main>
  );
}
