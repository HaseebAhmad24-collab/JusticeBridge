# ⚖️ JusticeBridge AI - Your Legal Assistant for Pakistan Law

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

**JusticeBridge AI** is an advanced, AI-powered legal consultation platform specifically designed for the legal landscape of Pakistan. It leverages **Retrieval-Augmented Generation (RAG)** to provide highly accurate, citation-backed answers from the Pakistan Penal Code, Constitution, and Religious Jurisprudence.

---

## 🌟 Why This Matters

Access to legal aid is often expensive and slow. **JusticeBridge AI** bridges this gap by:
- **Democratizing Legal Knowledge**: Providing instant access to complex legal documents in simple Roman Urdu or English.
- **Reducing Legal Complexity**: Breaking down legal jargon into actionable advice.
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
*Built with ❤️ for a more accessible legal system in Pakistan.*
