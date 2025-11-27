"use client";

import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import PPTXGenJS from "pptxgenjs";

// --- Types ---

interface Pathway {
  title: string;
  description: string;
  steps: string[];
}

interface RoadmapData {
  pathways: Pathway[];
}

interface CustomSection {
  id: string;
  title: string;
  content: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  profilePic: string | null;
  education: { institution: string; degree: string; year: string }[];
  experience: { company: string; role: string; duration: string; description: string }[];
  skills: string;
  languages: string;
  hobbies: string;
  achievements: string;
  publications: string;
  customSections: CustomSection[];
}

// --- Main Component ---

export default function Home() {
  const [activeTab, setActiveTab] = useState<"roadmap" | "resume">("roadmap");

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-12 relative overflow-hidden bg-gray-900 text-white">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="z-10 w-full max-w-7xl flex flex-col items-center gap-8">

        {/* Header & Nav */}
        <div className="text-center space-y-6 w-full print:hidden">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            AI Career Mentor
          </h1>

          <div className="flex flex-wrap justify-center gap-4 w-full">
            <button onClick={() => setActiveTab("roadmap")} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${activeTab === "roadmap" ? "bg-blue-600 text-white shadow-lg" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>Career Roadmap</button>
            <button onClick={() => setActiveTab("resume")} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${activeTab === "resume" ? "bg-purple-600 text-white shadow-lg" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>Resume Builder</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full">
          {activeTab === "roadmap" ? <RoadmapGenerator /> : <ResumeBuilder />}
        </div>
      </div>
    </main>
  );
}

// --- Roadmap Component ---

function RoadmapGenerator() {
  const [profile, setProfile] = useState({ age: "", education: "", interests: "" });
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [canGenerate, setCanGenerate] = useState(true); // Default to true for testing

  // Role-based logic (Commented out for testing)
  /*
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
  */

  const handleSubmit = async () => {
    if (!profile.age || !profile.education || !profile.interests) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    setRoadmapData(null);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      let parsedData: RoadmapData;
      try {
        let cleanJson = data.roadmap.trim();
        if (cleanJson.startsWith("```json")) cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        else if (cleanJson.startsWith("```")) cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
        parsedData = JSON.parse(cleanJson);
      } catch (e) {
        parsedData = { pathways: [{ title: "Generated Roadmap", description: "Text response.", steps: data.roadmap.split("\n").filter((l: string) => l.trim() !== "") }] };
      }
      setRoadmapData(parsedData);
    } catch (err: any) {
      alert(`Failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!roadmapData) return;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text("Career Roadmap", 20, 20);
    doc.setFontSize(12); doc.text(`For: ${profile.education}`, 20, 30);
    let y = 50;
    roadmapData.pathways.forEach((p, i) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(16); doc.setTextColor(0, 102, 204); doc.text(`${i + 1}. ${p.title}`, 20, y); y += 10;
      doc.setFontSize(12); doc.setTextColor(0, 0, 0); doc.text(p.description, 20, y, { maxWidth: 170 }); y += 15;
      p.steps.forEach(s => { if (y > 270) { doc.addPage(); y = 20; } doc.text(`• ${s}`, 30, y); y += 8; });
      y += 15;
    });
    doc.save("roadmap.pdf");
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
    <div className="flex flex-col items-center gap-10 w-full">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Age</label>
          <input type="number" placeholder="e.g. 22" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Education</label>
          <input type="text" placeholder="e.g. B.Tech in Computer Science" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={profile.education} onChange={(e) => setProfile({ ...profile, education: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Interests</label>
          <input type="text" placeholder="e.g. Coding, Design, AI" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={profile.interests} onChange={(e) => setProfile({ ...profile, interests: e.target.value })} />
        </div>

        <button onClick={handleSubmit} disabled={loading || !canGenerate} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${canGenerate ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white cursor-pointer" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}>
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

      {roadmapData && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">Your Career Pathways</h2>
            <div className="flex gap-4">
              <button onClick={downloadPDF} className="px-6 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm">Download PDF</button>
              <button onClick={downloadPPT} className="px-6 py-2 bg-orange-500/80 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm">Download PPT</button>
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
  );
}

// --- Resume Builder ---

function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>({
    fullName: "", email: "", phone: "", address: "", summary: "", profilePic: null,
    education: [], experience: [], skills: "", languages: "", hobbies: "", achievements: "", publications: "", customSections: []
  });
  const [template, setTemplate] = useState<1 | 2 | 3>(1);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("resumeData");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const saveResume = () => {
    localStorage.setItem("resumeData", JSON.stringify(data));
    alert("Resume saved successfully!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setData({ ...data, profilePic: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const addCustomSection = () => {
    if (!newSectionTitle.trim()) return;
    setData({
      ...data,
      customSections: [...data.customSections, { id: Date.now().toString(), title: newSectionTitle, content: "" }]
    });
    setNewSectionTitle("");
  };

  const updateCustomSection = (id: string, content: string) => {
    setData({
      ...data,
      customSections: data.customSections.map(s => s.id === id ? { ...s, content } : s)
    });
  };

  const removeCustomSection = (id: string) => {
    setData({
      ...data,
      customSections: data.customSections.filter(s => s.id !== id)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      {/* Editor */}
      <div className="space-y-6 bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 h-auto sm:h-[800px] overflow-y-auto custom-scrollbar print:hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold">Resume Details</h2>
          <button onClick={saveResume} className="px-4 py-2 bg-blue-600 rounded text-sm font-bold hover:bg-blue-500">Save Progress</button>
        </div>

        <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
          {[1, 2, 3].map(t => (
            <button key={t} onClick={() => setTemplate(t as any)} className={`flex-1 min-w-[100px] py-2 rounded border ${template === t ? "bg-blue-500 border-blue-500" : "border-white/10"}`}>Template {t}</button>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-blue-400 font-semibold">Profile</h3>
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-white/10 rounded-full overflow-hidden flex items-center justify-center">
              {data.profilePic ? <img src={data.profilePic} className="w-full h-full object-cover" /> : <span className="text-xs">Pic</span>}
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-400" />
          </div>
          <input placeholder="Full Name" className="w-full bg-black/20 border border-white/10 rounded p-2" value={data.fullName} onChange={e => setData({ ...data, fullName: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Email" className="w-full bg-black/20 border border-white/10 rounded p-2" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
            <input placeholder="Phone" className="w-full bg-black/20 border border-white/10 rounded p-2" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} />
          </div>
          <input placeholder="Address" className="w-full bg-black/20 border border-white/10 rounded p-2" value={data.address} onChange={e => setData({ ...data, address: e.target.value })} />
          <textarea placeholder="Summary" className="w-full bg-black/20 border border-white/10 rounded p-2 h-24" value={data.summary} onChange={e => setData({ ...data, summary: e.target.value })} />
        </div>

        <div className="space-y-4">
          <h3 className="text-blue-400 font-semibold">Education (One per line: Degree, School, Year)</h3>
          <textarea className="w-full bg-black/20 border border-white/10 rounded p-2 h-24"
            value={data.education.map(e => `${e.degree}, ${e.institution}, ${e.year}`).join('\n')}
            onChange={e => setData({ ...data, education: e.target.value.split('\n').map(l => { const [d, i, y] = l.split(','); return { degree: d?.trim() || "", institution: i?.trim() || "", year: y?.trim() || "" }; }) })} />
        </div>

        <div className="space-y-4">
          <h3 className="text-blue-400 font-semibold">Experience (One per line: Role, Company, Duration)</h3>
          <textarea className="w-full bg-black/20 border border-white/10 rounded p-2 h-24"
            value={data.experience.map(e => `${e.role}, ${e.company}, ${e.duration}`).join('\n')}
            onChange={e => setData({ ...data, experience: e.target.value.split('\n').map(l => { const [r, c, d] = l.split(','); return { role: r?.trim() || "", company: c?.trim() || "", duration: d?.trim() || "", description: "" }; }) })} />
        </div>

        <div className="space-y-4">
          <h3 className="text-blue-400 font-semibold">Skills & Extras</h3>
          <input placeholder="Skills" className="w-full bg-black/20 border border-white/10 rounded p-2" value={data.skills} onChange={e => setData({ ...data, skills: e.target.value })} />
          <input placeholder="Languages" className="w-full bg-black/20 border border-white/10 rounded p-2" value={data.languages} onChange={e => setData({ ...data, languages: e.target.value })} />
          <input placeholder="Hobbies" className="w-full bg-black/20 border border-white/10 rounded p-2" value={data.hobbies} onChange={e => setData({ ...data, hobbies: e.target.value })} />
          <input placeholder="Achievements" className="w-full bg-black/20 border border-white/10 rounded p-2" value={data.achievements} onChange={e => setData({ ...data, achievements: e.target.value })} />
          <input placeholder="Publications" className="w-full bg-black/20 border border-white/10 rounded p-2" value={data.publications} onChange={e => setData({ ...data, publications: e.target.value })} />
        </div>

        <div className="space-y-4 border-t border-white/10 pt-4">
          <h3 className="text-blue-400 font-semibold">Custom Sections</h3>
          <div className="flex gap-2">
            <input placeholder="Section Title (e.g. Certifications)" className="flex-1 bg-black/20 border border-white/10 rounded p-2" value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} />
            <button onClick={addCustomSection} className="px-4 bg-green-600 rounded hover:bg-green-500">Add</button>
          </div>
          {data.customSections.map(s => (
            <div key={s.id} className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-gray-300">{s.title}</label>
                <button onClick={() => removeCustomSection(s.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>
              <textarea className="w-full bg-black/20 border border-white/10 rounded p-2 h-20" value={s.content} onChange={e => updateCustomSection(s.id, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center print:hidden">
          <h2 className="text-xl sm:text-2xl font-bold">Preview</h2>
          <button onClick={() => window.print()} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded font-bold shadow-lg">Download PDF (A4)</button>
        </div>
        <div className="overflow-x-auto w-full border border-white/20 rounded-lg">
          <div id="resume-preview" className="bg-white text-black shadow-2xl min-h-[1123px] w-full sm:w-[210mm] sm:min-w-[210mm] mx-auto origin-top-left sm:origin-top sm:scale-100">
            {template === 1 && <ModernTemplate data={data} />}
            {template === 2 && <ClassicTemplate data={data} />}
            {template === 3 && <MinimalTemplate data={data} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Templates ---

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  children ? <div className="mb-6 no-break"><h3 className="text-lg font-bold uppercase border-b-2 border-gray-300 mb-3 pb-1">{title}</h3>{children}</div> : null
);

function ModernTemplate({ data }: { data: ResumeData }) {
  const formatList = (str: string) => str.split(',').filter(s => s.trim()).join(' • ');

  return (
    <div className="flex flex-col sm:flex-row h-full min-h-[1123px]">
      <div className="w-full sm:w-1/3 bg-slate-800 text-white p-8">
        <div className="text-center mb-8">
          {data.profilePic && <img src={data.profilePic} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-slate-600 object-cover" />}
          <h1 className="text-2xl font-bold mb-2">{data.fullName}</h1>
          <p className="text-slate-300 text-sm">{data.email}</p>
          <p className="text-slate-300 text-sm">{data.phone}</p>
          <p className="text-slate-300 text-sm">{data.address}</p>
        </div>
        {data.skills && <div className="mb-6"><h4 className="font-bold border-b border-slate-600 mb-2">SKILLS</h4><p className="text-sm text-slate-300">{formatList(data.skills)}</p></div>}
        {data.languages && <div className="mb-6"><h4 className="font-bold border-b border-slate-600 mb-2">LANGUAGES</h4><p className="text-sm text-slate-300">{formatList(data.languages)}</p></div>}
        {data.hobbies && <div className="mb-6"><h4 className="font-bold border-b border-slate-600 mb-2">HOBBIES</h4><p className="text-sm text-slate-300">{formatList(data.hobbies)}</p></div>}
      </div>
      <div className="w-full sm:w-2/3 p-8">
        {data.summary && <Section title="Profile"><p className="text-sm leading-relaxed">{data.summary}</p></Section>}
        {data.experience.length > 0 && <Section title="Experience">{data.experience.map((e, i) => <div key={i} className="mb-3"><h4 className="font-bold">{e.role}</h4><p className="text-sm text-gray-600">{e.company} | {e.duration}</p></div>)}</Section>}
        {data.education.length > 0 && <Section title="Education">{data.education.map((e, i) => <div key={i} className="mb-3"><h4 className="font-bold">{e.degree}</h4><p className="text-sm text-gray-600">{e.institution} | {e.year}</p></div>)}</Section>}
        {data.achievements && <Section title="Achievements"><p className="text-sm">{data.achievements}</p></Section>}
        {data.publications && <Section title="Publications"><p className="text-sm">{data.publications}</p></Section>}
        {data.customSections.map(s => s.content && <Section key={s.id} title={s.title}><p className="text-sm whitespace-pre-wrap">{s.content}</p></Section>)}
      </div>
    </div>
  );
}

function ClassicTemplate({ data }: { data: ResumeData }) {
  const formatList = (str: string) => str.split(',').filter(s => s.trim()).join(' • ');

  return (
    <div className="p-10 h-full min-h-[1123px] font-serif text-gray-900">
      <div className="text-center border-b-2 border-black pb-6 mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-widest mb-2">{data.fullName}</h1>
        <p className="text-sm">{[data.email, data.phone, data.address].filter(Boolean).join(" • ")}</p>
      </div>
      {data.summary && <Section title="Professional Summary"><p className="text-sm text-justify">{data.summary}</p></Section>}
      {data.experience.length > 0 && <Section title="Experience">{data.experience.map((e, i) => <div key={i} className="mb-4 flex flex-col sm:flex-row justify-between"><div className="w-full sm:w-3/4"><h4 className="font-bold">{e.role}</h4><p className="italic">{e.company}</p></div><div className="w-full sm:w-1/4 text-left sm:text-right text-sm">{e.duration}</div></div>)}</Section>}
      {data.education.length > 0 && <Section title="Education">{data.education.map((e, i) => <div key={i} className="mb-4 flex flex-col sm:flex-row justify-between"><div className="w-full sm:w-3/4"><h4 className="font-bold">{e.degree}</h4><p className="italic">{e.institution}</p></div><div className="w-full sm:w-1/4 text-left sm:text-right text-sm">{e.year}</div></div>)}</Section>}
      {data.skills && <Section title="Skills"><p className="text-sm">{formatList(data.skills)}</p></Section>}
      {(data.achievements || data.publications) && <Section title="Additional Info"><p className="text-sm">{[data.achievements, data.publications].filter(Boolean).join(" • ")}</p></Section>}
      {data.customSections.map(s => s.content && <Section key={s.id} title={s.title}><p className="text-sm whitespace-pre-wrap">{s.content}</p></Section>)}
    </div>
  );
}

function MinimalTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="p-10 h-full min-h-[1123px] font-sans text-slate-800">
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        {data.profilePic && <img src={data.profilePic} className="w-24 h-24 rounded-lg object-cover" />}
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-light text-blue-600">{data.fullName}</h1>
          <p className="text-gray-500 mt-1">{data.email} | {data.phone}</p>
          <p className="text-gray-500 text-sm">{data.address}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="col-span-1 sm:col-span-2">
          {data.summary && <div className="mb-6"><h3 className="text-blue-600 font-bold mb-2">ABOUT ME</h3><p className="text-sm text-gray-600">{data.summary}</p></div>}
          {data.experience.length > 0 && <div className="mb-6"><h3 className="text-blue-600 font-bold mb-2">EXPERIENCE</h3>{data.experience.map((e, i) => <div key={i} className="mb-4"><h4 className="font-bold">{e.role}</h4><p className="text-sm text-gray-500">{e.company} • {e.duration}</p></div>)}</div>}
          {data.education.length > 0 && <div className="mb-6"><h3 className="text-blue-600 font-bold mb-2">EDUCATION</h3>{data.education.map((e, i) => <div key={i} className="mb-4"><h4 className="font-bold">{e.degree}</h4><p className="text-sm text-gray-500">{e.institution} • {e.year}</p></div>)}</div>}
          {data.customSections.map(s => s.content && <div key={s.id} className="mb-6"><h3 className="text-blue-600 font-bold mb-2 uppercase">{s.title}</h3><p className="text-sm text-gray-600 whitespace-pre-wrap">{s.content}</p></div>)}
        </div>
        <div className="col-span-1 bg-slate-50 p-4 rounded-lg h-fit">
          {data.skills && <div className="mb-6"><h3 className="font-bold mb-2 text-sm">SKILLS</h3><div className="flex flex-wrap gap-2">{data.skills.split(',').map((s, i) => <span key={i} className="text-xs bg-white border px-2 py-1 rounded">{s.trim()}</span>)}</div></div>}
          {data.languages && <div className="mb-6"><h3 className="font-bold mb-2 text-sm">LANGUAGES</h3><p className="text-sm text-gray-600">{data.languages}</p></div>}
          {data.hobbies && <div className="mb-6"><h3 className="font-bold mb-2 text-sm">HOBBIES</h3><p className="text-sm text-gray-600">{data.hobbies}</p></div>}
          {data.achievements && <div className="mb-6"><h3 className="font-bold mb-2 text-sm">AWARDS</h3><p className="text-sm text-gray-600">{data.achievements}</p></div>}
          {data.publications && <div className="mb-6"><h3 className="font-bold mb-2 text-sm">PUBLICATIONS</h3><p className="text-sm text-gray-600">{data.publications}</p></div>}
        </div>
      </div>
    </div>
  );
}
