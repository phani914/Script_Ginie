import { NextResponse } from "next/server";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type GenerateBody = {
  userId?: string;
  topic?: string;
  game?: string;
  videoType?: string;
  languageStyle?: string;
  length?: string;
  tone?: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export async function POST(req: Request) {
  try {
    if (!hasSupabaseAdminEnv()) {
      return NextResponse.json({ error: "Supabase server keys are not configured." }, { status: 500 });
    }

    const body = (await req.json()) as GenerateBody;
    const { userId, topic, game, videoType, languageStyle, length, tone } = body;

    if (!userId || !topic?.trim()) {
      return NextResponse.json({ error: "Missing user or topic." }, { status: 400 });
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

    if (profile.credits <= 0) {
      return NextResponse.json({ error: "No credits left. Buy a credit pack to continue." }, { status: 402 });
    }

    const systemPrompt = `You are ScriptGenie, an expert YouTube script writer for Telugu gaming content creators in India.
You understand Telugu gaming culture, Indian mobile gaming, creator pacing, Telugu/Tenglish speech, retention hooks, and games like BGMI, Free Fire, GTA, Valorant, and Minecraft.

Always return this structure:
Title Ideas:
Thumbnail Text:
Hook:
Intro:
Main Script:
Gameplay Directions:
Engagement CTA:
Outro:
YouTube Description:
Tags:
Shorts Version:

Make the writing natural, energetic, creator-ready, and specific. Include stage directions like [SHOW GAMEPLAY], [SCREEN TEXT], [ZOOM IN], and [PAUSE].`;

    const userPrompt = `Create a Telugu gaming YouTube script.

Topic: ${topic}
Game: ${game || "Not specified"}
Video type: ${videoType || "General gaming video"}
Language style: ${languageStyle || "Telugu + English mix"}
Length: ${length || "3 minute video"}
Tone: ${tone || "Hype and funny"}

Avoid generic filler. Make the first 10 seconds strong. Include practical creator cues and audience engagement.`;

    const apiKey = requiredEnv("GEMINI_API_KEY");
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.85,
            topP: 0.95,
            maxOutputTokens: 1800
          }
        })
      }
    );

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      return NextResponse.json(
        { error: geminiData.error?.message || "Gemini generation failed." },
        { status: 502 }
      );
    }

    const output =
      geminiData.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("")
        .trim() || "";

    if (!output) {
      return NextResponse.json({ error: "AI returned an empty script." }, { status: 502 });
    }

    const { data: script, error: scriptError } = await supabase
      .from("scripts")
      .insert({
        user_id: userId,
        topic,
        game,
        video_type: videoType,
        language_style: languageStyle,
        length,
        tone,
        output
      })
      .select("id")
      .single();

    if (scriptError || !script) {
      return NextResponse.json({ error: "Could not save script." }, { status: 500 });
    }

    const nextCredits = profile.credits - 1;
    await supabase.from("profiles").update({ credits: nextCredits }).eq("id", userId);

    return NextResponse.json({
      output,
      scriptId: script.id,
      credits: nextCredits
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
