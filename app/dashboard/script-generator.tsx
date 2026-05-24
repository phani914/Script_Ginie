"use client";

import { useMemo, useState } from "react";

type ScriptRow = {
  id: string;
  topic: string;
  output: string;
  created_at: string;
};

type CreditPack = {
  id: string;
  name: string;
  amount: number;
  credits: number;
};

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme: { color: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function DashboardClient({
  userId,
  initialCredits,
  initialScripts,
  creditPacks,
  razorpayKeyId
}: {
  userId: string;
  initialCredits: number;
  initialScripts: ScriptRow[];
  creditPacks: CreditPack[];
  razorpayKeyId: string;
}) {
  const [topic, setTopic] = useState("");
  const [game, setGame] = useState("BGMI");
  const [videoType, setVideoType] = useState("Tips and tricks");
  const [languageStyle, setLanguageStyle] = useState("Telugu + English mix");
  const [length, setLength] = useState("3 minute video");
  const [tone, setTone] = useState("Hype and funny");
  const [credits, setCredits] = useState(initialCredits);
  const [scripts, setScripts] = useState(initialScripts);
  const [output, setOutput] = useState(initialScripts[0]?.output ?? "");
  const [loading, setLoading] = useState(false);
  const [payingPack, setPayingPack] = useState<string | null>(null);
  const [error, setError] = useState("");

  const wordCount = useMemo(() => {
    return output.trim() ? output.trim().split(/\s+/).length : 0;
  }, [output]);

  async function generateScript() {
    setError("");

    if (!topic.trim()) {
      setError("Enter a video topic first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          topic,
          game,
          videoType,
          languageStyle,
          length,
          tone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setOutput(data.output);
      setCredits(data.credits);
      setScripts((current) => [
        {
          id: data.scriptId,
          topic,
          output: data.output,
          created_at: new Date().toISOString()
        },
        ...current
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function copyScript() {
    await navigator.clipboard.writeText(output);
  }

  async function loadRazorpayScript() {
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function buyCredits(packId: string) {
    setError("");
    setPayingPack(packId);

    try {
      if (!razorpayKeyId) {
        throw new Error("Add NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local first.");
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Could not load Razorpay checkout.");
      }

      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, packId })
      });
      const order = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(order.error || "Could not create payment order.");
      }

      const checkout = new window.Razorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: "INR",
        name: "ScriptGenie",
        description: `${order.credits} script credits`,
        order_id: order.orderId,
        theme: { color: "#e43d30" },
        handler: async (response) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, packId, ...response })
          });
          const verified = await verifyRes.json();

          if (!verifyRes.ok) {
            setError(verified.error || "Payment verification failed.");
            return;
          }

          setCredits(verified.credits);
        }
      });

      checkout.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setPayingPack(null);
    }
  }

  return (
    <section className="dashboard">
      <div>
        <div className="generator">
          <div className="status-strip">
            <strong>Create script</strong>
            <span className="credit-pill">{credits} credits left</span>
          </div>

          <div className="field">
            <label htmlFor="topic">Video topic</label>
            <textarea
              id="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Free Fire lo rank push cheyyataniki top 5 tips"
            />
          </div>

          <div className="grid-two">
            <div className="field">
              <label htmlFor="game">Game</label>
              <select id="game" value={game} onChange={(event) => setGame(event.target.value)}>
                <option>BGMI</option>
                <option>Free Fire</option>
                <option>GTA</option>
                <option>Valorant</option>
                <option>Minecraft</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="videoType">Video type</label>
              <select
                id="videoType"
                value={videoType}
                onChange={(event) => setVideoType(event.target.value)}
              >
                <option>Tips and tricks</option>
                <option>Game review</option>
                <option>Gaming news</option>
                <option>Challenge video</option>
                <option>Tier list</option>
                <option>Shorts script</option>
              </select>
            </div>
          </div>

          <div className="grid-two">
            <div className="field">
              <label htmlFor="language">Language style</label>
              <select
                id="language"
                value={languageStyle}
                onChange={(event) => setLanguageStyle(event.target.value)}
              >
                <option>Pure Telugu</option>
                <option>Telugu + English mix</option>
                <option>English with Telugu feel</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="length">Length</label>
              <select
                id="length"
                value={length}
                onChange={(event) => setLength(event.target.value)}
              >
                <option>YouTube Shorts</option>
                <option>3 minute video</option>
                <option>5 minute video</option>
                <option>8 minute video</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="tone">Tone</label>
            <select id="tone" value={tone} onChange={(event) => setTone(event.target.value)}>
              <option>Hype and funny</option>
              <option>Mass Telugu creator style</option>
              <option>Beginner-friendly</option>
              <option>Informative and clean</option>
              <option>Dramatic and suspenseful</option>
            </select>
          </div>

          <button className="btn btn-primary" disabled={loading} onClick={generateScript} style={{ width: "100%" }}>
            {loading ? "Generating..." : "Generate script"}
          </button>

          {error ? <div className="error">{error}</div> : null}
        </div>

        <div style={{ height: 16 }} />

        <div className="generator">
          <strong>Buy credits</strong>
          <div className="pricing-grid" style={{ marginTop: 12 }}>
            {creditPacks.map((pack) => (
              <div className="pricing-card" key={pack.id}>
                <strong>{pack.name}</strong>
                <div className="price">Rs {pack.amount}</div>
                <p className="muted">{pack.credits} scripts</p>
                <button
                  className="btn btn-secondary"
                  disabled={payingPack === pack.id}
                  onClick={() => buyCredits(pack.id)}
                >
                  {payingPack === pack.id ? "Opening..." : "Buy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="output">
          <div className="status-strip">
            <div>
              <strong>Your script</strong>
              <div className="muted">{wordCount ? `${wordCount} words` : "Generated script appears here"}</div>
            </div>
            <button className="btn btn-secondary" disabled={!output} onClick={copyScript}>
              Copy
            </button>
          </div>
          <div className="script-text">
            {output ||
              "Pick a game, video style, and topic. ScriptGenie will create a Telugu creator-ready script with hook, stage directions, CTA, title ideas, description, tags, and a Shorts version."}
          </div>
        </div>

        <div style={{ height: 16 }} />

        <div className="generator">
          <strong>Recent scripts</strong>
          <div className="history-list" style={{ marginTop: 12 }}>
            {scripts.length ? (
              scripts.map((script) => (
                <button
                  className="history-item"
                  key={script.id}
                  onClick={() => setOutput(script.output)}
                  style={{ textAlign: "left" }}
                >
                  <strong>{script.topic}</strong>
                  <div className="muted">{new Date(script.created_at).toLocaleString()}</div>
                </button>
              ))
            ) : (
              <p className="muted">No saved scripts yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
