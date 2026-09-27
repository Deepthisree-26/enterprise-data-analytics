# Enterprise Data Analytics & BI Platform

An enterprise-grade full-stack Business Intelligence & Data Analytics platform built with **FastAPI**, **React (TypeScript + Vite)**, **Scikit-Learn**, and an **Executive AI Assistant**.

---

## 🚀 Key Features

- **Multi-Role Workspaces (RBAC):**
  - **👨‍💻 Data Analyst:** Upload and ingest sales datasets (.csv, .xlsx), explore live transaction ledger, and run interactive ML revenue simulations.
  - **📊 Executive Manager:** Real-time financial scorecards, regional revenue distribution, forecast accuracy, PDF/Excel audit reports, and AI Executive Assistant.
  - **🛡️ System Administrator:** Microservice health metrics, user account lifecycle management, and system governance controls.
- **Predictive ML Telemetry:** Multivariate linear regression predicting revenue based on units sold and gross profit margin ($R^2 \approx 0.94$).
- **AI Executive Copilot:** Natural language dataset querying, real-time telemetry analysis, and data-backed business growth recommendations.
- **Reporting & Auditing:** Real-time PDF and Excel export generation for board presentations.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Axios
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, SQLite, Pandas, Scikit-Learn, ReportLab, OpenPyXL
- **AI Engine:** Dataset Intelligence Engine with optional local Ollama (Llama 3.2) integration

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js:** v18+
- **Python:** 3.10+
- **Git**

### 2. Installation

Clone the repository:
```bash
git clone <your-repository-url>
cd enterprise-data-analytics
```

Install root and frontend dependencies:
```bash
npm install
npm --prefix frontend install
```

Install backend dependencies:
```bash
pip install -r backend/requirements.txt
```

### 3. Running the Application

Run both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend UI:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Running Tests

```bash
# Backend test suite
npm run test:backend
# or
python -m pytest backend
```

---

## 📁 Project Structure

```
enterprise-data-analytics/
├── backend/
│   ├── app/
│   │   ├── ai/          # AI Executive Assistant & Dataset Intelligence
│   │   ├── api/         # FastAPI route endpoints
│   │   ├── auth/        # JWT security, hashing & RBAC
│   │   ├── data/        # Data ingestion, models & schemas
│   │   ├── ml/          # Scikit-learn predictive models
│   │   ├── reports/     # PDF & Excel export generators
│   │   └── main.py      # Application entrypoint
│   └── tests/           # Pytest test suites
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components & charts
│   │   ├── pages/       # Dashboard, Login, Signup & ManagerChat
│   │   ├── services/    # Axios API service integrations
│   │   └── styles/      # Tailwind & global CSS
│   └── vite.config.ts   # Vite dev server & proxy configuration
└── package.json         # Workspace orchestration scripts
```

---

## 📄 License
This project is private and proprietary.
