"use client";

import { ChangeEvent, ReactNode, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type OutputType =
  | "executive_summary"
  | "advisory"
  | "linkedin"
  | "x_thread"
  | "infographic"
  | "presentation"
  | "video";

type OutputOption = {
  id: OutputType;
  name: string;
  description: string;
  icon: string;
};

const OUTPUT_TYPES: OutputOption[] = [
  {
    id: "executive_summary",
    name: "Executive Summary",
    description: "Concise briefing for decision makers",
    icon: "📋",
  },
  {
    id: "advisory",
    name: "Security Advisory",
    description: "Structured cybersecurity advisory",
    icon: "🚨",
  },
  {
    id: "linkedin",
    name: "LinkedIn Post",
    description: "Professional social media post",
    icon: "💼",
  },
  {
    id: "x_thread",
    name: "X / Twitter Thread",
    description: "Platform-optimized thread",
    icon: "𝕏",
  },
  {
    id: "infographic",
    name: "Infographic",
    description: "Visual content and key messaging",
    icon: "📊",
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Slides with speaker notes",
    icon: "🖥️",
  },
  {
    id: "video",
    name: "Video Package",
    description: "Script, storyboard and subtitles",
    icon: "🎬",
  },
];

function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function convertToPlainText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        const rendered = convertToPlainText(item);

        if (
          item !== null &&
          typeof item === "object" &&
          !Array.isArray(item)
        ) {
          return rendered;
        }

        return `${index + 1}. ${rendered}`;
      })
      .join("\n\n");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, child]) => {
        const rendered = convertToPlainText(child);

        if (!rendered) {
          return "";
        }

        return `${titleCase(key)}\n${rendered}`;
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return "";
}

function triggerBrowserDownload(
  blob: Blob,
  filename: string
) {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

async function downloadFromExportAPI(
  outputType: string,
  content: unknown
) {
  const response = await fetch(
    `${API_URL}/api/v1/export`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        output_type: outputType,
        content,
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to export deliverable."
    );
  }

  const blob = await response.blob();

  const extension =
    outputType === "presentation"
      ? "pptx"
      : "pdf";

  triggerBrowserDownload(
    blob,
    `nexus-${outputType}.${extension}`
  );
}

function CopyButton({
  text,
}: {
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

/* ============================================================
   OUTPUT COMPONENTS
============================================================ */

function ExecutiveSummaryCard({
  data,
}: {
  data: any;
}) {
  return (
    <div className="space-y-6">
      {data?.title && (
        <div>
          <h4 className="text-2xl font-bold text-gray-900">
            {data.title}
          </h4>
        </div>
      )}

      {data?.executive_summary && (
        <section>
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
            Executive Summary
          </h4>

          <p className="leading-7 text-gray-700">
            {data.executive_summary}
          </p>
        </section>
      )}

      {Array.isArray(data?.key_findings) &&
        data.key_findings.length > 0 && (
          <section>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
              Key Findings
            </h4>

            <div className="space-y-2">
              {data.key_findings.map(
                (item: string, index: number) => (
                  <div
                    key={index}
                    className="rounded-xl bg-gray-50 p-4 text-gray-700"
                  >
                    <span className="mr-2 font-bold">
                      {index + 1}.
                    </span>
                    {item}
                  </div>
                )
              )}
            </div>
          </section>
        )}

      {data?.impact && (
        <section>
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
            Impact
          </h4>

          <p className="leading-7 text-gray-700">
            {data.impact}
          </p>
        </section>
      )}

      {Array.isArray(data?.recommended_actions) &&
        data.recommended_actions.length > 0 && (
          <section>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
              Recommended Actions
            </h4>

            <div className="space-y-2">
              {data.recommended_actions.map(
                (item: string, index: number) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-900"
                  >
                    <span className="font-bold">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </section>
        )}
    </div>
  );
}

function AdvisoryCard({
  data,
}: {
  data: any;
}) {
  return (
    <div className="space-y-6">
      {data?.title && (
        <h4 className="text-2xl font-bold text-gray-900">
          {data.title}
        </h4>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-bold uppercase text-gray-500">
          Severity
        </span>

        <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
          {data?.severity || "UNKNOWN"}
        </span>
      </div>

      {data?.summary && (
        <section>
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
            Summary
          </h4>

          <p className="leading-7 text-gray-700">
            {data.summary}
          </p>
        </section>
      )}

      {Array.isArray(data?.affected_systems) &&
        data.affected_systems.length > 0 && (
          <section>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
              Affected Systems
            </h4>

            <ListItems
              items={data.affected_systems}
            />
          </section>
        )}

      {data?.technical_details && (
        <section>
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
            Technical Details
          </h4>

          <p className="leading-7 text-gray-700">
            {data.technical_details}
          </p>
        </section>
      )}

      {Array.isArray(data?.indicators) &&
        data.indicators.length > 0 && (
          <section>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
              Indicators
            </h4>

            <ListItems items={data.indicators} />
          </section>
        )}

      {data?.mitigation && (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-800">
            Mitigation
          </h4>

          <p className="leading-7 text-blue-900">
            {data.mitigation}
          </p>
        </section>
      )}

      {Array.isArray(data?.recommended_actions) &&
        data.recommended_actions.length > 0 && (
          <section>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
              Recommended Actions
            </h4>

            <ListItems
              items={data.recommended_actions}
              checkmarks
            />
          </section>
        )}
    </div>
  );
}

function LinkedInCard({
  data,
}: {
  data: any;
}) {
  const post =
    typeof data === "string"
      ? data
      : data?.post_content || "";

  return (
    <div>
      <div className="rounded-2xl border border-blue-100 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            in
          </div>

          <div>
            <p className="font-bold text-gray-900">
              NEXUS
            </p>

            <p className="text-xs text-gray-500">
              Cyber Intelligence
            </p>
          </div>
        </div>

        <p className="whitespace-pre-wrap leading-8 text-gray-800">
          {post}
        </p>
      </div>
    </div>
  );
}

function XThreadCard({
  data,
}: {
  data: any;
}) {
  const posts: string[] = Array.isArray(data)
    ? data
    : [];

  return (
    <div className="space-y-3">
      {posts.map((post, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Post {index + 1} / {posts.length}
            </span>

            <span className="text-sm text-gray-400">
              𝕏
            </span>
          </div>

          <p className="whitespace-pre-wrap leading-7 text-gray-800">
            {post}
          </p>
        </div>
      ))}
    </div>
  );
}

function InfographicCard({
  data,
}: {
  data: any;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {data?.title && (
        <div className="bg-gray-950 px-6 py-7 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Threat Intelligence
          </p>

          <h4 className="mt-2 text-2xl font-black">
            {data.title}
          </h4>
        </div>
      )}

      <div className="p-6">
        {data?.key_message && (
          <div className="rounded-xl bg-red-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">
              Key Message
            </p>

            <p className="mt-2 text-lg font-semibold leading-7 text-red-900">
              {data.key_message}
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {Array.isArray(data?.important_facts) && (
            <div>
              <h4 className="mb-3 font-bold">
                Important Facts
              </h4>

              <ListItems
                items={data.important_facts}
              />
            </div>
          )}

          {Array.isArray(data?.threat_indicators) && (
            <div>
              <h4 className="mb-3 font-bold">
                Threat Indicators
              </h4>

              <ListItems
                items={data.threat_indicators}
              />
            </div>
          )}
        </div>

        {Array.isArray(data?.key_takeaways) &&
          data.key_takeaways.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 font-bold">
                Key Takeaways
              </h4>

              <ListItems
                items={data.key_takeaways}
              />
            </div>
          )}

        {Array.isArray(data?.recommended_actions) &&
          data.recommended_actions.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 font-bold">
                Recommended Actions
              </h4>

              <ListItems
                items={data.recommended_actions}
                checkmarks
              />
            </div>
          )}

        {data?.suggested_visual_layout && (
          <div className="mt-6 rounded-xl bg-gray-50 p-5">
            <h4 className="font-bold">
              Suggested Visual Layout
            </h4>

            <p className="mt-2 leading-7 text-gray-600">
              {data.suggested_visual_layout}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PresentationCard({
  data,
}: {
  data: any;
}) {
  const slides = Array.isArray(data)
    ? data
    : [];

  return (
    <div className="space-y-6">
      {slides.map((slide, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <div className="bg-gray-950 px-6 py-5 text-white">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
              Slide {index + 1}
            </div>

            <h4 className="text-2xl font-bold">
              {slide?.slide_title ||
                `Slide ${index + 1}`}
            </h4>
          </div>

          <div className="p-6">
            {Array.isArray(
              slide?.bullet_points
            ) && (
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Key Points
                </p>

                <ul className="space-y-3">
                  {slide.bullet_points.map(
                    (
                      point: string,
                      pointIndex: number
                    ) => (
                      <li
                        key={pointIndex}
                        className="flex gap-3 text-gray-700"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gray-900" />

                        <span className="leading-7">
                          {point}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {slide?.speaker_notes && (
              <div className="mt-6 rounded-xl bg-gray-50 p-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Speaker Notes
                </p>

                <p className="whitespace-pre-wrap leading-7 text-gray-600">
                  {slide.speaker_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function VideoCard({
  data,
}: {
  data: any;
}) {
  return (
    <div className="space-y-6">
      {data?.video_title && (
        <div>
          <h4 className="text-2xl font-black text-gray-900">
            {data.video_title}
          </h4>

          {data?.recommended_duration && (
            <p className="mt-2 text-sm text-gray-500">
              Recommended duration:{" "}
              {data.recommended_duration}
            </p>
          )}
        </div>
      )}

      {data?.narration_script && (
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
            Narration Script
          </h4>

          <div className="rounded-xl bg-gray-50 p-6">
            <p className="whitespace-pre-wrap leading-8 text-gray-700">
              {data.narration_script}
            </p>
          </div>
        </div>
      )}

      {Array.isArray(
        data?.scene_by_scene_storyboard
      ) && (
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
            Storyboard
          </h4>

          <div className="space-y-3">
            {data.scene_by_scene_storyboard.map(
              (scene: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="text-xs font-bold uppercase text-gray-400">
                    Scene{" "}
                    {scene?.scene_number ??
                      index + 1}
                  </div>

                  {scene?.visual && (
                    <p className="mt-2 leading-7 text-gray-700">
                      <strong>Visual:</strong>{" "}
                      {scene.visual}
                    </p>
                  )}

                  {scene?.audio_narration && (
                    <p className="mt-2 leading-7 text-gray-500">
                      <strong>Narration:</strong>{" "}
                      {scene.audio_narration}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {Array.isArray(data?.subtitles) && (
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
            Subtitles
          </h4>

          <ListItems items={data.subtitles} />
        </div>
      )}
    </div>
  );
}

function GenericOutputCard({
  data,
}: {
  data: any;
}) {
  return (
    <StructuredContent value={data} />
  );
}

function StructuredContent({
  value,
}: {
  value: unknown;
}) {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return (
      <p className="whitespace-pre-wrap leading-7 text-gray-700">
        {String(value)}
      </p>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-xl bg-gray-50 p-4"
          >
            <StructuredContent value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return (
      <div className="space-y-6">
        {Object.entries(
          value as Record<string, unknown>
        ).map(([key, child]) => (
          <div key={key}>
            <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
              {titleCase(key)}
            </h4>

            <StructuredContent value={child} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}

/* ============================================================
   SHARED UI
============================================================ */

function ListItems({
  items,
  checkmarks = false,
}: {
  items: unknown[];
  checkmarks?: boolean;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className={`flex gap-3 rounded-xl p-3 ${
            checkmarks
              ? "border border-green-200 bg-green-50"
              : "bg-gray-50"
          }`}
        >
          <span
            className={
              checkmarks
                ? "font-bold text-green-700"
                : "text-gray-400"
            }
          >
            {checkmarks ? "✓" : "•"}
          </span>

          <span className="leading-6 text-gray-700">
            {typeof item === "string"
              ? item
              : JSON.stringify(item)}
          </span>
        </div>
      ))}
    </div>
  );
}

function OutputRenderer({
  type,
  data,
  onDownload,
}: {
  type: string;
  data: any;
  onDownload: (
    type: string,
    content: unknown
  ) => void;
}) {
  let rendered: ReactNode;

  switch (type) {
    case "executive_summary":
      rendered = (
        <ExecutiveSummaryCard data={data} />
      );
      break;

    case "advisory":
      rendered = <AdvisoryCard data={data} />;
      break;

    case "linkedin":
      rendered = <LinkedInCard data={data} />;
      break;

    case "x_thread":
      rendered = <XThreadCard data={data} />;
      break;

    case "infographic":
      rendered = (
        <InfographicCard data={data} />
      );
      break;

    case "presentation":
      rendered = (
        <PresentationCard data={data} />
      );
      break;

    case "video":
      rendered = <VideoCard data={data} />;
      break;

    default:
      rendered = (
        <GenericOutputCard data={data} />
      );
  }

  const plainText = convertToPlainText(data);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* TOOLBAR */}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4">

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Generated Deliverable
          </p>

          <h3 className="mt-1 text-lg font-bold text-gray-900">
            {titleCase(type)}
          </h3>
        </div>

        <div className="flex gap-2">

          <CopyButton text={plainText} />

          <button
            type="button"
            onClick={() =>
              onDownload(type, data)
            }
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            ↓ Download{" "}
            {type === "presentation"
              ? "PPTX"
              : "PDF"}
          </button>

        </div>
      </div>

      {/* CONTENT */}

      <div className="p-6">
        {rendered}
      </div>

    </article>
  );
}

/* ============================================================
   MAIN APPLICATION
============================================================ */

export default function Home() {
  const [sourceText, setSourceText] =
    useState("");

  const [filename, setFilename] =
    useState("");

  const [selectedOutputs, setSelectedOutputs] =
    useState<OutputType[]>([
      "executive_summary",
      "advisory",
    ]);

  const [audience, setAudience] =
    useState("Cybersecurity professionals");

  const [tone, setTone] =
    useState("Professional");

  const [language, setLanguage] =
    useState("English");

  const [detailLevel, setDetailLevel] =
    useState("Detailed");

  const [results, setResults] =
    useState<Record<string, any> | null>(
      null
    );

  const [uploading, setUploading] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  function toggleOutput(
    output: OutputType
  ) {
    setSelectedOutputs((current) => {
      if (current.includes(output)) {
        return current.filter(
          (item) => item !== output
        );
      }

      return [...current, output];
    });
  }

  async function uploadFile(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }

    setFilename(file.name);
    setUploading(true);
    setError("");
    setResults(null);

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
          data.detail || "Upload failed."
        );
      }

      setSourceText(data.text || "");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function generateContent() {
    if (!sourceText.trim()) {
      setError(
        "Please upload a PDF or enter source text."
      );
      return;
    }

    if (selectedOutputs.length === 0) {
      setError(
        "Please select at least one deliverable."
      );
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
          data.detail || "Generation failed."
        );
      }

      setResults(data.outputs || {});
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Generation failed."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function downloadDeliverable(
    type: string,
    content: unknown
  ) {
    try {
      setError("");

      await downloadFromExportAPI(
        type,
        content
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Export failed."
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">

      {/* HEADER */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 font-black text-white">
              N
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">
                NEXUS
              </h1>

              <p className="text-xs text-gray-500">
                AI-Powered Cyber Intelligence Transformation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            System Online
          </div>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SOURCE */}

        <section className="rounded-2xl border bg-white p-6 shadow-sm">

          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Step 01
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Source Intelligence
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Upload a source document or paste
            your own intelligence.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            {/* PDF */}

            <div className="rounded-xl border-2 border-dashed border-gray-300 p-8">

              <label
                htmlFor="pdf-upload"
                className="flex cursor-pointer flex-col items-center justify-center text-center"
              >
                <div className="text-4xl">
                  📄
                </div>

                <p className="mt-3 font-bold">
                  {uploading
                    ? "Processing PDF..."
                    : "Upload PDF"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  PDF documents supported
                </p>
              </label>

              <input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={uploadFile}
                disabled={uploading}
              />

              {filename && (
                <div className="mt-5 rounded-lg bg-gray-50 p-3 text-sm">
                  📄 {filename}
                </div>
              )}

            </div>

            {/* TEXT */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-bold">
                  Enter Source Text
                </label>

                <span className="text-xs text-gray-400">
                  {sourceText.length.toLocaleString()} chars
                </span>
              </div>

              <textarea
                value={sourceText}
                onChange={(event) => {
                  setSourceText(
                    event.target.value
                  );

                  setFilename("");
                  setResults(null);
                  setError("");
                }}
                placeholder="Paste a threat intelligence report, advisory, article, incident report, research paper or other source content here..."
                className="h-52 w-full resize-none rounded-xl border border-gray-300 p-4 text-sm leading-6 outline-none focus:border-gray-900"
              />
            </div>

          </div>

        </section>

        {/* OUTPUT TYPES */}

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Step 02
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Select Deliverables
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose one or multiple communication
            artefacts.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {OUTPUT_TYPES.map((output) => {

              const selected =
                selectedOutputs.includes(
                  output.id
                );

              return (
                <button
                  key={output.id}
                  type="button"
                  onClick={() =>
                    toggleOutput(output.id)
                  }
                  className={`rounded-xl border p-5 text-left transition ${
                    selected
                      ? "border-gray-950 bg-gray-950 text-white"
                      : "border-gray-200 bg-white hover:border-gray-400"
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex gap-3">

                      <span className="text-2xl">
                        {output.icon}
                      </span>

                      <div>

                        <h3 className="font-bold">
                          {output.name}
                        </h3>

                        <p
                          className={`mt-1 text-sm ${
                            selected
                              ? "text-gray-300"
                              : "text-gray-500"
                          }`}
                        >
                          {output.description}
                        </p>

                      </div>

                    </div>

                    {selected && (
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-black">
                        ✓
                      </span>
                    )}

                  </div>

                </button>
              );
            })}

          </div>

        </section>

        {/* PARAMETERS */}

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Step 03
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Generation Parameters
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <Parameter
              label="Target Audience"
              value={audience}
              onChange={setAudience}
              options={[
                "General",
                "Cybersecurity professionals",
                "Government officials",
                "Executive leadership",
                "Technical teams",
              ]}
            />

            <Parameter
              label="Tone"
              value={tone}
              onChange={setTone}
              options={[
                "Professional",
                "Technical",
                "Formal",
                "Concise",
                "Public-friendly",
              ]}
            />

            <Parameter
              label="Language"
              value={language}
              onChange={setLanguage}
              options={[
                "English",
                "Hindi",
              ]}
            />

            <Parameter
              label="Detail Level"
              value={detailLevel}
              onChange={setDetailLevel}
              options={[
                "Brief",
                "Moderate",
                "Detailed",
              ]}
            />

          </div>

          <button
            type="button"
            onClick={generateContent}
            disabled={generating}
            className="mt-8 w-full rounded-xl bg-gray-950 px-6 py-4 text-lg font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating
              ? "Generating Deliverables..."
              : `Generate ${selectedOutputs.length} Deliverable${
                  selectedOutputs.length === 1
                    ? ""
                    : "s"
                } →`}
          </button>

        </section>

        {/* PIPELINE */}

        <section className="mt-8 grid gap-4 md:grid-cols-3">

          <StatusCard
            title="Source"
            value={
              sourceText
                ? "Ready"
                : "Waiting"
            }
          />

          <StatusCard
            title="Selected Outputs"
            value={String(
              selectedOutputs.length
            )}
          />

          <StatusCard
            title="AI Engine"
            value="Gemini"
          />

        </section>

        {/* RESULTS */}

        {results && (
          <section className="mt-10 pb-20">

            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Step 04
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Generated Deliverables
              </h2>

              <p className="mt-1 text-gray-500">
                Your source has been transformed into
                publication-ready communication artefacts.
              </p>
            </div>

            <div className="space-y-8">

              {Object.entries(results).map(
                ([type, content]) => {

                  if (
                    content === null ||
                    content === undefined
                  ) {
                    return null;
                  }

                  return (
                    <OutputRenderer
                      key={type}
                      type={type}
                      data={content}
                      onDownload={
                        downloadDeliverable
                      }
                    />
                  );
                }
              )}

            </div>

          </section>
        )}

      </div>

    </main>
  );
}

function Parameter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}