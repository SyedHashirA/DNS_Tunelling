# SecureLens — DNS Tunneling Attack Detector

> **🚀 New: Model Selection!** Choose between Random Forest, SVM, or Logistic Regression models directly from the detection UI after training.

A complete full-stack web application for detecting DNS tunneling using machine learning. Combines a React frontend with a Python Flask backend to train models and identify covert data exfiltration channels hidden in DNS queries.

---

## ✨ Features

### Core Functionality
- **DNS Tunneling Detection** — Identify data exfiltration and C2 traffic disguised as ordinary DNS queries
- **Multiple ML Models** — Train Random Forest, SVM, and Logistic Regression classifiers side-by-side
- **Model Selection** — Choose which trained model to use for detection from a dropdown in the UI
- **Real-time Analysis** — Paste or upload DNS queries and get instant results with confidence scores
- **Flexible Training** — Upload your own CSV dataset (`query`, `label`) or use the sample data
- **Performance Insights** — View accuracy metrics for all trained models and see which performed best

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Chart.js, Axios |
| Backend | Python 3, Flask, scikit-learn, Pandas, Joblib |
| Models | Random Forest, SVM, Logistic Regression |

---

## 📂 Project Structure

```
DNS_Tunelling/
├── backend/
│   ├── app.py                  # Main API endpoints
│   ├── model_utils.py          # ML training, prediction, model management
│   ├── requirements.txt        # Python dependencies
│   └── models/                 # Saved models
│       ├── best_model.joblib
│       ├── random_forest.joblib
│       ├── svm.joblib
│       ├── logistic_regression.joblib
│       └── model_info.json
├── src/
│   └── dns-tunneling/
│       ├── DNSTunnelingApp.jsx
│       ├── Dashboard.jsx
│       ├── Detection.jsx       # Detection with model dropdown
│       └── Models.jsx          # Model training and results
├── .env.example
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or later
- Python 3.8 or later
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/SyedHashirA/DNS_Tunelling.git
cd DNS_Tunelling
```

### 2. Set Up the Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set Up the Frontend
```bash
cd ..
npm install
```

### 4. Configure Backend URL
```bash
cp .env.example .env
# Edit .env if your backend isn't at http://localhost:5003
```

### 5. Run the Application
**Terminal 1 — Backend:**
```bash
cd backend
python app.py
```
Runs on `http://localhost:5003`

**Terminal 2 — Frontend:**
```bash
npm start
```
Runs on `http://localhost:3000`

Open: `http://localhost:3000/dns-tunneling`

---

## 🎯 How It Works

1. **Train** — Go to "Models" tab → Upload CSV with `query` and `label` (0=normal, 1=suspicious) → Click "Train Models"
2. **Select** — Go to "Detection" tab → Choose your preferred model from the dropdown
3. **Detect** — Enter DNS queries → Click "Detect Tunneling" → View results

---

## 🔧 Backend API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/models` | List trained models with accuracy |
| `GET` | `/api/sample-data` | Get sample queries |
| `POST` | `/api/predict` | Run detection on queries (supports `model` parameter) |
| `POST` | `/api/train` | Train all models on uploaded CSV |
| `GET` | `/api/training-progress` | Poll training progress |
| `GET` | `/api/results` | Get training results and best model |
| `POST` | `/api/validate-csv` | Validate CSV format |
| `POST` | `/api/upload-csv` | Parse uploaded CSV |

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run development server |
| `npm run build` | Create production build |
| `npm test` | Run tests |

---

## 🛣️ Roadmap

- [ ] Add authentication for multi-user deployments
- [ ] Expand with additional detection tools
- [ ] Add model persistence across sessions

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Syed Hashir Ahmed**  
[GitHub](https://github.com/SyedHashirA)
