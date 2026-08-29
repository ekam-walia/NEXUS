from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.services.llm import (
    extract_intelligence,
    transform_content,
)
from typing import Any
from fastapi.responses import StreamingResponse
from app.export.service import (
    build_pdf,
    build_presentation,
)

import os
import tempfile

from app.ingestion.pdf import extract_text_from_pdf


app = FastAPI(
    title="NEXUS",
    description="AI-powered cybersecurity content transformation platform",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "NEXUS",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/api/v1/sources/upload")
async def upload_source(file: UploadFile = File(...)):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are currently supported."
        )

    file_contents = await file.read()

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    ) as temp_file:

        temp_file.write(file_contents)
        temp_path = temp_file.name

    try:
        extracted_text = extract_text_from_pdf(temp_path)

    finally:
        os.remove(temp_path)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "text_length": len(extracted_text),
        "text": extracted_text,
    }

class IntelligenceRequest(BaseModel):
    text: str

class ExportRequest(BaseModel):
    output_type: str
    content: Any

@app.post("/api/v1/intelligence/analyze")
async def analyze_intelligence(
    request: IntelligenceRequest
):

    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty."
        )

    intelligence = extract_intelligence(
        request.text
    )

    return {
        "intelligence": intelligence
    }

class TransformRequest(BaseModel):
    source_text: str

    outputs: list[str]

    audience: str = "General"

    tone: str = "Professional"

    language: str = "English"

    detail_level: str = "Detailed"


@app.post("/api/v1/transform")
async def transform_intelligence(
    request: TransformRequest
):

    if not request.source_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Source text cannot be empty."
        )

    if not request.outputs:
        raise HTTPException(
            status_code=400,
            detail="At least one output format must be selected."
        )

    try:

        result = transform_content(
            source_text=request.source_text,
            outputs=request.outputs,
            audience=request.audience,
            tone=request.tone,
            language=request.language,
            detail_level=request.detail_level,
        )

        return {
            "outputs": result
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Transformation failed: {str(e)}"
        )

@app.post("/api/v1/export")
async def export_deliverable(
    request: ExportRequest
):
    output_type = request.output_type.lower()

    valid_types = {
        "executive_summary",
        "advisory",
        "linkedin",
        "x_thread",
        "infographic",
        "presentation",
        "video",
    }

    if output_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported output type."
        )

    if request.content is None:
        raise HTTPException(
            status_code=400,
            detail="Content cannot be empty."
        )

    if output_type == "presentation":

        if not isinstance(
            request.content,
            list
        ):
            raise HTTPException(
                status_code=400,
                detail="Presentation content must be a list of slides."
            )

        buffer = build_presentation(
            request.content
        )

        filename = "nexus-presentation.pptx"

        return StreamingResponse(
            buffer,
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "presentationml.presentation"
            ),
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{filename}"'
                )
            },
        )

    buffer = build_pdf(
        output_type,
        request.content,
    )

    filename = (
        f"nexus-{output_type}.pdf"
    )

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )