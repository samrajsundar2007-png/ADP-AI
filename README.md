# ADP AI — Any Dataset Predictive AI

ADP AI is a powerful, full-stack automated machine learning (AutoML) platform designed to ingest any structured tabular dataset and immediately output high-fidelity predictions, automated analytical modeling, interactive charts, and production-ready reports (PDF/Excel).

---

## 🚀 Key Features

- **Universal Dataset Handling** — Upload any tabular data (`.csv`, `.xlsx`) to automatically run preprocessing and feature mapping layouts.
- **Auto-ML Engine** — Custom modular algorithms specialized in Classification, Regression, Forecasting, Clustering, and Anomaly Detection.
- **Explainable AI Integration** — Embedded LLM prompt engineering and prediction managers to synthesize analytical metrics into human-readable project breakdowns.
- **Interactive Visualization** — Dynamic multi-variant chart modules, onboarding tutorials, and live canvas components built directly into the UI.
- **Enterprise Reporting** — One-click compiling systems exporting parsed results into clean formatting, JSON maps, or formatted PDF documents.

---

## 🛠️ Tech Stack

### Frontend Application
- **Framework:** React.js (scaffolded with Vite)
- **Styling Engine:** Tailwind CSS & PostCSS
- **State & Visuals:** Context API architecture managing custom charting dashboards and interactive prediction tables

### Backend Analytical Server
- **REST Framework:** FastAPI (Python)
- **Data Processing & ML:** Pandas, NumPy, Scikit-Learn (Random Forest Engine, Regression Matrices, Preprocessing Stacks)
- **Automated Exporters:** Native PDF report builders and Excel workbook stream engines

---

## 💻 Local Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) and [Python 3.9+](https://www.python.org/) configured locally on your operating system.

### 1. Backend ML Engine Deployment

Open your workspace terminal and move into the main server application directory:

```bash
cd ADP/backend/app
```

Create and activate a clean Python virtual environment:

```bash
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

Install all required application dependencies:

```bash
pip install -r requirements.txt
```

Boot up the live FastAPI development server:

```bash
uvicorn main:app --reload
```

**Backend system access:** The server boots live at `http://127.0.0.1:8000`. You can inspect and test the interactive API layout instantly via Swagger UI at `http://127.0.0.1:8000/docs`.

### 2. Frontend User Interface Scaffolding

Open a separate, concurrent terminal instance and enter your frontend workspace folder:

```bash
cd ADP/frontend
```

Install dependencies via npm:

```bash
npm install
```

Launch the hot-reloading user interface:

```bash
npm run dev
```

**Frontend interface access:** The client console spins up at `http://localhost:5173`. Open this URL in any web browser to access your interactive predictive dashboard workspace.

---

## 🔑 Environment Variables

Create a `.env` file inside `backend/app/` for local development. **Never commit this file or real API keys to GitHub** — make sure `.env` is listed in `.gitignore`.

```
OPENAI_API_KEY=your_key_here
DATABASE_URL=your_database_url_here
SECRET_KEY=your_auth_secret_here
```

Adjust variable names to match what `app/core/config.py` actually expects.

---

## 📂 Project Architecture

```
ADP/
├── backend/
│   ├── app/
│   │   ├── ai/          # LLM endpoints, explanation tools, prompt templates, nginx.conf
│   │   ├── api/          # FastAPI endpoints (auth, chat, prediction, reports, datasets)
│   │   ├── ml/            # Core Auto-ML execution scripts (anomaly, clustering, random_forest_engine)
│   │   ├── models/         # Data schema structures & database definitions
│   │   └── main.py          # Core service initialization script
│   └── reports/              # Cache space handling generated client PDF/Excel files
└── frontend/
    ├── src/
    │   ├── components/     # Interface canvas (Charts, UploadBox, InteractiveVisualizer, DatasetTable)
    │   ├── pages/            # Dashboard and Home workspace layouts
    │   └── main.jsx           # App injection point to the virtual DOM
```

---

## ⚠️ Before Pushing to GitHub

- `backend/reports/` is a cache directory for generated PDF/Excel/JSON output — these are runtime artifacts, not source code. Add `backend/reports/*.json`, `*.pdf`, `*.xlsx` to `.gitignore` and untrack any already-committed files with `git rm --cached`.
- Double-check `frontend/public/` for any personal images that may have been committed accidentally.
- Confirm no real API keys are hardcoded anywhere in `app/core/config.py` or committed `.env` files.

---

## 🛣️ Roadmap

- [ ] Clean up committed runtime artifacts from git history
- [ ] Add CI for backend tests
- [ ] Add Docker Compose for one-command local setup (frontend + backend + DB)
- [ ] Expand model support / add hyperparameter tuning options
- [ ] Add role-based access control for multi-user usage

---

## 📄 License

MIT License — free to use, modify, and distribute.
