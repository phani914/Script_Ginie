import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
          <div className="eyebrow">Built for Telugu gaming creators</div>
          <h1>ScriptGenie</h1>
          <p className="lead">
            Generate high-energy Telugu and Tenglish YouTube scripts for BGMI,
            Free Fire, GTA, Valorant, Minecraft, gaming news, shorts, reviews,
            and challenge videos.
          </p>
          <div className="button-row">
            <Link className="btn btn-primary" href={user ? "/dashboard" : "/login"}>
              Generate a script
            </Link>
            <a className="btn btn-secondary" href="#pricing">
              View credit packs
            </a>
          </div>
        </div>

        <div className="panel">
          <div className="preview-script">
            <strong>Hook:</strong>
            {"\n"}Bro, rank push chestunnava but last zone lo eliminate
            aipothunnava?
            {"\n\n"}
            <strong>[SHOW GAMEPLAY]</strong>
            {"\n"}I roju nenu cheppina 5 simple tips follow ayithe, chicken
            dinner chances double avuthayi.
            {"\n\n"}
            <strong>Intro:</strong>
            {"\n"}Welcome back gamers. Video full chudandi, end lo bonus
            sensitivity setting kuda share chestha.
          </div>
        </div>
      </section>

      <section id="pricing" className="dashboard" style={{ paddingTop: 0 }}>
        <div>
          <h2>Start free, upgrade with credits</h2>
          <p className="muted">
            New users get 5 free scripts. Buy credits only when you need more.
          </p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <strong>Starter</strong>
            <div className="price">Rs 49</div>
            <p className="muted">20 scripts</p>
          </div>
          <div className="pricing-card">
            <strong>Creator</strong>
            <div className="price">Rs 99</div>
            <p className="muted">60 scripts</p>
          </div>
          <div className="pricing-card">
            <strong>Pro</strong>
            <div className="price">Rs 199</div>
            <p className="muted">150 scripts</p>
          </div>
        </div>
      </section>
    </main>
  );
}
