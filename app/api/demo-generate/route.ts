import { NextResponse } from "next/server";

type DemoGenerateBody = {
  topic?: string;
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
    const { topic } = (await req.json()) as DemoGenerateBody;

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const prompt = `Write a short public demo sample for ScriptGenie.

Audience: Telugu gaming YouTube creators.
Topic: ${topic}
Language: Telugu + English mix.

Return only:
Hook:
Mini Script:
Thumbnail Text:

Keep it under 140 words. Make it energetic, natural, and creator-ready.`;

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
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 500
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
      return NextResponse.json({ error: "AI returned an empty sample." }, { status: 502 });
    }

    return NextResponse.json({ output });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
