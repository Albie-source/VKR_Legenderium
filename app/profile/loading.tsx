export default function ProfileLoading() {
  return (
    <main className="animate-pulse bg-[#f4ecdf] pb-20">
      <section className="bg-[linear-gradient(180deg,#07181c_0%,#0b2428_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-4 h-10 w-48 rounded-2xl bg-white/10" />
          <div className="h-5 w-72 rounded-xl bg-white/10" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-[2rem] border border-stone-200 bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
