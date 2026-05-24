import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { getCreditPack } from "@/lib/credit-packs";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId, packId } = await req.json();
    const pack = getCreditPack(packId);

    if (!userId || !pack) {
      return NextResponse.json({ error: "Invalid credit pack." }, { status: 400 });
    }

    if (!hasSupabaseAdminEnv()) {
      return NextResponse.json({ error: "Supabase server keys are not configured." }, { status: 500 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay keys are not configured." }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await razorpay.orders.create({
      amount: pack.amount * 100,
      currency: "INR",
      receipt: `sg_${userId.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId,
        packId,
        credits: String(pack.credits)
      }
    });

    const supabase = createSupabaseAdminClient();
    await supabase.from("payments").insert({
      user_id: userId,
      razorpay_order_id: order.id,
      amount: pack.amount,
      credits_added: pack.credits,
      status: "created"
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      credits: pack.credits
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
