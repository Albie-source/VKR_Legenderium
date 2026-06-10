export default function HomeLoading() {
  return (
    <main className="legendarium-page animate-pulse overflow-hidden pb-20">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-10">
        <div className="h-[620px] rounded-[2.5rem] border border-white/10 bg-white/5" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-[2rem] border border-white/10 bg-white/5" />
          ))}
        </div>
      </div>
    </main>
  );
}
