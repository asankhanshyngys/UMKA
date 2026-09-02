export default function Loading() {
  return <LoadingShell />;
}

function LoadingShell() {
  return (
    <main className="min-h-[70vh] bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-10 w-64 rounded-xl bg-border/60" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-64 rounded-2xl bg-card ring-1 ring-border" />)}
        </div>
      </div>
    </main>
  );
}
