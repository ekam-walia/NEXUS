import os
import json

from dotenv import load_dotenv
from google import genai


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not configured.")

client = genai.Client(api_key=api_key)


# ============================================================
# INTELLIGENCE EXTRACTION
# ============================================================

def extract_intelligence(text: str) -> dict:

    prompt = f"""
You are a cybersecurity intelligence analyst.

Analyze the following source document and extract
structured cybersecurity intelligence.

SOURCE DOCUMENT:

{text}

Return ONLY valid JSON using this exact structure:

{{
  "title": "",
  "summary": "",
  "severity": "",
  "threat_actors": [],
  "malware": [],
  "vulnerabilities": [],
  "iocs": [],
  "ttps": [],
  "affected_systems": [],
  "attack_vectors": [],
  "recommendations": [],
  "facts": []
}}

Rules:

1. Do not invent information.
2. If information is not present, use an empty array or empty string.
3. Preserve CVE identifiers exactly.
4. Preserve IP addresses, domains and hashes exactly.
5. Severity must be one of:
   LOW, MEDIUM, HIGH, CRITICAL, UNKNOWN.
6. Facts must contain only information supported by the source.
"""

    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt,
    )

    raw_text = interaction.output_text.strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.replace("```json", "")
        raw_text = raw_text.replace("```", "")
        raw_text = raw_text.strip()

    try:
        return json.loads(raw_text)

    except json.JSONDecodeError as e:
        raise RuntimeError(
            f"Gemini returned invalid JSON: {raw_text}"
        ) from e


# ============================================================
# CONTENT TRANSFORMATION
# ============================================================

def transform_content(
    source_text: str,
    outputs: list[str],
    audience: str = "General",
    tone: str = "Professional",
    language: str = "English",
    detail_level: str = "Detailed",
) -> dict:

    output_instructions = {

        "executive_summary": """
Create a concise executive briefing containing:
- title
- executive summary
- key findings
- impact
- recommended actions
""",

        "advisory": """
Create a structured cybersecurity advisory containing:
- title
- severity
- summary
- affected systems
- technical details
- indicators
- mitigation
- recommended actions
""",

        "linkedin": """
Create a professional LinkedIn post suitable for publication.
Include an engaging opening, important findings, implications,
and relevant hashtags.
""",

        "x_thread": """
Create a concise X/Twitter thread.
Break the information into a logical sequence of short posts.
Do not exceed reasonable platform post lengths.
""",

        "infographic": """
Create content for an infographic containing:
- title
- key message
- important facts
- threat indicators
- key takeaways
- recommended actions
- suggested visual layout
""",

        "presentation": """
Create a presentation outline with 6-8 slides.

For every slide provide:
- slide title
- bullet points
- speaker notes
""",

        "video": """
Create a complete video package containing:
- video title
- recommended duration
- narration script
- scene-by-scene storyboard
- visual recommendations
- subtitles
""",
    }

    selected_instructions = []

    for output in outputs:

        if output in output_instructions:

            selected_instructions.append(
                f"{output.upper()}:\n"
                f"{output_instructions[output]}"
            )

    if not selected_instructions:

        raise ValueError(
            "No valid output formats selected."
        )

    prompt = f"""
You are NEXUS, an AI-powered cybersecurity
content transformation engine.

Transform the provided source information into
professional communication artefacts.

IMPORTANT:

The source may contain sensitive cybersecurity information.

Do not invent facts, statistics, threat actors,
vulnerabilities, IOCs, dates, organizations,
or technical details.

Everything generated must be grounded in
the SOURCE DOCUMENT.

SOURCE DOCUMENT:

{source_text}


GENERATION PARAMETERS:

Target Audience: {audience}

Tone: {tone}

Language: {language}

Detail Level: {detail_level}


REQUESTED OUTPUTS:

{chr(10).join(selected_instructions)}


Return ONLY valid JSON.

Use this exact structure:

{{
  "executive_summary": null,
  "advisory": null,
  "linkedin": null,
  "x_thread": null,
  "infographic": null,
  "presentation": null,
  "video": null
}}

For outputs that were NOT requested,
return null.

For requested outputs, return the generated
content as structured JSON objects or arrays
where appropriate.

Do not include markdown code fences.
"""

    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt,
    )

    raw_text = interaction.output_text.strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.replace("```json", "")
        raw_text = raw_text.replace("```", "")
        raw_text = raw_text.strip()

    try:

        return json.loads(raw_text)

    except json.JSONDecodeError as e:

        raise RuntimeError(
            f"Gemini returned invalid transformation JSON: {raw_text}"
        ) from e