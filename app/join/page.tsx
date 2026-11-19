"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type InviteInfo = {
  agency_name: string;
  email: string;
  full_name: string | null;
  role: string;
  account_exists: boolean;
};

async function callAccept(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("accept-agency-invite", { body });
  if (data?.success) return { ok: true as const, data };
  let payload: { error?: string; code?: string } | undefined = data;
  const context = (error as { context?: Response } | null)?.context;
  if (!payload?.error && context && typeof context.json === "function") {
    try {
      payload = await context.json();
    } catch {
      // ignore
    }
  }
  return { ok: false as const, error: payload?.error || "Something went wrong. Please try again.", code: payload?.code };
}

export default function JoinPage() {
  const [token, setToken] = useState("");
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
    (async () => {
      const { data } = await supabase.auth.getUser();
      setSignedInEmail(data.user?.email?.toLowerCase() ?? null);
      if (!value) {
        setLoadError("This invitation link is missing its code. Open the link from your email again.");
        return;
      }
      const result = await callAccept({ mode: "verify", token: value });
      if (!result.ok) {
        setLoadError(result.error);
        return;
      }
      setInvite(result.data as InviteInfo);
      setFullName((result.data as InviteInfo).full_name || "");
    })();
  }, []);

  const accept = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setError(null);
    if (invite && !invite.account_exists) {
      if (password.length < 8) return setError("Your password must be at least 8 characters.");
      if (password !== confirm) return setError("The passwords don't match.");
    }
    setBusy(true);
    const result = await callAccept({ mode: "accept", token, full_name: fullName, password });
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      return;
    }
    if (invite && !invite.account_exists) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: invite.email, password });
      if (signInError) {
        setBusy(false);
        setDone(true);
        return;
      }
    }
    window.location.assign("/dashboard");
  };

  const roleLabel = invite?.role === "estate_agent_admin" ? "an administrator" : "a team member";
  const signedInAsInvitee = invite && signedInEmail === invite.email;

  return (
    <main className="min-h-screen bg-[#FBF9F4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#D5D9D5] p-8">
        <Link href="/" className="text-xl font-bold text-[#3A3F3A]">LetHub</Link>

        {!invite && !loadError && <p className="mt-6 text-sm text-[#687068]">Checking your invitation…</p>}

        {loadError && (
          <div className="mt-6">
            <h1 className="text-xl font-bold text-[#3A3F3A]">We can&apos;t open this invitation</h1>
            <p role="alert" className="mt-2 text-sm text-[#687068]">{loadError}</p>
            <Link href="/login" className="mt-6 inline-block text-sm text-[#C28A78] underline">Go to sign in</Link>
          </div>
        )}

        {invite && done && (
          <div className="mt-6">
            <h1 className="text-xl font-bold text-[#3A3F3A]">You&apos;re in</h1>
            <p className="mt-2 text-sm text-[#687068]">Your account is ready. Sign in with {invite.email} to get started.</p>
            <Link href="/login" className="mt-6 inline-block bg-[#C28A78] text-white text-sm font-semibold px-4 py-2.5 rounded-lg">Sign in</Link>
          </div>
        )}

        {invite && !done && (
          <div className="mt-6">
            <h1 className="text-xl font-bold text-[#3A3F3A]">Join {invite.agency_name}</h1>
            <p className="mt-2 text-sm text-[#687068]">
              You&apos;ve been invited to join {invite.agency_name} on LetHub as {roleLabel}, using <strong>{invite.email}</strong>.
            </p>

            {invite.account_exists ? (
              signedInAsInvitee ? (
                <div className="mt-6 space-y-3">
                  {error && <p role="alert" className="text-sm text-[#C46868]">{error}</p>}
                  <button
                    type="button"
                    onClick={() => accept()}
                    disabled={busy}
                    className="w-full bg-[#C28A78] hover:bg-[#B07A69] text-white text-sm font-semibold px-4 py-3 rounded-lg disabled:opacity-60"
                  >
                    {busy ? "Joining…" : `Join ${invite.agency_name}`}
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-3 text-sm text-[#687068]">
                  <p>You already have a LetHub account with this email. Sign in, then open the invitation link again to accept it.</p>
                  {signedInEmail && <p>You&apos;re currently signed in as {signedInEmail}. Sign out first, then sign in as {invite.email}.</p>}
                  <Link
                    href={`/login?next=${encodeURIComponent(`/join?token=${token}`)}`}
                    className="inline-block bg-[#C28A78] text-white font-semibold px-4 py-2.5 rounded-lg"
                  >
                    Sign in
                  </Link>
                </div>
              )
            ) : (
              <form onSubmit={accept} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#3A3F3A]">Your name</span>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={160}
                    autoComplete="name"
                    className="mt-1 w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm outline-none focus:border-[#C28A78]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#3A3F3A]">Create a password</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm outline-none focus:border-[#C28A78]"
                  />
                  <span className="text-xs text-[#687068]">At least 8 characters. Passwords found in known data breaches aren&apos;t allowed.</span>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#3A3F3A]">Confirm password</span>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm outline-none focus:border-[#C28A78]"
                  />
                </label>
                {error && <p role="alert" className="text-sm text-[#C46868]">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-[#C28A78] hover:bg-[#B07A69] text-white text-sm font-semibold px-4 py-3 rounded-lg disabled:opacity-60"
                >
                  {busy ? "Setting up…" : "Create account and join"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
