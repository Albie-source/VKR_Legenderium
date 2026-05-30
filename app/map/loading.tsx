export default function MapLoading() {
  return (
    <main className="animate-pulse bg-[#07181c]">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="h-[calc(100vh-135px)] min-h-[690px] rounded-[2.4rem] bg-[#0f2b2e]" />
          <div className="h-[calc(100vh-135px)] min-h-[690px] rounded-[2.4rem] bg-[#10272b]" />
        </div>
      </div>
    </main>
  );
}
