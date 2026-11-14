# Paytm Vyapar-Brain — Technical Architecture

This document provides a comprehensive technical overview of the **Paytm Vyapar-Brain** neighborhood commerce and merchant growth platform, detailing system architecture, data models, trust boundaries, state machines, and security controls.

---

## 1. System Architecture Overview

Paytm Vyapar-Brain is structured as a decoupled two-sided application with a React/TypeScript client interface and a high-throughput Python FastAPI backend.

```mermaid
graph TD
    subgraph Client["Frontend Client (React 18 + Vite)"]
        UI_M["Merchant Command Center (/merchant/*)"]
        UI_C["Customer Marketplace (/customer/*)"]
        AUTH_CTX["Auth & Language Context"]
        API_LAYER["Axios HTTP Layer (Bearer Token Auth)"]
    end

    subgraph Gateway["API & Security Layer (FastAPI)"]
        CORS_MW["Configurable CORS Middleware"]
        AUTH_DEP["HMAC-SHA256 Token Verification"]
        ROUTERS["Domain Routers (Auth, Offers, Bookings, Loyalty, Ledger)"]
    end

    subgraph Logic["Domain & Business Services"]
        STOCK_SVC["Atomic Stock & Reservation Service"]
        LOYALTY_SVC["Retention AI & Churn Probability Engine"]
        LEDGER_SVC["Voice Accounting & NLP Parser"]
        COMPARE_SVC["Multi-Store Price Comparison Engine"]
    end

    subgraph Data["Persistence Layer"]
        DB[(SQLite / PostgreSQL via SQLAlchemy 2.0)]
        AUDIT_LOG[(Immutable Audit Trail)]
    end

    UI_M --> API_LAYER
    UI_C --> API_LAYER
    API_LAYER --> Gateway
    Gateway --> Logic
    Logic --> Data
```

---

## 2. Core Entities and Data Schema

```mermaid
erDiagram
    MERCHANT ||--o{ PRODUCT : stocks
    MERCHANT ||--o{ BULK_OFFER : publishes
    MERCHANT ||--o{ TRANSACTION : records
    MERCHANT ||--o{ LOYALTY_ACTIVITY : observes
    CUSTOMER ||--o{ BOOKING : reserves
    CUSTOMER ||--o{ FAVOURITE : saves
    BULK_OFFER ||--o{ BOOKING : receives
    PRODUCT ||--o{ BULK_OFFER : references

    MERCHANT {
        int id PK
        string name
        string neighborhood
        string phone
        string email
        string password_hash
        string role
    }

    CUSTOMER {
        int id PK
        string name
        string neighborhood
        string phone
        string email
        boolean allow_promotions
        string preferred_language
    }

    BULK_OFFER {
        int id PK
        int merchant_id FK
        int product_id FK
        float bulk_price
        float retail_price
        int minimum_quantity
        int available_stock
        int booked_quantity
        string status
        string fulfilment_method
    }

    BOOKING {
        int id PK
        string booking_reference
        int customer_id FK
        int offer_id FK
        int merchant_id FK
        int quantity
        float total_amount
        string status
    }
```

---

## 3. Order & Stock Reservation State Machine

To prevent inventory overselling during high-demand bulk runs, stock reservation uses atomic database locking (`with_for_update()` / row-level transactions):

```mermaid
stateDiagram-v2
    [*] --> Pending : Customer Reserves Quantity (Stock Deducted)
    Pending --> Confirmed : Merchant Confirms Bulk Batch
    Pending --> Cancelled : Customer Cancels / Merchant Rejects (Stock Restored)
    Confirmed --> ReadyForPickup : Stock Packed at Store
    ReadyForPickup --> Fulfilled : Customer Picks Up & Pays
    Fulfilled --> [*]
    Cancelled --> [*]
```

---

## 4. Retention AI & Churn Probability Engine

The loyalty engine calculates customer visit cadence deterministically:
$$\text{Lapse Ratio} = \frac{\text{Current Date} - \text{Last Visit Date}}{\text{Average Historic Visit Interval}}$$

* **Active Regular:** $\text{Lapse Ratio} < 1.5$
* **Potentially Inactive / At-Risk:** $\text{Lapse Ratio} \ge 1.5$

Before drafting outreach campaigns, the system verifies the consumer's **DPDP Act 2023** marketing consent flag (`allow_promotions == True`).

---

## 5. Security & Trust Boundaries

| Boundary | Enforcement Mechanism | Failure Behavior |
| :--- | :--- | :--- |
| **API Authentication** | HMAC-SHA256 signature verification over session claims with expiration timestamps | `401 Unauthorized` |
| **Store Data Isolation**| SQL query filters scoped strictly to `merchant_id` | Zero cross-merchant leakage |
| **Invoice File Uploads** | Extension whitelist (`.jpg`, `.jpeg`, `.png`, `.pdf`, `.webp`), path traversal sanitization, and 5MB size limit | `400 Bad Request` |
| **CORS Access** | Configurable via `CORS_ORIGINS` environment variable | Restricted origin blocking |
| **Audit Trail** | Automatic insertion into `audit_logs` for authentication, status transitions, and settings changes | Immutable historical log |
