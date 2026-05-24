import Link from "next/link";
import { signIn, signUp } from "@/app/actions";
import { hasSupabaseEnv } from "@/lib/env";
import SetupRequired from "@/app/setup-required";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  if (!hasSupabaseEnv()) {
    return <SetupRequired />;
  }

  return (
    <main className="shell">
      <nav className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <span>SG</span>
          </span>
          <span className="brand-title">
            <span className="brand-name">ScriptGenie</span>
            <span className="brand-subtitle">Telugu Gaming AI</span>
          </span>
        </Link>
      </nav>
      <section className="auth-page">
        <div className="auth-card">
          <h1 style={{ fontSize: 36 }}>Creator login</h1>
          <p className="muted">Use email and password to access your scripts.</p>

          <form>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" minLength={6} required />
            </div>
            <div className="button-row">
              <button className="btn btn-primary" formAction={signIn}>
                Login
              </button>
              <button className="btn btn-secondary" formAction={signUp}>
                Create account
              </button>
            </div>
          </form>

          {params.message ? <div className="error">{params.message}</div> : null}
        </div>
      </section>
    </main>
  );
}
