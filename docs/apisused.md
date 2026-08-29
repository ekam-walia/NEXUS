GET  /                       → NEXUS status
GET  /health                 → Backend health check

POST /api/v1/sources/upload  → PDF → extracted text

POST /api/v1/intelligence/analyze
                             → Source → cyber intelligence

POST /api/v1/transform       → Source + parameters
                               → multiple deliverables