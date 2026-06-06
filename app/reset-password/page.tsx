import Link from "next/link";
import { resetPasswordAction } from "./actions";
import PasswordInput from "@/components/PasswordInput";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";
  const error = params.error;

  const isExpired = error === "expired";
  const hasValidationError = error === "1";
  const hasToken = token.length > 0;

  return (
    <main className="min-h-screen overflow-hidden bg-[#07181c] text-[#fff8e8]">
      <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(58,166,160,0.18),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(216,163,66,0.16),transparent_24%),linear-gradient(180deg,#07181c_0%,#0b2428_100%)]" />

        <div className="relative w-full max-w-md rounded-[2.2rem] border border-[#e4d4bf] bg-[#fbf7f1] p-8 text-stone-950 shadow-2xl shadow-black/30 md:p-9">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
            Новый пароль
          </h1>

          {isExpired || !hasToken ? (
            <>
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                {isExpired
                  ? "Срок действия ссылки истёк. Пожалуйста, запросите новую."
                  : "Недействительная ссылка для сброса пароля."}
              </div>

              <Link
                href="/forgot-password"
                className="block w-full rounded-2xl bg-[#d8a342] px-5 py-3 text-center font-extrabold !text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
              >
                Запросить новую ссылку
              </Link>
            </>
          ) : (
            <>
              <p className="mb-7 leading-7 text-stone-600">
                Придумайте новый пароль для вашего аккаунта. Минимум 6 символов.
              </p>

              {hasValidationError && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                  Пароль должен содержать не менее 6 символов.
                </div>
              )}

              <form action={resetPasswordAction} className="space-y-4">
                <input type="hidden" name="token" value={token} />

                <div>
                  <label className="mb-2 block text-sm font-bold text-stone-800">
                    Новый пароль
                  </label>
                  <PasswordInput
                    name="password"
                    required
                    autoComplete="new-password"
                    placeholder="Не менее 6 символов"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold !text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
                >
                  Сохранить пароль
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
