export default function GoalsLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-stone-50 text-stone-900">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-4 h-7 w-44 rounded-full bg-stone-200" />
          <div className="mb-5 h-12 w-full max-w-2xl rounded-2xl bg-stone-200" />
          <div className="h-5 w-full max-w-3xl rounded-xl bg-stone-200" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 rounded-[2rem] border border-stone-200 bg-white" />
          ))}
        </div>
      </div>
    </main>
  );
}
