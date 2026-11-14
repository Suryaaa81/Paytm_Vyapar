# Known Limitations & Demonstration Scopes — Paytm Vyapar-Brain

This document transparently outlines simulated capabilities, mock services, and architectural boundaries in the current version of Paytm Vyapar-Brain.

---

## 1. Hackathon & Prototype Notice

**Paytm Vyapar-Brain is an independent hackathon prototype project and is not an official Paytm product or an authorized Paytm integration.** All trademarks and brand names belong to their respective owners.

---

## 2. Simulated & Mock Integrations

| Feature | Current Implementation | Production Requirement |
| :--- | :--- | :--- |
| **Payment Gateway** | Pay-at-Pickup simulation. No payment credentials or real money transfers occur. | Paytm All-in-One Payment Gateway / Dynamic UPI QR API integration. |
| **Soundbox Voice Audio** | Browser-rendered audio alerts and visual soundbox animation. | Paytm Soundbox 3.0 IoT SDK integration for hardware-level POS broadcasts. |
| **SMS / WhatsApp Dispatch** | Status marks as `simulated_sent` in the database. No SMS credits or WhatsApp Business API tokens are consumed. | WhatsApp Business Cloud API / Twilio SMS gateway webhook integration. |
| **Invoice OCR** | Deterministic APMC invoice parser with mock mandi receipts. | Production OCR pipeline (e.g., Google Cloud Document AI, AWS Textract, or Sarvam AI Vision). |
| **Voice Speech Recognition** | Client-side Web Speech API fallback and regex natural language parser. | Sarvam AI ASR / Whisper streaming speech-to-text API. |

---

## 3. Database & Deployment Scopes

* **Database Engine:** The default configuration uses local SQLite with `check_same_thread=False` for zero-configuration hackathon testing. In enterprise deployment, configure `DATABASE_URL` with a managed PostgreSQL cluster.
* **Authentication:** The application provides dual-mode authentication:
  * Signed HMAC-SHA256 bearer tokens for authenticated API sessions.
  * Rapid 1-click role switcher in the UI for effortless demonstration of both Merchant and Customer workflows without credential fatigue.
