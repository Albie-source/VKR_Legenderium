export default function AdminLoading() {
  return (
    <main className="animate-pulse overflow-hidden bg-[#f4ecdf] pb-20">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 h-10 w-64 rounded-2xl bg-stone-300" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-[2rem] border border-stone-200 bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
