"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d8a342]/30 bg-[#d8a342]/12 text-2xl font-extrabold text-[#d8a342]">
          !
        </div>

        <h1 className="mb-3 text-2xl font-extrabold text-stone-950">
          Что-то пошло не так
        </h1>

        <p className="mb-6 leading-7 text-stone-600">
          {error.message || "Произошла непредвиденная ошибка. Попробуйте обновить страницу."}
        </p>

        <button
          onClick={reset}
          className="inline-flex rounded-2xl bg-[#d8a342] px-6 py-3 font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
        >
          Попробовать снова
        </button>
      </div>
    </main>
  );
}
