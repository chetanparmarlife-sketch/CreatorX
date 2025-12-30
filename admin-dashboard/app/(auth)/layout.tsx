export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-shell min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  )
}
