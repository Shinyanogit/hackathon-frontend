"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function AuthButton() {
  const { user, loading, loginWithGoogle, loginWithEmail, signupWithEmail, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [provider, setProvider] = useState<"email" | null>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const openWithMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    setProvider("email");
    setOpen(true);
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === "login") {
      await loginWithEmail(email, password);
    } else {
      await signupWithEmail(email, password);
    }
    setOpen(false);
  };

  const handleGoogle = async () => {
    await loginWithGoogle();
    setOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
        <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
        <span>Loading</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={() => openWithMode("login")}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 whitespace-nowrap"
        >
          ログイン
        </button>

        {open && (
          <div className="absolute right-0 z-40 mt-2 w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {mode === "login" ? "ログイン" : "新規登録"}
                </p>
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setProvider("email");
                  }}
                  className="mt-1 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  {mode === "login" ? "アカウントが必要ですか？新規登録" : "すでに登録済みですか？ログイン"}
                </button>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                閉じる
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogle}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                      <path
                        fill="#EA4335"
                        d="M12 11v3.6h5.1C16.7 16.8 15 18.4 12 18.4c-3.3 0-6-2.7-6-6s2.7-6 6-6c1.6 0 3 .6 4.1 1.6l2.6-2.6C16.9 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c5.2 0 9.3-3.7 9.3-9 0-.6-.1-1.2-.2-1.8H12Z"
                      />
                      <path fill="#4285F4" d="M21.3 12c0-.6-.1-1.2-.2-1.8H12v3.6h5.1c-.3 1-.9 1.8-1.7 2.4l2.6 2.6c1.5-1.4 2.3-3.4 2.3-5.8Z" />
                      <path fill="#34A853" d="M5.5 14.3c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2.1L2.9 7.6C2.3 8.9 2 10.4 2 12c0 1.6.3 3.1.9 4.4z" />
                      <path fill="#FBBC05" d="M12 5.9c1.6 0 3 .6 4.1 1.6l2.6-2.6C16.9 3.4 14.6 2.5 12 2.5c-5.2 0-9.3 4.3-9.3 9.5 0 1.6.3 3.1.9 4.4l2.6-2.6c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2.1Z" />
                    </svg>
                  </span>
                  {mode === "login" ? "Googleでログイン" : "Googleで登録"}
                </button>

                <button
                  type="button"
                  onClick={() => setProvider("email")}
                  className={`w-full rounded-full border px-3 py-2 text-sm font-semibold transition ${
                    provider === "email"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-800 hover:border-emerald-200 hover:text-emerald-700"
                  }`}
                >
                  {mode === "login" ? "メールでログイン" : "メールで登録"}
                </button>
              </div>

              {provider === "email" && (
                <form onSubmit={handleEmailSubmit} className="space-y-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワード"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    {mode === "login" ? "メールでログイン" : "メールで登録"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const displayName = user.displayName ?? "Signed in";
  const photoURL = user.photoURL ?? undefined;

  return (
    <Link
      href="/mypage"
      className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      aria-label="マイページ"
    >
      {photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoURL}
          alt={displayName}
          className="h-9 w-9 rounded-full object-cover"
          width={36}
          height={36}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
          {displayName.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="sr-only">マイページ</span>
      <span className="pointer-events-none absolute top-[120%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition duration-150 group-hover:top-[130%] group-hover:opacity-100 group-focus-visible:top-[130%] group-focus-visible:opacity-100">
        マイページへ
      </span>
    </Link>
  );
}
