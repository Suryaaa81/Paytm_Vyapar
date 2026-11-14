# Security Audit Report — Paytm Vyapar-Brain

**Date of Audit:** November 14, 2026  
**Auditor:** Automated DevSecOps & Security Hardening Pipeline  
**Target Repository:** Paytm Vyapar-Brain  
**Target Frameworks:** FastAPI 0.111.0, React 18, SQLAlchemy 2.0  

---

## 1. Executive Summary

A comprehensive application security audit, static analysis, and penetration review was conducted across the frontend and backend codebase. All identified vulnerabilities in authentication, file upload processing, cross-origin resource sharing (CORS), and token signing have been remediated and verified with automated test suites.

| Severity | Found | Fixed | Unresolved | Status |
| :--- | :---: | :---: | :---: | :---: |
| **CRITICAL** | 0 | 0 | 0 | **PASS** |
| **HIGH** | 2 | 2 | 0 | **PASS** |
| **MEDIUM** | 2 | 2 | 0 | **PASS** |
| **LOW** | 1 | 1 | 0 | **PASS** |
| **INFORMATIONAL** | 2 | 2 | 0 | **PASS** |

---

## 2. Vulnerability Findings & Remediation

### Finding SEC-01: Insecure Token Generation Without Cryptographic HMAC Signature
* **Severity:** **HIGH**
* **Location:** `backend/app/api/auth.py`
* **Vulnerability Description:** Previously, demo tokens used base64-encoded JSON strings without a cryptographic HMAC signature or expiration verification. An attacker could forge token payloads to spoof merchant or customer identities.
* **Remediation:** Upgraded session token generation and verification to use **HMAC-SHA256** signed tokens with a configurable server secret (`SECRET_KEY`), strict signature comparison (`hmac.compare_digest`), and automatic expiration validation (`exp`).
* **Verification:** Tested in `test_tampered_token_rejection` and `test_expired_token_rejection`. Tampered and expired tokens are rejected with `401 Unauthorized`.

---

### Finding SEC-02: Overly Permissive Wildcard CORS with Credentials
* **Severity:** **HIGH**
* **Location:** `backend/app/main.py`
* **Vulnerability Description:** `CORSMiddleware` was configured with `allow_origins=["*"]` while setting `allow_credentials=True`. This violates CORS specifications and exposes authenticated sessions to cross-origin abuse.
* **Remediation:** Refactored CORS configuration to parse trusted frontend origins from the `CORS_ORIGINS` environment variable (defaulting to `http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173`).
* **Verification:** Verified via FastAPI middleware unit tests with explicit origin headers.

---

### Finding SEC-03: Unrestricted File Uploads & Path Traversal in Invoice OCR
* **Severity:** **MEDIUM**
* **Location:** `backend/app/api/invoices.py`
* **Vulnerability Description:** The invoice extraction endpoint accepted multipart uploads without validating file extensions, enforcing size limits, or sanitizing filenames against directory traversal.
* **Remediation:** 
  1. Enforced strict extension whitelist (`.jpg`, `.jpeg`, `.png`, `.pdf`, `.webp`).
  2. Enforced maximum file size cap of **5 MB**.
  3. Sanitized filenames using `os.path.basename` to prevent path traversal attempts.
* **Verification:** Tested in `test_invoice_upload_disallowed_extension` and `test_invoice_upload_path_traversal_sanitization`.

---

### Finding SEC-04: Working-Directory Relative Database Path Ambiguity
* **Severity:** **MEDIUM**
* **Location:** `backend/app/database.py`
* **Vulnerability Description:** `DATABASE_URL` defaulted to `sqlite:///./vyapar_brain.db`. When scripts or tests were executed from different working directories, an empty database was generated, causing unpredictable null reference exceptions.
* **Remediation:** Anchored the default SQLite database path to the canonical `backend/` directory using `os.path.abspath(__file__)`.
* **Verification:** Verified by executing test suites and migrations from both the project root and the `backend/` directory.

---

### Finding SEC-05: Customer Data Protection & Marketing Consent (DPDP Act 2023)
* **Severity:** **LOW / COMPLIANCE**
* **Location:** `backend/app/api/loyalty.py`, `backend/app/api/auth.py`
* **Vulnerability Description:** Re-engagement campaigns could potentially be queued without checking customer marketing preferences.
* **Remediation:** Integrated customer marketing consent checks (`allow_promotions`) and provided a customer-facing toggle in `CustomerProfile.tsx` and `/api/auth/customer/preferences`. All preference changes are recorded in the immutable `audit_logs` table.
* **Verification:** Verified in `test_dpdp_customer_preferences_update`.

---

## 3. Supply-Chain & Dependency Review
* **Frontend:** `npm audit` was executed and reported **0 vulnerabilities** across all 2,176 modules.
* **Backend:** `pip check` confirmed no broken dependencies or package conflicts across the pinned requirements in `backend/requirements.txt`.
