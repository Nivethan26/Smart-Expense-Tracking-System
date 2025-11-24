import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const parseExpenseAI = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required" });
    }

    const today = new Date().toISOString().split("T")[0];

    const prompt = `
You are an assistant that extracts expense details from user text.
Return STRICT JSON ONLY with keys: amount (number), category (food|travel|shopping|bills|health|rent|entertainment|other), description (3-6 words), date (YYYY-MM-DD).

Input: "${text}"

If date is missing, use today's date: ${today}.
Do NOT return anything except JSON object.
`;

    // Use chat completion for reliable JSON
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You extract expenses in JSON format." },
        { role: "user", content: prompt },
      ],
    });

    let aiText = completion.choices[0].message.content.trim();

    // Extract JSON from any surrounding text
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("AI output invalid:", aiText);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    let parsed = JSON.parse(jsonMatch[0]);

    // Fallback for missing fields
    parsed.amount = parsed.amount || 0;
    parsed.category = parsed.category || "other";
    parsed.description = parsed.description || "";
    parsed.date = parsed.date || today;

    res.json(parsed);

  } catch (error) {
    console.error("AI Parse Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
