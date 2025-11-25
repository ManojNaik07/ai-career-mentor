"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import PPTXGenJS from "pptxgenjs";

interface Pathway {
  title: string;
  description: string;
  steps: string[];
}

interface RoadmapData {
  pathways: Pathway[];
}

export default function Home() {
  const [profile, setProfile] = useState({ age: "", education: "", interests: "" });
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false); // Default to false, wait for role check

  // Role-based logic
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      console.log("Received message from parent:", event.data); // Debug log

      if (event.data?.type === "USER_ROLES") {
        const roleCollections: string[] = event.data.payload;
        console.log("User Roles:", roleCollections);

        if (roleCollections.includes("SO Admin") || roleCollections.includes("SO Manager")) {
          setCanGenerate(true);
        } else {
          setCanGenerate(false);
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleSubmit = async () => {
    if (!profile.age || !profile.education || !profile.interests) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    setRoadmapData(null);

    try {
      const res = await fetch("http://localhost:3001/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      const data = await res.json();
      console.log("Raw response from backend:", data); // Debug log

      // Parse the JSON string from the LLM
      let parsedData: RoadmapData;
      try {
        let cleanJson = data.roadmap.trim();
        // Remove markdown code blocks if present
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        parsedData = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse JSON. Raw text:", data.roadmap);
        console.error("Parse error:", e);
        // Fallback if LLM returns plain text
        parsedData = {
          pathways: [
            {
              title: "Generated Roadmap (Text Format)",
              description: "The AI returned a text response instead of structured data.",
              steps: data.roadmap.split("\n").filter((l: string) => l.trim() !== "")
            }
          ]
        };
      }

      setRoadmapData(parsedData);
    } catch (err: any) {
      console.error("Error calling backend:", err);
      alert(`Failed to generate roadmap: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!roadmapData) return;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("AI Career Mentor - Roadmap", 20, 20);

    doc.setFontSize(12);
    doc.text(`Profile: Age ${profile.age}, ${profile.education}, ${profile.interests}`, 20, 30);

    let y = 50;
    roadmapData.pathways.forEach((pathway, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204);
      doc.text(`${index + 1}. ${pathway.title}`, 20, y);
      y += 10;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(pathway.description, 20, y, { maxWidth: 170 });
      y += 15;

      pathway.steps.forEach((step) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`• ${step}`, 30, y);
        y += 8;
      });

      y += 15;
    });

    doc.save("career-roadmap.pdf");
  };

  const downloadPPT = () => {
    if (!roadmapData) return;
    const pptx = new PPTXGenJS();

    // Title Slide
    const slide = pptx.addSlide();
    slide.addText("AI Career Mentor", { x: 1, y: 1, fontSize: 24, bold: true, color: "363636" });
    slide.addText(`Roadmap for: ${profile.education}, ${profile.interests}`, { x: 1, y: 2, fontSize: 18, color: "666666" });

    // Pathway Slides
    roadmapData.pathways.forEach((pathway) => {
      const pSlide = pptx.addSlide();
      pSlide.addText(pathway.title, { x: 0.5, y: 0.5, fontSize: 22, bold: true, color: "0066CC" });
      pSlide.addText(pathway.description, { x: 0.5, y: 1.2, fontSize: 14, color: "333333" });

      const stepsText = pathway.steps.map(s => `• ${s}`).join("\n");
      pSlide.addText(stepsText, { x: 0.5, y: 2, w: "90%", h: "60%", fontSize: 14, color: "000000", lineSpacing: 28 });
    });

    pptx.writeFile({ fileName: "career-roadmap.pptx" });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-10">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            AI Career Mentor
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Discover your potential career paths with personalized AI guidance based on your education and interests.
          </p>
        </div>

        {/* Input Form */}
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Age</label>
            <input
              type="number"
              placeholder="e.g. 22"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Education</label>
            <input
              type="text"
              placeholder="e.g. B.Tech in Computer Science"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={profile.education}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Interests</label>
            <input
              type="text"
              placeholder="e.g. Coding, Design, AI"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={profile.interests}
              onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
            />
          </div>

          {/* Generate Button - Only visible if authorized */}
          {/* For demo purposes, if you want to bypass auth, remove the condition */}
          <button
            onClick={handleSubmit}
            disabled={loading || !canGenerate}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${canGenerate
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white cursor-pointer"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : !canGenerate ? (
              "Unauthorized Access"
            ) : (
              "Generate Roadmap"
            )}
          </button>
        </div>

        {/* Results Section */}
        {roadmapData && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Your Career Pathways</h2>
              <div className="flex gap-4">
                <button
                  onClick={downloadPDF}
                  className="px-6 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                  Download PDF
                </button>
                <button
                  onClick={downloadPPT}
                  className="px-6 py-2 bg-orange-500/80 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                  Download PPT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roadmapData.pathways.map((pathway, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-xl font-bold text-blue-400">{idx + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{pathway.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{pathway.description}</p>

                  <div className="space-y-3">
                    {pathway.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-3">
                        <div className="min-w-[6px] h-[6px] rounded-full bg-blue-400 mt-2"></div>
                        <p className="text-gray-300 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
