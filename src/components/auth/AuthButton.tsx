"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function AuthButton() {
  const { user, loading, loginWithGoogle, loginWithEmail, signupWithEmail, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === "login") {
      await loginWithEmail(email, password);
    } else {
      await signupWithEmail(email, password);
    }
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
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
          >
            ログイン
          </button>
        ) : (
          <div className="absolute right-0 z-40 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">ログイン / 登録</p>
              <button
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                閉じる
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
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
                Googleで続ける
              </button>
              <div className="flex items-center justify-between rounded-full bg-slate-50 p-1 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-full px-3 py-1 ${
                    mode === "login" ? "bg-white text-emerald-700 shadow" : ""
                  }`}
                >
                  ログイン
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 rounded-full px-3 py-1 ${
                    mode === "signup" ? "bg-white text-emerald-700 shadow" : ""
                  }`}
                >
                  新規登録
                </button>
              </div>
              <form onSubmit={handleEmailLogin} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワード"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  {mode === "login" ? "メールでログイン" : "メールで登録"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const displayName = user.displayName ?? "Signed in";
  const photoURL = user.photoURL ?? undefined;

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
      {photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoURL}
          alt={displayName}
          className="h-7 w-7 rounded-full object-cover"
          width={28}
          height={28}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
          {displayName.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="text-sm font-semibold text-slate-800">{displayName}</span>
      <button
        onClick={logout}
        className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        ログアウト
      </button>
    </div>
  );
}
