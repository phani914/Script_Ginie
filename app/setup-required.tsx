export default function SetupRequired() {
  return (
    <main className="shell">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <span>SG</span>
          </span>
          <span className="brand-title">
            <span className="brand-name">ScriptGenie</span>
            <span className="brand-subtitle">Telugu Gaming AI</span>
          </span>
        </div>
      </nav>
      <section className="auth-page">
        <div className="auth-card">
          <h1 style={{ fontSize: 34 }}>Add your app keys</h1>
          <p className="muted">
            The app is built, but it needs Supabase, Gemini, and Razorpay keys
            before login and generation can run.
          </p>
          <div className="script-text" style={{ minHeight: 0 }}>
            cp .env.example .env.local
            {"\n\n"}
            Then fill:
            {"\n"}NEXT_PUBLIC_SUPABASE_URL
            {"\n"}NEXT_PUBLIC_SUPABASE_ANON_KEY
            {"\n"}SUPABASE_SERVICE_ROLE_KEY
            {"\n"}GEMINI_API_KEY
            {"\n"}RAZORPAY_KEY_ID
            {"\n"}RAZORPAY_KEY_SECRET
            {"\n"}NEXT_PUBLIC_RAZORPAY_KEY_ID
          </div>
          <p className="muted">Also run the SQL in supabase/schema.sql.</p>
        </div>
      </section>
    </main>
  );
}
