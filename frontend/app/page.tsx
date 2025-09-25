// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
//               app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }



// "use client";

// import { useState } from "react";

// export default function Home() {
//   const [profile, setProfile] = useState({ age: "", education: "", interests: "" });
//   const [roadmap, setRoadmap] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     setLoading(true);
//     setRoadmap("");

//     try {
//       const res = await fetch("/api/roadmap", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ profile }),
//       });

//       const data = await res.json();
//       setRoadmap(data.roadmap || "No roadmap generated");
//     } catch (err) {
//       console.error("Error calling backend:", err);
//       setRoadmap("Error generating roadmap");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="p-8 max-w-lg mx-auto">
//       <h1 className="text-2xl font-bold mb-4">AI Career Mentor</h1>

//       <input
//         placeholder="Age"
//         className="border p-2 mb-2 w-full"
//         onChange={(e) => setProfile({ ...profile, age: e.target.value })}
//       />
//       <input
//         placeholder="Education"
//         className="border p-2 mb-2 w-full"
//         onChange={(e) => setProfile({ ...profile, education: e.target.value })}
//       />
//       <input
//         placeholder="Interests"
//         className="border p-2 mb-2 w-full"
//         onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
//       />

//       <button
//         onClick={handleSubmit}
//         className="px-4 py-2 bg-blue-600 text-white rounded"
//         disabled={loading}
//       >
//         {loading ? "Generating..." : "Get Roadmap"}
//       </button>

//       {roadmap && <pre className="mt-4 p-2 bg-gray-100">{roadmap}</pre>}
//     </main>
//   );
// }





"use client";

import { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Home() {
  const [profile, setProfile] = useState({
    age: "",
    education: "",
    interests: "",
  });
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const handleSubmit = async () => {
    setLoading(true);
    setRoadmap("");
    setNodes([]);
    setEdges([]);

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      const data = await res.json();
      const text: string = data.roadmap || "No roadmap generated";
      setRoadmap(text);

      // Break text into lines
      const lines = text.split("\n").filter((l) => l.trim() !== "");

      const flowNodes: Node[] = lines.map((line, index) => ({
        id: String(index + 1),
        data: { label: line },
        position: { x: 100, y: index * 120 },
        style: {
          border: "1px solid #333",
          padding: 10,
          borderRadius: 12,
          background: "#f9fafb",
        },
      }));
      setNodes(flowNodes);

      const flowEdges: Edge[] = lines.slice(1).map((_, i) => ({
        id: `e${i + 1}-${i + 2}`,
        source: String(i + 1),
        target: String(i + 2),
      }));
      setEdges(flowEdges);
    } catch (err) {
      console.error("Error calling backend:", err);
      setRoadmap("Error generating roadmap");
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge(params, eds)),
    []
  );

  const downloadPDF = async () => {
    const flow = document.getElementById("roadmap-flow");
    if (!flow) return;
    const canvas = await html2canvas(flow);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("career-roadmap.pdf");
  };

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Career Mentor</h1>

      <input
        placeholder="Age"
        className="border p-2 mb-2 w-full"
        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
      />
      <input
        placeholder="Education"
        className="border p-2 mb-2 w-full"
        onChange={(e) => setProfile({ ...profile, education: e.target.value })}
      />
      <input
        placeholder="Interests"
        className="border p-2 mb-2 w-full"
        onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
      />

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "Generating..." : "Get Roadmap"}
      </button>

      {roadmap && (
        <div className="mt-6">
          <div
            id="roadmap-flow"
            className="h-[600px] border rounded-xl shadow-lg"
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onConnect={onConnect}
              fitView
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
          <button
            onClick={downloadPDF}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            Download as PDF
          </button>
        </div>
      )}
    </main>
  );
}
