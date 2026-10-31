export default function PublicLoading() {
  return (
    <div className="container-page py-14">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-12 w-3/4 max-w-2xl animate-pulse rounded bg-muted" />
      <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-72 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  );
}
