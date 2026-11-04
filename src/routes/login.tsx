import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { HouseMark } from "@/components/mark";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-5 py-16">
      <img src="/images/hero-2.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-ink/80" />
      <div className="surface relative w-full max-w-md bg-panel/90 p-8 backdrop-blur-md md:p-10">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <HouseMark className="size-10 text-gold" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-brand">GOBINDA JEWELLERS</span>
            <span className="mt-1.5 text-xs tracking-label text-gold lowercase">private studio</span>
          </span>
        </Link>
        <h1 className="font-display text-3xl">Private Studio</h1>
        <p className="mt-2 text-sm leading-relaxed text-ivory-dim">
          Sign in using your invited email address and your own password. Only invited accounts can access the studio.
        </p>
        {isPending ? (
          <p className="mt-8 text-sm text-ivory-dim">Checking your session…</p>
        ) : user ? (
          <Link to="/admin" className="btn btn-gold mt-8 w-full">Open studio</Link>
        ) : authEnabled ? (
          <AuthForms />
        ) : (
          <p className="mt-6 text-sm text-ivory-dim">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}

function AuthForms() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({ email: email.trim().toLowerCase(), password, name: name.trim() || "Studio member" });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({ email: email.trim().toLowerCase(), password });
        if (err) throw new Error(err.message);
      }
      await navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-8 grid gap-3" onSubmit={onSubmit}>
      {mode === "up" ? (
        <input className="field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      ) : null}
      <input className="field" type="email" required placeholder="Gmail address" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="field" type="password" required minLength={8} placeholder="Password (at least 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button className="btn btn-gold w-full" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}</button>
      <button type="button" className="text-sm text-ivory-dim hover:text-gold" onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(null); }}>
        {mode === "in" ? "First time? Create your invited account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
