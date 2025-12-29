/**
 * Authentication Layout
 * 
 * Layout for authentication pages (login, register).
 * Provides a clean, centered layout for auth forms.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-500">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center text-white">
            <div className="text-3xl font-bold tracking-tight">CreatorX</div>
            <div className="text-sm text-white/80">Brand Dashboard</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

