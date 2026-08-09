export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-4xl">💍</span>
            <h1 className="text-3xl font-bold text-rose-700 tracking-tight">Bandhan</h1>
          </div>
          <p className="text-gray-500 text-sm">Find your perfect match</p>
        </div>
        {children}
      </div>
    </div>
  );
}
