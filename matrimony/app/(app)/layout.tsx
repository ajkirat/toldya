import { NavBar } from '@/components/NavBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-lg pb-20 min-h-screen">
        {children}
      </main>
      <NavBar />
    </div>
  );
}
