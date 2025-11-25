import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure Hugging Face Router via OpenAI SDK
const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1", // Hugging Face OpenAI-compatible endpoint
  apiKey: process.env.HF_TOKEN,                // put your HF token in Render env vars
});

// Root route (test)
app.get("/", (req, res) => {
  res.send("AI Career Mentor Backend is running 🚀");
});

// Roadmap endpoint
app.post("/roadmap", async (req, res) => {
  const { profile } = req.body;

  if (!profile?.age || !profile?.education || !profile?.interests) {
    return res
      .status(400)
      .json({ error: "Profile with age, education, and interests is required" });
  }

  const prompt = `Suggest 3 realistic low-cost career pathways for:
Age: ${profile.age}, Education: ${profile.education}, Interests: ${profile.interests}
Focus on low-cost options available in small towns of India.`;

  try {
    const completion = await client.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
      messages: [
        {
          role: "user",
          content: prompt + "\n\nIMPORTANT: Return the response ONLY in valid JSON format with the following structure:\n{\n  \"pathways\": [\n    {\n      \"title\": \"Career Option Title\",\n      \"description\": \"Brief description\",\n      \"steps\": [\"Step 1\", \"Step 2\", \"Step 3\"]\n    }\n  ]\n}",
        },
      ],
      response_format: { type: "json_object" },
    });

    const roadmap = completion.choices?.[0]?.message?.content || "Try again later";
    res.json({ roadmap });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ roadmap: "Error generating roadmap. Try again later." });
  }
});

// Use Render assigned port or fallback to 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});