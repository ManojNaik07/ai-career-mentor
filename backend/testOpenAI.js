import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Suggest 3 low-cost career pathways for a 20-year-old interested in AI and programming." }
      ],
    });
    console.log("AI Response:", completion.choices[0].message.content);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
