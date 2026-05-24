import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { creditPacks } from "@/lib/credit-packs";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SetupRequired from "@/app/setup-required";
import DashboardClient from "./script-generator";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return <SetupRequired />;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", user.id)
    .single();

  const { data: scripts } = await supabase
    .from("scripts")
    .select("id, topic, output, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main className="shell">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <span>SG</span>
          </span>
          <span className="brand-title">
            <span className="brand-name">ScriptGenie</span>
            <span className="brand-subtitle">Creator Dashboard</span>
          </span>
        </div>
        <div className="nav-actions">
          <span className="credit-pill">{profile?.credits ?? 0} credits</span>
          <form action={signOut}>
            <button className="btn btn-secondary">Logout</button>
          </form>
        </div>
      </nav>

      <DashboardClient
        userId={user.id}
        initialCredits={profile?.credits ?? 0}
        initialScripts={scripts ?? []}
        creditPacks={[...creditPacks]}
        razorpayKeyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""}
      />
    </main>
  );
}
