export default function MaterialLoading() {
  return (
    <main className="animate-pulse bg-[#0b1f22] pb-20">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 h-5 w-56 rounded-xl bg-white/10" />
        <div className="mb-4 h-12 w-3/4 rounded-2xl bg-white/10" />
        <div className="mb-8 h-5 w-40 rounded-xl bg-white/10" />

        <div className="mb-8 h-80 rounded-[2rem] border border-white/10 bg-white/5" />

        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    </main>
  );
}
