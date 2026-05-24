import crypto from "crypto";
import { NextResponse } from "next/server";
import { getCreditPack } from "@/lib/credit-packs";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const {
      userId,
      packId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = await req.json();

    const pack = getCreditPack(packId);

    if (!userId || !pack || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment verification request." }, { status: 400 });
    }

    if (!hasSupabaseAdminEnv()) {
      return NextResponse.json({ error: "Supabase server keys are not configured." }, { status: 500 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Razorpay secret is not configured." }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment signature mismatch." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const nextCredits = profile.credits + pack.credits;

    await supabase.from("profiles").update({ credits: nextCredits }).eq("id", userId);
    await supabase
      .from("payments")
      .update({
        razorpay_payment_id,
        status: "paid"
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", userId);

    return NextResponse.json({ credits: nextCredits });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
