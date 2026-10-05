# Enterprise Data Analytics & BI Platform

An enterprise-grade full-stack Business Intelligence & Data Analytics platform built with **FastAPI**, **React (TypeScript + Vite)**, **Scikit-Learn**, and an **Executive AI Assistant**.

---

## 🚀 Key Features

- **Multi-Department Ingestion Center:**
  - 7 Enterprise Functional Units: **Sales**, **Customers**, **Products**, **Inventory**, **Finance**, **Marketing**, and **HR**.
  - Strict 7-Step Ingestion Wizard: Department selection, dataset type, schema inspection, file upload (.csv/.xlsx), automated validation (schema, types, duplicates, and foreign key integrity), preview with search/pagination, and database import.
  - Ingestion audit history logging timestamps, row counts, and status.
- **Multi-Role Workspaces (RBAC):**
  - **👨‍💻 Data Analyst:** Upload, validate, and preview department datasets, view Data Explorer ledger, and simulate predictive analytics.
  - **📊 Executive Manager:** Executive Overview combining cross-department telemetry, dedicated department scorecards, multi-sheet board reports (PDF/Excel), and Executive AI Copilot.
  - **🛡️ System Administrator:** Microservice health metrics, user account lifecycle governance, and full administrative access.
- **Predictive ML Telemetry:**
  - Sales Multivariate Linear Regression ($R^2 \approx 0.94$).
  - Customer Churn Probability classification.
  - Inventory Stockout & Run-rate buffer modeling.
  - Marketing Omnichannel ROI and conversion funnel estimation.
- **Cross-Department Intelligence & AI Executive Copilot:**
  - Contextual natural language Q&A across all 7 uploaded department tables (top spenders, high-velocity low-stock items, regional underperformance, and top 5 business risks).
- **Multi-Sheet Reporting Engine:**
  - Board-ready PDF briefs and multi-sheet Excel workbooks dynamically populated based on active uploaded departments.


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
├── sample_data/         # Realistic multi-department test datasets
│   ├── sales.csv
│   ├── customers.csv
│   ├── products.csv
│   ├── inventory.csv
│   ├── finance.csv
│   ├── marketing.csv
│   └── employees.csv
└── package.json         # Workspace orchestration scripts
```

---

## 📄 License
This project is private and proprietary.
