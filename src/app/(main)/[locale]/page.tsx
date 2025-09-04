export default function LocalizedHome({ params }: { params: { locale: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Jambo</h1>
      <p className="text-xl text-muted-foreground">
        A modern Git-as-CMS powered website
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Current locale: {params.locale}
      </p>
      <div className="mt-8 p-4 bg-card border rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Available Components</h2>
        <p className="text-muted-foreground">
          All 50+ shadcn/ui components are ready to use!
        </p>
      </div>
    </div>
  );
}
