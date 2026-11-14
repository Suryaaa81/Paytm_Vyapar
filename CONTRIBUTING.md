# Contributing to Paytm Vyapar-Brain

Thank you for your interest in contributing to Paytm Vyapar-Brain! We welcome contributions from developers, designers, fintech specialists, and application security researchers.

---

## 1. Code of Conduct & Integrity

- **Respect Privacy:** Never commit production database dumps, real merchant phone numbers, customer transaction records, or live API keys.
- **Accuracy:** Maintain the core design principles: strict separation between customer marketplace and merchant command center, deterministic financial arithmetic, and atomic inventory transactions.

---

## 2. Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (Python 3.11 recommended)
- Git

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --port 8001 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and communicates with the backend on `http://localhost:8001`.

---

## 3. Branching and Pull Request Workflow

1. Fork the repository and create a descriptive branch:
   - Feature: `feat/voice-intent-parser`
   - Bug fix: `fix/stock-race-condition`
   - Security: `sec/input-sanitization`
2. Follow standard code formatting:
   - Python: PEP 8, 4 spaces.
   - TypeScript/React: 2 spaces, strict typing (`noImplicitAny`).
3. Run automated tests before submitting a PR:
   ```bash
   # Backend verification suite
   cd backend
   python tests/verify_scenarios.py

   # Frontend build & typecheck
   cd ../frontend
   npm run build
   ```
4. Submit a Pull Request targeting the `main` branch with a clear summary of changes and test evidence.

---

## 4. Reporting Security Issues

Please review [SECURITY.md](SECURITY.md) for instructions on responsible vulnerability disclosure. Do not file public issues for security vulnerabilities.
