import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import HomeDemo from "./home-demo";
import SetupRequired from "./setup-required";

export default async function HomePage() {
  if (!hasSupabaseEnv()) {
    return <SetupRequired />;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

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
        <div className="nav-actions">
          {user ? (
            <Link className="btn btn-primary" href="/dashboard">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn-ghost" href="/login">
                Login
              </Link>
              <Link className="btn btn-primary" href="/login">
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Script raayadam 2 hours to 2 minutes</div>
          <h1>Post more Telugu gaming videos, stress less.</h1>
          <p className="lead">
            Turn one BGMI, Free Fire, Valorant, GTA, or Minecraft idea into a
            creator-ready Telugu/Tenglish script with hooks, gameplay cues,
            titles, tags, descriptions, and Shorts angles.
          </p>
          <div className="button-row">
            <a className="btn btn-primary" href="#demo">
              Try free sample
            </a>
            <Link className="btn btn-primary" href={user ? "/dashboard" : "/login"}>
              Save full scripts
            </Link>
            <a className="btn btn-secondary" href="#pricing">
              View credit packs
            </a>
          </div>
          <div className="proof-row">
            <span>Beta tool tested with real generation, credits, and payments</span>
            <span>Scripts are saved after login</span>
            <span>Built for Telugu gaming workflows</span>
          </div>
        </div>

        <HomeDemo />
      </section>

      <section className="trust-band">
        <div>
          <strong>Creator problem</strong>
          <span>Daily posting gets stuck when scripting takes too long.</span>
        </div>
        <div>
          <strong>ScriptGenie output</strong>
          <span>Hook, script, gameplay directions, CTA, description, tags.</span>
        </div>
        <div>
          <strong>Paid value</strong>
          <span>Login keeps every generated script in your account history.</span>
        </div>
      </section>

      <section id="pricing" className="dashboard" style={{ paddingTop: 0 }}>
        <div>
          <h2>Pick credits by posting schedule</h2>
          <p className="muted">
            New users get 5 free scripts. Buy credits when you want to keep a
            steady upload rhythm.
          </p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <strong>Starter</strong>
            <div className="price">Rs 49</div>
            <p className="muted">20 scripts</p>
            <p>Good for 2-3 weeks at 1 video every other day.</p>
          </div>
          <div className="pricing-card">
            <strong>Creator</strong>
            <div className="price">Rs 99</div>
            <p className="muted">60 scripts</p>
            <p>About 2 months of daily content at 1 video per day.</p>
          </div>
          <div className="pricing-card">
            <strong>Pro</strong>
            <div className="price">Rs 199</div>
            <p className="muted">150 scripts</p>
            <p>Enough for daily videos plus Shorts experiments.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
