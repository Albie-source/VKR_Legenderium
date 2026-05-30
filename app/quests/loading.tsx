export default function QuestsLoading() {
  return (
    <main className="animate-pulse overflow-hidden bg-[#f4ecdf] pb-20">
      <section className="bg-[linear-gradient(180deg,#07181c_0%,#0b2428_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-[2.5rem] border border-white/10 bg-[#0b1f22] px-8 py-10">
            <div className="mb-4 h-6 w-48 rounded-2xl bg-white/10" />
            <div className="h-12 w-[28rem] rounded-2xl bg-white/10" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pt-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-[2rem] border border-stone-200 bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
