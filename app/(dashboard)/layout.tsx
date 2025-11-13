export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Za sada ne proveravamo autentikaciju - samo testno
  return <>{children}</>
}

