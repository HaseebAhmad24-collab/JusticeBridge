<div align="center">

![JusticeBridge-v1.0](https://img.shields.io/badge/JusticeBridge-V1.0-blue?style=flat-square)

# JusticeBridge AI

*Empowering Pakistan with Context-Aware Legal Intelligence.*

**An AI-powered legal platform that leverages RAG (Retrieval-Augmented Generation) to provide accurate, citation-backed answers for Pakistan Penal Code, Constitution, and Religious Jurisprudence.**

[![FastAPI](https://img.shields.io/badge/FastAPI-v0.100.0-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-v18.0-20232A?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![GeminiAI](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=flat-square&logo=google-gemini)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-v3.0-07405E?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](https://opensource.org/licenses/MIT)

[Live Demo](https://justice-bridge.vercel.app) · [Report Bug](https://github.com/HaseebAhmad24-collab/JusticeBridge/issues) · [Request Feature](https://github.com/HaseebAhmad24-collab/JusticeBridge/issues)

</div>

---

## 🌟 Why This Matters

Access to legal aid is often expensive and slow. **JusticeBridge AI** bridges this gap by:
- **Democratizing Legal Knowledge**: Providing instant access to complex legal documents in simple Roman Urdu or English.
- **Accuracy First**: Unlike generic AI, our RAG system cross-references real legal documents before answering.
- **Empowering Professionals**: Assisting law students and researchers with quick references and case summaries.

---

## 🚀 Key Features

- **🧠 Legal RAG Engine**: Semantic search across Pakistan's major laws (PPC, CrPC, CPC, Constitution).
- **💬 Intelligent Chat**: Persistent, session-based legal consultation with history and message editing.
- **🎙️ Voice-First Interface**: Support for voice commands and high-quality AI voice responses (TTS).
- **📚 Integrated Legal Library**: A digital repository of essential legal documents.
- **🛡️ Secure & Private**: OAuth2 authentication with encrypted session management.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A["User"] -->|Queries| B["Frontend (React)"]
    B -->|JWT Auth| C["Backend (FastAPI)"]
    C -->|Search Query| D["RAG Engine"]
    D -->|Semantic Lookup| E[("FAISS Vector Store")]
    E -->|Context| C
    C -->|Prompt + Context| F["Google Gemini AI"]
    F -->|AI Response| C
    C -->|JSON Response| B
    C -->|Save Message| G[("SQLite DB")]
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Google Gemini API Key

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/HaseebAhmad24-collab/JusticeBridge.git
   cd JusticeBridge
   ```

2. **Configure Backend**:
   - Navigate to `backend/`
   - Create a `.env` file:
     ```env
     GEMINI_API_KEY=your_key_here
     SECRET_KEY=your_random_secret
     ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```

3. **Configure Frontend**:
   - Navigate to `frontend/`
   - Install dependencies:
     ```bash
     npm install
     ```

4. **Run Project**:
   Double-click `run_project.bat` or run:
   ```bash
   # Backend
   uvicorn main:app --reload
   
   # Frontend
   npm run dev
   ```

---

## 🗺️ Future Roadmap

- [ ] **Premium Subscriptions**: Integrated payments via Stripe.
- [ ] **Document Analysis**: Uploading case-specific PDFs for AI summarization.
- [ ] **Legal Community**: A platform to connect users with verified lawyers.
- [ ] **Multi-lingual UI**: Native Urdu Nastaliq support.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
Built with ❤️ for a more accessible legal system in Pakistan.
</div>
