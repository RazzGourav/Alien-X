# Minor 2 Final Project: Personalized Financial Advisor

An AI-powered platform delivering highly personalized financial advice via Retrieval-Augmented Generation (RAG).  
It combines a Next.js client, a Python FastAPI server, Pinecone vector search, a Neo4j knowledge graph, and large language models (Google Gemini or alternatives) to give users tailored, factual financial guidance based on their profile and uploaded documents.

---

## Table of Contents

1. [Features](#features)  
2. [Architecture & Folder Structure](#architecture--folder-structure)  
3. [Prerequisites](#prerequisites)  
4. [Installation](#installation)  
5. [Environment Variables](#environment-variables)  
6. [Server Usage](#server-usage)  
7. [Client Usage](#client-usage)  
8. [Evaluation Suite](#evaluation-suite)  
9. [Contributing](#contributing)  
10. [License](#license)

---

## Features

### Core Capabilities
- **Hybrid Retrieval**  
  – Vector similarity search (Pinecone) over chunked financial documents  
  – Structured fact lookup via Neo4j knowledge graph  
- **Personalized Responses**  
  – User profiles: risk tolerance, goals, horizon, preferences  
  – LLM prompting for tailored advice  
- **Document Ingestion**  
  – Supports PDF, CSV, JSON  
  – Automated chunking, embedding, upsert to Pinecone  
- **Knowledge Graph Visualization**  
  – Renders relationships in financial data using NetworkX & Matplotlib  
- **Comprehensive Evaluation**  
  – DeepEval metrics: faithfulness, hallucination, answer relevancy, contextual relevancy  
  – Safe-guarded against API rate limits and duplicate vectors

### Client (Next.js)
- User authentication via Clerk  
- Upload financial documents, generate reports  
- Interactive charts & downloads  
- Documentation & best practices pages  

### Server (Flask)
- `/advice` endpoint for on-demand personalized advice  
- `/process-document`, `/generate-user-report`, `/generate-organization-report` APIs  
- Ingestion script: `scripts/ingest_documents.py`  
- Evaluation script: `scripts/evaluate.py`

---

## Architecture & Folder Structure

```text
minor-phase-2-project/
├── client/                     # Next.js front-end
│   ├── app/                    # Pages & API routes
│   ├── components/             # React components
│   ├── public/                 # Static assets
│   ├── .env                    # Environment for client (e.g. NEXT_PUBLIC_API_URL)
│   └── package.json            # Client dependencies
├── server/                     # Python back-end
│   ├── scripts/
│   │   ├── build_knowledge_base.py
│   │   ├── download_financebench.py
│   │   ├── evaluate.py
│   │   └── test_knowledge_base.py
│   ├── tools/                  # RAG & advisor implementation
│   ├── models/                 # DeepEval integration
│   ├── data/
│   │   ├── documents/          # Source documents
│   │   └── evaluation/         # JSON & charts from evaluation
│   ├── main.py                 # Flask entrypoint
│   ├── .env.example
│   └── requirements.txt
└── README.md                   # Project overview
```
## Prerequisites
- Node.js ≥ 18
- Python ≥ 3.9
- Git
- Accounts / Keys for:
    Google Cloud (Vertex AI / Gemini)
    OpenRouter Key (Gemma 3)
    Pinecone
    Neo4j
    (Optional) Alpha Vantage, NewsAPI

## Installation
1. Clone the repo
```text
git clone 
cd minor-2-final
```

2. Set up the server
```text
cd server
python -m venv .venv
# for Windows
.\.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
# Edit .env: add your API keys & connection strings
```

3. Set up the client
```text
cd ../client
npm install        # or yarn / pnpm
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Server Usage
- Start the Flask app
On Windows (PowerShell):
```text
cd server
set FLASK_APP=main.py
flask run --reload --host=0.0.0.0 --port=8000
```
On macOS/Linux:
```text
cd server
export FLASK_APP=main.py
flask run --reload --host=0.0.0.0 --port=8000
```

## Client Usage
1. Start Next.js
```text
cd client
npm run dev
```
2. Browse
Open http://localhost:3000

3. Features
- Sign in / Register (Clerk)
- Upload documents & view generated user reports
- Generate organization (stock) reports
- Download charts & PDF summaries
- Read in-app documentation & best practices

## Evaluation Suite
The server/scripts/evaluate.py script runs a battery of test queries:
```text
cd server
python scripts/evaluate.py
```

- Produces server/data/evaluation/evaluation_results_<timestamp>.json
- Generates a chart PNG summarizing faithfulness, hallucination, answer & context relevance
- Implements DeepEval metrics using a custom CustomGeminiFlash model wrapper

## License
This project is licensed under the MIT License.
© 2025 Lucky110405