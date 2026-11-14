# Paytm Vyapar-Brain 🧠🛒
### Your AI Growth Partner for Everyday Neighborhood Commerce

[![CI Pipeline](https://github.com/placeholder/paytm-vyapar-brain/actions/workflows/ci.yml/badge.svg)](https://github.com/placeholder/paytm-vyapar-brain/actions)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Unlicensed-lightgrey.svg)](#license)

> **IMPORTANT DISCLAIMER:**  
> Paytm Vyapar-Brain is an **independent hackathon prototype** created for technical evaluation. It is **not** an official Paytm product or an authorized Paytm integration. All trademarks and brand names belong to their respective owners.

---

## 1. The Core Idea

India's 13 million local kirana stores are losing high-margin staple baskets (rice sacks, dal bags, cooking oil tins) to subsidized quick-commerce dark stores.

**Paytm Vyapar-Brain** levels the playing field:
1. **For Merchants (Kirana Owners):** An AI-powered growth command center to publish bulk offers, manage inventory, identify churning shoppers, and track daily sales via voice.
2. **For Customers (Neighborhood Shoppers):** A grocery shopping marketplace to discover wholesale-rate staple deals near their home, compare multi-store prices, and reserve products with zero delivery markup.

```mermaid
graph LR
    subgraph Customer["Customer Marketplace (/customer)"]
        C1["Discover Bulk Staples (Rice, Dal, Oil)"]
        C2["Multi-Store Price Comparison"]
        C3["Zero-Fee Reservation (Pay at Pickup)"]
    end

    subgraph Core["Paytm Vyapar-Brain Engine"]
        E1["Atomic Stock Deductions"]
        E2["Retention AI & Churn Probability"]
        E3["Speak Ledger Natural Language Accounting"]
    end

    subgraph Merchant["Merchant Command Center (/merchant)"]
        M1["Sri Vinayaka Kirana (Ameerpet)"]
        M2["Batch Fulfilment State Machine"]
        M3["DPDP-Compliant Outreach"]
    end

    Customer <--> Core <--> Merchant
```

---

## 2. Key Features

### 🛒 Feature A: Smart Neighborhood Bulk Orders
* **Independent Merchant Control:** Kirana owners set retail prices, bulk discount rates, minimum group thresholds (e.g. 5 bags), and stock limits.
* **Atomic Stock Locks:** Inventory is deducted atomically with database row-level locking (`with_for_update()`) to prevent overselling.
* **Group Buying Dynamics:** Deals display dynamic progress bars (*"4 more bags needed to unlock wholesale pricing"*).
* **Multi-Store Price Compare:** Shoppers compare identical staple products across stores within a 500m–2km neighborhood radius.
* **Zero Advance Fees:** Shoppers reserve units online and pay at the shop counter via cash or UPI QR upon pickup.

### 🤖 Feature B: AI Customer Loyalty & Churn Detection
* **Deterministic Lapse Formula:**
  $$\text{Lapse Ratio} = \frac{\text{Days Since Last Visit}}{\text{Average Historic Visit Interval}}$$
  Shoppers with $\text{Ratio} \ge 1.5$ are flagged as **At-Risk**.
* **1-Click Multilingual Re-Engagement:** Drafts personalized outreach in **Telugu**, **Hindi**, or **English**.
* **DPDP Act (2023) Compliance:** Verifies customer marketing consent flags (`allow_promotions`) before dispatching campaigns.

### 🎙️ Feature C: Speak Ledger (Voice-Driven Bookkeeping)
* Merchants speak naturally at closing: *"Received 450 cash, Suresh took 200 on credit, paid 150 electricity."*
* **Accurate Financial Separation:** Calculates $\text{Cash In} - \text{Expenses} = \text{Net Cash Flow}$. Credit sales (*Udhar*) are isolated as receivables and **never** falsely added to liquid daily cash.

### 📄 Feature D: Invoice Intelligence
* Scans APMC mandi wholesale invoices to extract line items, prices, and quantities for 1-click inventory replenishment.

---

## 3. Technology Stack

* **Frontend:** React 18, TypeScript, Tailwind CSS v3, Vite 8.3, Lucide React icons.
* **Backend:** Python 3.11, FastAPI 0.111.0, SQLAlchemy 2.0 ORM, SQLite / PostgreSQL.
* **Security & Auth:** HMAC-SHA256 cryptographically signed tokens, configurable CORS origins, upload MIME/size validation.
* **Architecture:** Decoupled RESTful API with 11 domain routers and immutable audit logging.

---

## 4. Repository Structure

```
paytm-vyapar-brain/
├── backend/
│   ├── app/
│   │   ├── ai/            # Sarvam AI integrations & OCR mock fallbacks
│   │   ├── api/           # 11 Domain routers (auth, bookings, offers, loyalty, etc.)
│   │   ├── models/        # SQLAlchemy database models
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── services/      # Business logic, analytics & growth engines
│   │   ├── database.py    # Database connection & path resolution
│   │   ├── main.py        # FastAPI app initialization & CORS middleware
│   │   ├── migrate.py     # Schema migrations
│   │   └── seed.py        # Fictional demo seed data generator
│   ├── tests/
│   │   ├── test_security_and_logic.py # Automated security & unit test suite
│   │   └── verify_scenarios.py       # End-to-end integration scenario suite
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components & layouts
│   │   ├── context/       # Language (EN, TE, HI) & Auth state
│   │   ├── pages/
│   │   │   ├── customer/  # Customer marketplace views (Deals, Compare, Bookings)
│   │   │   └── merchant/  # Merchant operations (Dashboard, Offers, Loyalty, Ledger)
│   │   ├── services/      # Axios API clients
│   │   └── utils/         # Formatting, authentic photo CDNs & i18n
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docs/
│   ├── ARCHITECTURE.md    # Detailed architecture documentation & Mermaid diagrams
│   ├── SECURITY_AUDIT.md  # Comprehensive security audit report
│   └── KNOWN_LIMITATIONS.md # Simulated features & demo boundaries
├── .editorconfig          # Consistent code formatting configuration
├── .gitignore             # Git exclusion rules (secrets, venvs, DBs)
├── CONTRIBUTING.md        # Contribution & PR guidelines
├── SECURITY.md            # Responsible vulnerability disclosure policy
└── README.md
```

---

## 5. Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or later
* **Python:** v3.10 or later (v3.11 recommended)
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/placeholder/paytm-vyapar-brain.git
cd paytm-vyapar-brain
```

### 2. Configure Environment
```bash
cp .env.example .env
cp .env.example backend/.env
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --port 8001 --reload
```
The FastAPI backend will start at `http://localhost:8001`. Interactive API documentation is available at `http://localhost:8001/docs`.

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 6. Running Tests & Quality Checks

### 1. Automated Security & Logic Unit Tests
```bash
cd backend
python tests/test_security_and_logic.py
```
*Executes 10 automated test suites covering HMAC token signing, expired token rejection, file upload path traversal sanitization, and financial arithmetic.*

### 2. End-to-End Acceptance Scenarios
```bash
cd backend
python tests/verify_scenarios.py
```
*Verifies 6 complete customer and merchant business workflows against the live database.*

### 3. Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

---

## 7. Security & Compliance Highlights

* **No Hardcoded Credentials:** Zero secrets or API keys are committed. All secrets use environment variable bindings.
* **Cryptographic Token Verification:** Session tokens are HMAC-SHA256 signed with expiration checks.
* **Safe File Processing:** Invoice uploads enforce a 5MB size limit, extension whitelist (`.jpg`, `.png`, `.pdf`), and path traversal sanitization.
* **Data Protection:** Customer re-engagement strictly honors DPDP Act 2023 opt-out flags.
* **Audit Trail:** Critical operations are permanently recorded in an immutable `audit_logs` table.

For detailed security findings, refer to [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md).

---

## 8. License

This repository is currently **unlicensed**. All rights are reserved by the project author. Open-source maintainers may request the inclusion of an open-source license (such as MIT or Apache-2.0) upon formal release.
