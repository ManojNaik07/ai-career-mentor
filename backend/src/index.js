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

// List of models to try in order of preference
const MODELS = [
  "meta-llama/Meta-Llama-3-8B-Instruct",  // Fast and good
  "mistralai/Mixtral-8x7B-Instruct-v0.1", // High quality
  "mistralai/Mistral-7B-Instruct-v0.3",   // Reliable
  "google/gemma-7b-it",                   // Google
  "microsoft/Phi-3-mini-4k-instruct"      // Fallback
];

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

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}...`);
      const completion = await client.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: prompt + "\n\nIMPORTANT: Return the response ONLY in valid JSON format with the following structure:\n{\n  \"pathways\": [\n    {\n      \"title\": \"Career Option Title\",\n      \"description\": \"Brief description\",\n      \"steps\": [\"Step 1\", \"Step 2\", \"Step 3\"]\n    }\n  ]\n}",
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
        // response_format: { type: "json_object" } // Removed strict mode to avoid compatibility issues with some models
      });

      const content = completion.choices?.[0]?.message?.content;

      if (content) {
        // Validate if it looks like JSON
        // We won't parse it here strictly, but we want to ensure it's not empty
        console.log(`Success with ${model}`);
        return res.json({ roadmap: content });
      }
    } catch (err) {
      console.error(`Failed with ${model}:`, err.message);
      lastError = err;
      // Continue to next model
    }
  }

  // If all failed
  console.error("All models failed.");
  res.status(500).json({
    roadmap: "Error generating roadmap. Please try again later.",
    details: lastError?.message
  });
});

// Use Render assigned port or fallback to 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});