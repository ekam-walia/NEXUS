                    ┌─────────────────┐
                    │   NEXUS WEB UI  │
                    │     Next.js     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     FastAPI     │
                    │   API Gateway   │
                    └────────┬────────┘
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
       ┌──────────┐   ┌─────────────┐   ┌───────────┐
       │ Ingestion│   │ Intelligence│   │Transform  │
       │  Engine  │   │    Engine   │   │  Engine   │
       └────┬─────┘   └──────┬──────┘   └─────┬─────┘
            │                │                │
            ▼                ▼                ▼
       PDF/Text         Gemini AI       7 Outputs
                                             │
                   ┌─────────────────────────┼──────────────┐
                   ▼            ▼             ▼             ▼
                Summary      Advisory       Social       Video
                                              │
                                      ┌───────┴───────┐
                                      ▼               ▼
                                    X/LinkedIn    Presentation