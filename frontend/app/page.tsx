"use client";

import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const OUTPUT_TYPES = [
  {
    id: "executive_summary",
    name: "Executive Summary",
    description: "Concise briefing for decision makers",
  },
  {
    id: "advisory",
    name: "Security Advisory",
    description: "Structured cybersecurity advisory",
  },
  {
    id: "linkedin",
    name: "LinkedIn Post",
    description: "Professional social media post",
  },
  {
    id: "x_thread",
    name: "X / Twitter Thread",
    description: "Platform-optimized thread",
  },
  {
    id: "infographic",
    name: "Infographic",
    description: "Visual content and key messaging",
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Slides with speaker notes",
  },
  {
    id: "video",
    name: "Video Package",
    description: "Script, storyboard and subtitles",
  },
];

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [filename, setFilename] = useState("");

  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([
    "executive_summary",
  ]);

  const [audience, setAudience] =
    useState("Cybersecurity professionals");

  const [tone, setTone] =
    useState("Professional");

  const [language, setLanguage] =
    useState("English");

  const [detailLevel, setDetailLevel] =
    useState("Detailed");

  const [results, setResults] = useState<any>(null);

  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");

  function toggleOutput(id: string) {
    setSelectedOutputs((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      return [...current, id];
    });
  }

  async function uploadFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setFilename(file.name);
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/v1/sources/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Upload failed"
        );
      }

      setSourceText(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function generateContent() {
    if (!sourceText.trim()) {
      setError("Please upload a PDF or enter source text.");
      return;
    }

    if (selectedOutputs.length === 0) {
      setError("Select at least one output format.");
      return;
    }

    setGenerating(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/transform`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_text: sourceText,
            outputs: selectedOutputs,
            audience,
            tone,
            language,
            detail_level: detailLevel,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Generation failed"
        );
      }

      setResults(data.outputs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              NEXUS
            </h1>

            <p className="text-sm text-slate-400">
              AI-Powered Cyber Intelligence Transformation
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            System Online
          </div>

        </div>
      </header>


      {/* MAIN */}

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-3">


        {/* LEFT */}

        <section className="space-y-6 lg:col-span-2">

          {/* SOURCE */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                1. Source Intelligence
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Upload a source document or provide intelligence text.
              </p>
            </div>


            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 px-6 py-10 text-center hover:border-slate-500">

              <div className="text-4xl">
                ↑
              </div>

              <div className="mt-3 font-medium">
                {uploading
                  ? "Processing PDF..."
                  : "Upload PDF"}
              </div>

              <div className="mt-1 text-sm text-slate-500">
                PDF documents supported
              </div>

              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={uploadFile}
              />

            </label>


            {filename && (
              <div className="mt-4 rounded-lg bg-slate-950 p-3 text-sm text-slate-300">
                📄 {filename}
              </div>
            )}


            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-xs text-slate-500">
                OR
              </span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>


            <textarea
              value={sourceText}
              onChange={(e) =>
                setSourceText(e.target.value)
              }
              placeholder="Paste intelligence, report, advisory, article or other source content here..."
              className="min-h-48 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none placeholder:text-slate-600 focus:border-slate-500"
            />

          </div>


          {/* OUTPUTS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                2. Select Deliverables
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Generate one or multiple communication artefacts.
              </p>
            </div>


            <div className="grid gap-3 sm:grid-cols-2">

              {OUTPUT_TYPES.map((output) => {

                const selected =
                  selectedOutputs.includes(output.id);

                return (
                  <button
                    key={output.id}
                    onClick={() =>
                      toggleOutput(output.id)
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-white bg-slate-800"
                        : "border-slate-700 bg-slate-950 hover:border-slate-500"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`mt-1 flex h-5 w-5 items-center justify-center rounded border ${
                          selected
                            ? "border-white bg-white text-black"
                            : "border-slate-600"
                        }`}
                      >
                        {selected && "✓"}
                      </div>

                      <div>

                        <div className="font-medium">
                          {output.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {output.description}
                        </div>

                      </div>

                    </div>

                  </button>
                );
              })}

            </div>

          </div>

        </section>


        {/* RIGHT */}

        <aside className="space-y-6">


          {/* PARAMETERS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              3. Generation Parameters
            </h2>


            <div className="mt-6 space-y-5">

              <div>
                <label className="text-sm text-slate-400">
                  Target Audience
                </label>

                <select
                  value={audience}
                  onChange={(e) =>
                    setAudience(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"
                >
                  <option>General</option>
                  <option>Cybersecurity professionals</option>
                  <option>Government officials</option>
                  <option>Executive leadership</option>
                  <option>Technical teams</option>
                </select>
              </div>


              <div>
                <label className="text-sm text-slate-400">
                  Tone
                </label>

                <select
                  value={tone}
                  onChange={(e) =>
                    setTone(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"
                >
                  <option>Professional</option>
                  <option>Technical</option>
                  <option>Formal</option>
                  <option>Concise</option>
                  <option>Public-friendly</option>
                </select>
              </div>


              <div>
                <label className="text-sm text-slate-400">
                  Language
                </label>

                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"
                >
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>


              <div>
                <label className="text-sm text-slate-400">
                  Detail Level
                </label>

                <select
                  value={detailLevel}
                  onChange={(e) =>
                    setDetailLevel(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"
                >
                  <option>Brief</option>
                  <option>Moderate</option>
                  <option>Detailed</option>
                </select>
              </div>

            </div>


            <button
              onClick={generateContent}
              disabled={generating}
              className="mt-7 w-full rounded-xl bg-white px-4 py-4 font-semibold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating
                ? "Generating..."
                : "Generate Deliverables →"}
            </button>


            {error && (
              <div className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

          </div>


          {/* STATUS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h3 className="font-semibold">
              Transformation Pipeline
            </h3>

            <div className="mt-4 space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Source
                </span>

                <span className="text-green-400">
                  {sourceText ? "Ready" : "Waiting"}
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-slate-400">
                  Outputs
                </span>

                <span>
                  {selectedOutputs.length}
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-slate-400">
                  Engine
                </span>

                <span className="text-green-400">
                  Gemini
                </span>
              </div>

            </div>

          </div>

        </aside>

      </div>


      {/* RESULTS */}

      {results && (
        <section className="mx-auto max-w-7xl px-6 pb-12">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-2xl font-semibold">
              Generated Deliverables
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Generated from the submitted source intelligence.
            </p>


            <div className="mt-6 space-y-6">

              {Object.entries(results).map(
                ([key, value]) => {

                  if (!value) return null;

                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                    >

                      <h3 className="text-lg font-semibold capitalize">
                        {key.replaceAll("_", " ")}
                      </h3>

                      <pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                        {typeof value === "string"
                          ? value
                          : JSON.stringify(
                              value,
                              null,
                              2
                            )}
                      </pre>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </section>
      )}

    </main>
  );
}