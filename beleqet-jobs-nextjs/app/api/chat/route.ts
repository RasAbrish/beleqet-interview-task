import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

const SYSTEM_PROMPT = `You are "Beleqet Assistant", a friendly support chatbot for Beleqet Jobs — an Ethiopian hiring and freelance platform.
Help users with: finding and applying to jobs, creating an account, logging in, posting jobs as an employer, freelance gigs, and navigating the site.
Keep answers short, clear, and warm. Use simple language. If a question is unrelated to Beleqet or jobs, gently steer back. If you are unsure, suggest contacting support.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: "The assistant isn’t configured yet — an admin needs to add a GEMINI_API_KEY. In the meantime, browse jobs from the Find Jobs page or sign up to get started.",
    });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let msgs = parsed.messages;
  while (msgs.length && msgs[0].role !== "user") msgs = msgs.slice(1);
  if (!msgs.length) {
    return NextResponse.json({ reply: "Ask me anything about Beleqet Jobs!" });
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const contents = msgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini error", res.status, errText);
      return NextResponse.json({
        reply: "Sorry, I’m having trouble right now. Please try again in a moment.",
        detail: `Gemini ${res.status} (model: ${model}): ${errText.slice(0, 300)}`,
      });
    }

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim() ||
      "Sorry, I couldn’t come up with an answer. Could you rephrase?";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error", err);
    return NextResponse.json({ reply: "Sorry, I couldn’t reach the assistant. Please try again." });
  }
}
