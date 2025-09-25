// import express from "express";
// import fetch from "node-fetch";
// const app = express();
// app.use(express.json());



// // Example endpoint: Generate career roadmap
// app.post("/roadmap", async (req, res) => {
//   const { profile } = req.body;

//   // Build prompt
//   const prompt = `Suggest 3 realistic career pathways for:
//   Age: ${profile.age}, Education: ${profile.education}, Interests: ${profile.interests}
//   Focus on low-cost options available in small towns of India.`;

//   // Free HuggingFace API call (Mistral model)
//   const resp = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
//     method: "POST",
//     headers: { "Authorization": "Bearer " + process.env.HF_TOKEN },
//     body: JSON.stringify({ inputs: prompt })
//   });
//   const data = await resp.json();
//   res.json({ roadmap: data[0]?.generated_text || "Try again later" });
// });

// app.listen(3001, () => console.log("Backend running on 3001"));


// import express from "express";
// import fetch from "node-fetch";

// const app = express();
// app.use(express.json());

// // Root route (test)
// app.get("/", (req, res) => {
//   res.send("AI Career Mentor Backend is running 🚀");
// });

// // Roadmap endpoint
// app.post("/roadmap", async (req, res) => {
//   const { profile } = req.body;

//   const prompt = `Suggest 3 realistic career pathways for:
//   Age: ${profile.age}, Education: ${profile.education}, Interests: ${profile.interests}
//   Focus on low-cost options available in small towns of India.`;

//   try {
//     const resp = await fetch(
//       "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
//       {
//         method: "POST",
//         headers: { "Authorization": "Bearer " + process.env.HF_TOKEN },
//         body: JSON.stringify({ inputs: prompt }),
//       }
//     );

//     const data = await resp.json();
//     res.json({ roadmap: data[0]?.generated_text || "Try again later" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to generate roadmap" });
//   }
// });

// // Listen on Render-assigned port
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => console.log(`Backend running on ${PORT}`));







// import express from "express";
// import dotenv from "dotenv";
// import OpenAI from "openai";

// dotenv.config();

// const app = express();
// app.use(express.json());

// // Use environment variable for OpenAI API key
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Root route (test)
// app.get("/", (req, res) => {
//   res.send("AI Career Mentor Backend is running 🚀");
// });

// // Roadmap endpoint
// app.post("/roadmap", async (req, res) => {
//   const { profile } = req.body;

//   const prompt = `Suggest 3 realistic low-cost career pathways for:
// Age: ${profile.age}, Education: ${profile.education}, Interests: ${profile.interests}
// Focus on low-cost options available in small towns of India.`;

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//     });

//     const roadmap = completion.choices[0].message.content;
//     res.json({ roadmap });
//   } catch (error) {
//     console.error(error);
//     res.json({ roadmap: "Error generating roadmap. Try again later." });
//   }
// });

// // Use Render assigned port or fallback to 3001
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Backend running on port ${PORT}`);
// });








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
          content: prompt,
        },
      ],
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