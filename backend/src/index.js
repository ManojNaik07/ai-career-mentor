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


import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Root route (test)
app.get("/", (req, res) => {
  res.send("AI Career Mentor Backend is running 🚀");
});

// Roadmap endpoint
app.post("/roadmap", async (req, res) => {
  const { profile } = req.body;

  const prompt = `Suggest 3 realistic career pathways for:
  Age: ${profile.age}, Education: ${profile.education}, Interests: ${profile.interests}
  Focus on low-cost options available in small towns of India.`;

  try {
    const resp = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
      {
        method: "POST",
        headers: { "Authorization": "Bearer " + process.env.HF_TOKEN },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    const data = await resp.json();
    res.json({ roadmap: data[0]?.generated_text || "Try again later" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});

// Listen on Render-assigned port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
