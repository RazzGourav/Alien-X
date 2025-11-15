# 💡 Project LUMEN: The Autonomous AI Financial Intelligence Layer

**Theme:** Generative AI | Agentic AI | Financial Security | Multimodal Analytics

[cite_start]**Project LUMEN** is a secure, AI-native financial infrastructure layer designed to eliminate the financial "blind spot" caused by chaotic, unstructured financial data[cite: 3, 4]. It transforms raw financial documents into structured, actionable intelligence and delivers proactive, autonomous financial insights.



## 🎯 The Challenge Solved

[cite_start]Financial data is scattered across receipts, invoices, and bank logs, making real-time insight impossible[cite: 3]. [cite_start]The core problem is the **lack of an intelligent, autonomous layer that can understand, reason about, and act on this data**[cite: 5].

LUMEN solves this by moving finance from static recordkeeping to **autonomous, AI-driven financial cognition**.

## 🚀 Core Features & Innovations

| Feature | Category | Impact |
| :--- | :--- | :--- |
| **Multimodal Document Intelligence** | Core Capability | [cite_start]Processes receipts/invoices instantly, extracting metadata (vendor, total, date) with high accuracy[cite: 18, 19]. |
| **AI-Powered Categorization** | Core Capability | Replaces manual rules by using the **Gemini 1.0 Pro model** to automatically classify merchant names into categories (Dining, Groceries, etc.), ensuring reliable data quality. |
| **Conversational Agent (RAG-like)** | Agentic Reasoning | [cite_start]Allows natural language Q&A (e.g., "How much did I spend at Starbucks?") by **grounding answers in BigQuery data** via the Gemini model[cite: 12, 13]. |
| **Proactive Financial Coach** | Generative Insights | [cite_start]Generates intelligent, explainable summaries and predictions[cite: 21], such as a full "Financial Health Report" on command. |
| **The Zero-Query Interface (NEW)** | **Unique Innovation** | [cite_start]**Inverts the chat paradigm.** The Agent autonomously detects high spending or anomalies and initiates the conversation with the user (via real-time notification)[cite: 29]. |
| **Dynamic Budget Enforcer (NEW)** | **Autonomous Action** | Automatically detects major unscheduled expenses (>$500) and autonomously **reallocates/cuts** the remaining variable budget (e.g., Dining limit cut by 20%) to mitigate financial risk. |
| **The Fee Hunter** (Simulated) | Autonomous Audit | [cite_start]Audits user-uploaded investment statements (simulated) for high "Expense Ratios" and calculates potential long-term savings, providing **autonomous risk assessment**[cite: 51]. |
| **Gamified Rewards** | Behavioral Intelligence | [cite_start]Drives user behavior by awarding **LUMEN Points** and "Budget Sniper" badges for meeting spending goals and disciplined financial behavior[cite: 44]. |

***

## 💻 Technology Stack (The Google Cloud Ecosystem)

[cite_start]Project LUMEN is built exclusively on the Google Cloud ecosystem for rapid, seamless integration, enabling high-performance and scalability[cite: 51].

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend/UI** | **Next.js, Tailwind CSS, Shadcn/ui** | [cite_start]Fast PWA development; provides a polished, modern, and accessible conversational UI[cite: 67, 68]. |
| **AI/Orchestration** | **Vertex AI (Gemini 1.0 Pro)** | [cite_start]Powers all reasoning, categorization, and generative insight tasks[cite: 31, 83]. |
| **Document Processing** | **Google Document AI** | [cite_start]Handles the core Multimodal Document Intelligence, extracting key-value pairs and line items from receipts[cite: 18, 19]. |
| **Analytical Backbone** | **BigQuery** | [cite_start]The "analytical brain" for complex expense analysis, querying, and reporting by the AI Agents[cite: 20]. |
| **Real-time Storage** | **Firestore** | [cite_start]Used for real-time app access, storing user settings, rewards, and proactive notifications (Zero-Query Interface)[cite: 20]. |
| **Backend API** | **Python (FastAPI) on Cloud Run** | [cite_start]High-performance API layer, native to the Python AI/ML ecosystem, deployed for scalability[cite: 52]. |
| **Authentication** | **Clerk** | [cite_start]Fastest, most secure way to add user authentication and manage sessions[cite: 53]. |

***

## ⚙️ Setup & Development Roadmap (24-Hour MVP)

[cite_start]This project was developed under a strict 24-hour roadmap designed for parallel, integrated development[cite: 54].

### Key Phases Demonstrated:

| Phase | Hours | Goal Demonstrated |
| :--- | :--- | :--- |
| **Phase 1-2** | 0-8 | [cite_start]**The Core Data Pipeline:** Ingest (DocAI) -> Process -> Store (BigQuery/Firestore)[cite: 70]. |
| **Phase 3** | 8-14 | [cite_start]**The "Brain" (Conversational AI):** Built the core Q&A loop using BigQuery data and Gemini[cite: 79]. |
| **Phase 4** | 14-18 | [cite_start]**The "Novelty" (Agentic & Proactive):** Implemented the **Proactive Financial Coach** (report generation) and the **Dynamic Budget Enforcer**[cite: 87]. |
| **Phase 5** | 18-22 | **Refinement & UX:** Developed the final, innovative UI/UX (Tabbed Expenses, Floating Cards, Scrolling Animations) and implemented end-to-end security via Clerk tokens. |
