"use client";

import { useState } from "react";

export default function HomeDemo() {
  const [topic, setTopic] = useState("Free Fire lo rank push cheyyataniki top 5 tips");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateSample() {
    setError("");

    if (!topic.trim()) {
      setError("Enter a Telugu gaming topic first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/demo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not generate sample.");
      }

      setOutput(data.output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="demo-card" id="demo">
      <div className="status-strip">
        <div>
          <strong>Try it without signing up</strong>
          <div className="muted">Generate a short sample before creating an account.</div>
        </div>
        <span className="credit-pill">Free sample</span>
      </div>

      <div className="field">
        <label htmlFor="demo-topic">Video topic</label>
        <textarea
          id="demo-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="BGMI lo chicken dinner kosam top 5 mistakes avoid cheyyali"
        />
      </div>

      <button className="btn btn-primary" disabled={loading} onClick={generateSample} style={{ width: "100%" }}>
        {loading ? "Generating sample..." : "Generate free sample"}
      </button>

      {error ? <div className="error">{error}</div> : null}

      <div className="script-text demo-output">
        {output ||
          "Your sample hook and mini-script will appear here. Full accounts unlock longer scripts, saved history, titles, descriptions, tags, and Shorts ideas."}
      </div>
    </div>
  );
}
