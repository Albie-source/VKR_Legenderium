export default function LibraryLoading() {
  return (
    <main className="animate-pulse bg-[#f4ecdf] pb-20">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 h-10 w-64 rounded-2xl bg-stone-300" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[2rem] border border-stone-200 bg-white p-5"
            >
              <div className="mb-4 h-48 rounded-2xl bg-stone-200" />
              <div className="mb-2 h-4 w-3/4 rounded-xl bg-stone-200" />
              <div className="h-3 w-1/2 rounded-xl bg-stone-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
