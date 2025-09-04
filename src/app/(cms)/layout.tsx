export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Jambo CMS</h1>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
