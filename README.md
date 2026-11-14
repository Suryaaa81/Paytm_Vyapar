# Paytm Vyapar-Brain 🧠🛒
### Your AI Growth Partner for Everyday Neighborhood Commerce

[![CI Pipeline](https://github.com/Suryaaa81/Paytm_Vyapar/actions/workflows/ci.yml/badge.svg)](https://github.com/Suryaaa81/Paytm_Vyapar/actions)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Code Security](https://img.shields.io/badge/Security-Audit%20Passed-16A34A.svg)](docs/SECURITY_AUDIT.md)
[![License](https://img.shields.io/badge/License-Unlicensed-lightgrey.svg)](#license)

> **IMPORTANT DISCLAIMER:**  
> Paytm Vyapar-Brain is an **independent hackathon prototype** created for technical evaluation. It is **not** an official Paytm product or an authorized Paytm integration. All trademarks and brand names belong to their respective owners.

---

## 📌 Executive Summary

India's 13 million local kirana stores power over **90% of food retail**, but they are rapidly losing their highest-margin business (monthly staple baskets like 25kg rice sacks, 10kg dal bags, and 15L oil tins) to subsidized quick-commerce dark stores.

**Paytm Vyapar-Brain** levels the playing field with a **symmetric two-sided commerce and intelligence platform**:

1. **For Kirana Merchants:** A comprehensive AI command center to publish bulk offers, manage inventory, identify churning shoppers, and track daily sales via multilingual voice.
2. **For Neighborhood Shoppers:** A consumer marketplace to discover wholesale-rate staple deals near their home, compare multi-store prices, and reserve products with zero delivery markup.

```mermaid
graph LR
    subgraph Customer["Customer Marketplace (/customer)"]
        C1["Discover Bulk Staples (Rice, Dal, Oil)"]
        C2["Multi-Store Price Comparison"]
        C3["Zero-Fee Reservation (Pay at Pickup)"]
    end

    subgraph Core["Paytm Vyapar-Brain Engine"]
        E1["Atomic Stock Deductions (with_for_update)"]
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

## 🖥️ Two-Sided Platform Interface

```
┌────────────────────────────────────────────────────────┐  ┌────────────────────────────────────────────────────────┐
│         CUSTOMER MARKETPLACE (/customer/home)          │  │       MERCHANT COMMAND CENTER (/merchant/dashboard)    │
├────────────────────────────────────────────────────────┤  ├────────────────────────────────────────────────────────┤
│ [Search: Sona Masoori Rice, Toor Dal, Oil...]          │  │ 🏪 Sri Vinayaka Kirana Store • Ameerpet, Hyderabad     │
│                                                        │  │                                                        │
│ 🔥 ALMOST UNLOCKED DEALS (Group Buying Progress):      │  │ 📊 DAILY OPERATIONS BRIEFING:                          │
│ ┌────────────────────────────────────────────────────┐ │  │ • Fulfilled Value: ₹6,140  • Confirmed Sales: ₹4,050  │
│ │ Sona Masoori Rice (25kg) - Sri Vinayaka Kirana     │ │  │ • Pending Confirmation: 2 Bookings (Sona Masoori Rice)│
│ │ Retail: ₹1,450  Bulk Deal: ₹1,320 (SAVE ₹130)      │ │  │                                                        │
│ │ Booked: 12/10 bags [████████████] 100% UNLOCKED!   │ │  │ ⚠️ RETENTION AI ALERT:                               │
│ └────────────────────────────────────────────────────┘ │  │ • Anitha Rao absent 16.1 days (3-day cycle)           │
│                                                        │  │ • Action: [1-Click WhatsApp Draft in Telugu]           │
│ ⚖️ MULTI-STORE PRICE COMPARISON:                       │  │                                                        │
│ • Sri Vinayaka Kirana (300m away): ₹1,350 (Save ₹100)  │  │ 🎙️ SPEAK LEDGER (Voice Accounting):                   │
│ • Kumar Kirana (800m away):        ₹1,380 (Save ₹100)  │  │ "Cash sale 450, Suresh credit 200, paid 150 current"   │
│ • Sri Lakshmi Stores (1.8km away): ₹1,400 (Save ₹100)  │  │ ➔ Net Cash: ₹300 | Credit Receivables: ₹200            │
└────────────────────────────────────────────────────────┘  └────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Product Features

### 🛒 1. Smart Neighborhood Bulk Orders
* **Merchant-Defined Thresholds:** Merchants set bulk discount rates, minimum group thresholds (e.g. 5 bags), pack sizes, and total stock limits.
* **Atomic Stock Protection:** Reservations use database row-level locking (`with_for_update()`) to prevent race conditions or overselling.
* **Neighborhood Price Comparison:** Customers compare identical grocery staples across stores in Ameerpet, SR Nagar, and Madhapur.
* **Zero Advance Fees:** Shoppers reserve units in 1 tap and pay via Cash or Paytm Soundbox UPI at store pickup.

### 🤖 2. Retention AI & Churn Detection Engine
* **Deterministic Lapse Formula:**
  $$\text{Lapse Ratio} = \frac{\text{Days Since Last Visit}}{\text{Average Historic Visit Interval}}$$
  When $\text{Lapse Ratio} \ge 1.5$, the customer is automatically flagged as **At-Risk**.
* **1-Click Multilingual Re-Engagement:** Automatically drafts personalized offers in **Telugu**, **Hindi**, or **English**:
  * *Telugu:* `"నమస్తే Anitha Rao గారు! శ్రీ వినాయక కిరాణా స్టోర్ మిమ్మల్ని మిస్ అవుతోంది. సోనా మసూరి బియ్యం & కందిపప్పుపై ప్రత్యేక బల్క్ ఆఫర్ నడుస్తోంది..."*
* **DPDP Act (2023) Compliance:** Checks customer marketing consent flags (`allow_promotions`) and logs every campaign action to an immutable audit ledger.

### 🎙️ 3. Speak Ledger (Voice-Driven Natural Language Bookkeeping)
* Kirana owners speak transactions naturally in Hinglish, Telugu, or English at the end of the day:
  > *"Received 450 cash, Suresh took 200 on credit, paid 150 electricity bill."*
* **Strict Financial Separation:**
  $$\text{Cash Inflow (₹450)} - \text{Expenses (₹150)} = \mathbf{₹300}\text{ Net Cash Movement}$$
  Credit receivables (*Udhar* ₹200) are tracked separately as an asset and **never** falsely added to liquid daily cash.

### 📄 4. Invoice Intelligence (APMC Mandi Scanner)
* Uploads wholesale slips from APMC mandi distributors with strict 5MB size limits and file extension checks.
* Automatically extracts line items, wholesale purchase costs, and quantities to replenish inventory in 1 tap.

---

## 🎬 2-Minute Demo Script for Evaluators

Want to test the full end-to-end platform in 2 minutes? Follow these steps:

1. **Merchant Command Center:**
   * Open `http://localhost:5173/merchant/dashboard`
   * Check the **Daily Operations Briefing** and today's fulfilled sales.
   * Go to **Customer Insights** (`/merchant/customer-insights`) $\to$ see *Anitha Rao* flagged as "Potentially Inactive" (absent for 16.1 days vs. 3-day cycle).
   * Click **Draft Campaign** $\to$ inspect the personalized Telugu/Hindi message $\to$ click **Approve & Dispatch**.
2. **Speak Ledger:**
   * Go to **Speak Ledger** (`/merchant/speak-ledger`).
   * Click **Simulate Voice Input** $\to$ click **Process Voice Entry**.
   * Observe the math: Cash (₹450) - Expenses (₹150) = Net Cash (₹300). Suresh's ₹200 credit is isolated.
3. **Customer Experience:**
   * Click the bottom-left **"Go to Customer View"** button.
   * In **Nearby Deals** (`/customer/deals`), see authentic staple photos (Toor Dal, Sona Masoori Rice, Sunflower Oil).
   * Go to **Compare Prices** (`/customer/compare`) to compare Sona Masoori Rice across 3 local Kiranas.
   * Click **Reserve & Book** $\to$ choose 2 bags $\to$ confirm booking with reference `BK-2026-XXXX`.
4. **Merchant Fulfilment:**
   * Switch back to **Merchant View** $\to$ go to **Orders** (`/merchant/orders`).
   * Transition the new booking: `Pending` $\to$ `Confirmed` $\to$ `Ready for Pickup` $\to$ `Fulfilled`.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 8.3 | High-performance reactive UI with strict type safety. |
| **Styling & UI** | Tailwind CSS v3, Lucide React | Paytm-inspired fintech design system (`#00A5FF`, `#0075E3`, `#172B4D`). |
| **Backend** | Python 3.11, FastAPI 0.111.0 | Asynchronous RESTful APIs with auto-generated OpenAPI documentation. |
| **Database** | SQLAlchemy 2.0 ORM, SQLite / PostgreSQL | ACID relational integrity with atomic row-level locking. |
| **Security** | HMAC-SHA256 Token Signatures, CORS | Cryptographic session verification, role-based access, and upload sanitization. |
| **CI/CD** | GitHub Actions | Automated build, lint, and test execution on every pull request. |

---

## 📁 Repository Structure

```
Paytm_Vyapar/
├── backend/
│   ├── app/
│   │   ├── ai/            # Sarvam AI integrations & OCR mock fallbacks
│   │   ├── api/           # 11 Domain routers (auth, bookings, offers, loyalty, etc.)
│   │   ├── models/        # SQLAlchemy database models
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── services/      # Business logic, analytics & growth engines
│   │   ├── database.py    # Database connection & canonical path resolution
│   │   ├── main.py        # FastAPI initialization & configurable CORS
│   │   ├── migrate.py     # Schema migrations
│   │   └── seed.py        # Fictional demo seed data generator
│   ├── tests/
│   │   ├── test_security_and_logic.py # 10 Automated security & unit tests
│   │   └── verify_scenarios.py       # 6 End-to-end integration scenarios
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI cards, tables, headers & layouts
│   │   ├── context/       # Language (EN, TE, HI) & Auth state
│   │   ├── pages/
│   │   │   ├── customer/  # Customer views (Deals, Compare, Bookings, Profile)
│   │   │   └── merchant/  # Merchant views (Dashboard, Offers, Loyalty, Ledger)
│   │   ├── services/      # Axios API client with token interceptor
│   │   └── utils/         # Currency formatters, authentic photo mappings & i18n
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docs/
│   ├── ARCHITECTURE.md    # System architecture, ER diagrams & trust boundaries
│   ├── SECURITY_AUDIT.md  # Comprehensive vulnerability audit report
│   └── KNOWN_LIMITATIONS.md # Transparent scope boundaries (mock Soundbox, simulated SMS)
├── .editorconfig          # Consistent formatting configuration
├── .gitignore             # Comprehensive exclusions (secrets, databases, venvs)
├── CONTRIBUTING.md        # Developer setup, branching strategy & PR rules
├── SECURITY.md            # Responsible vulnerability disclosure policy
└── README.md
```

---

## ⚡ Quickstart Guide

### Prerequisites
* **Node.js:** v18.0.0 or later
* **Python:** v3.10 or later (v3.11 recommended)
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Suryaaa81/Paytm_Vyapar.git
cd Paytm_Vyapar
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
cp .env.example backend/.env
```

### 3. Start the Backend API
```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --port 8001 --reload
```
* Backend runs at: `http://localhost:8001`
* Interactive API Documentation (Swagger): `http://localhost:8001/docs`

### 4. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
* Application runs at: `http://localhost:5173`

---

## 🧪 Testing & Code Quality

```bash
# 1. Run Automated Security & Unit Tests (10/10 Tests)
cd backend
python tests/test_security_and_logic.py

# 2. Run End-to-End Business Workflows (6/6 Scenarios)
python tests/verify_scenarios.py

# 3. Run Frontend Build & Typecheck (0 Errors)
cd ../frontend
npm run build
```

---

## 🔒 Security & Privacy Highlights

* **Cryptographic Token Verification:** Tokens are signed using **HMAC-SHA256** with expiration validation; forged payloads are rejected (`401 Unauthorized`).
* **Environment-Bound CORS:** Configured via `CORS_ORIGINS` to prevent wildcard origin vulnerabilities.
* **Safe Multipart Uploads:** Mandi invoice scanner validates file extensions (`.jpg`, `.jpeg`, `.png`, `.pdf`, `.webp`), caps file sizes at 5MB, and strips path traversal strings.
* **Zero Credential Exposure:** All `.env` files and `.db` databases are strictly excluded from source control.
* **DPDP Act (2023) Compliance:** Verifies explicit marketing consent before drafting campaigns and logs every status transition into `audit_logs`.

For full details, inspect [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md).

---

## 📄 License

This project is currently **unlicensed**. All rights are reserved by the author. You may review and test the repository for hackathon evaluation purposes. An open-source license (such as MIT or Apache-2.0) can be added upon request.
