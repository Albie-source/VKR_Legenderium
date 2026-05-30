"use client";

import { useState } from "react";

type PasswordInputProps = {
  name: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
};

export default function PasswordInput({
  name,
  placeholder = "Введите пароль",
  required,
  minLength,
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-3 pr-12 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 transition hover:text-stone-700"
      >
        {visible ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
