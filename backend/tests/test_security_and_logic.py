"""
Automated Security, Authentication, and Business Logic Unit Test Suite for Paytm Vyapar-Brain.
Executed via FastAPI TestClient (self-contained, no external server required).
"""

import os
import sys
import time
import base64
import json
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.seed import seed_database
from app.api.auth import create_demo_token, parse_demo_token, SECRET_KEY

# Ensure database tables and demo seed fixtures are initialized
seed_database()

client = TestClient(app)

def test_health_check():
    """Verify system health endpoint returns 200 OK."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_auth_login_and_hmac_signature():
    """Verify login issues a cryptographically signed HMAC token."""
    # Merchant login
    res = client.post("/api/auth/login", json={
        "email": "merchant@paytmkirana.com",
        "password": "demo123",
        "role": "merchant"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "merchant"
    token = data["access_token"]
    assert "." in token, "Token must be formatted as raw_payload.hmac_signature"

    # Profile retrieval with valid token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "merchant"

def test_tampered_token_rejection():
    """Security check: verify forged/tampered tokens are rejected with 401."""
    # Generate legitimate token
    valid_token = create_demo_token(1, "merchant", "merchant@paytmkirana.com")
    raw_payload, sig = valid_token.split(".", 1)

    # Tamper with payload (escalate to admin/another user)
    tampered_raw = base64.urlsafe_b64encode(json.dumps({
        "sub": 999,
        "role": "superadmin",
        "email": "hacker@evil.com"
    }).encode()).decode()

    # Reattach original signature
    forged_token = f"{tampered_raw}.{sig}"

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {forged_token}"})
    assert res.status_code == 401
    assert "Invalid token signature" in res.json()["detail"]

def test_expired_token_rejection():
    """Security check: verify expired tokens are rejected with 401."""
    expired_payload = {
        "sub": 1,
        "role": "merchant",
        "email": "merchant@paytmkirana.com",
        "exp": (datetime.utcnow() - timedelta(hours=1)).isoformat()
    }
    raw = base64.urlsafe_b64encode(json.dumps(expired_payload).encode()).decode()
    import hmac, hashlib
    sig = hmac.new(SECRET_KEY.encode(), raw.encode(), hashlib.sha256).hexdigest()
    expired_token = f"{raw}.{sig}"

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401
    assert "expired" in res.json()["detail"].lower()

def test_invoice_upload_disallowed_extension():
    """Security check: verify executable and disallowed file uploads are blocked."""
    fake_exe = b"MZ\x90\x00\x03\x00\x00\x00"
    files = {"file": ("malicious_payload.exe", fake_exe, "application/octet-stream")}
    res = client.post("/api/invoices/extract", files=files)
    assert res.status_code == 400
    assert "Invalid file type" in res.json()["detail"]

def test_invoice_upload_allowed_file():
    """Verify safe document formats (PDF/JPG) are processed cleanly."""
    fake_img = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00"
    files = {"file": ("mandi_receipt.jpg", fake_img, "image/jpeg")}
    res = client.post("/api/invoices/extract", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "mandi_receipt.jpg"
    assert len(data["items"]) > 0

def test_invoice_upload_path_traversal_sanitization():
    """Security check: verify path traversal sequences in filenames are sanitized."""
    fake_img = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00"
    files = {"file": ("../../../../etc/passwd.jpg", fake_img, "image/jpeg")}
    res = client.post("/api/invoices/extract", files=files)
    assert res.status_code == 200
    # Cleaned filename should be basename only
    assert res.json()["filename"] == "passwd.jpg"

def test_speak_ledger_financial_arithmetic():
    """Business logic check: verify cash inflow minus expenses equals net cash, and credit is separated."""
    res = client.post("/api/ledger/parse", json={
        "text": "Received 450 cash, Suresh took 200 on credit, paid 150 electricity"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["cash_total"] == 450.0
    assert data["credit_total"] == 200.0
    assert data["expense_total"] == 150.0
    assert data["net_cash"] == 300.0
    # Strict invariance: net cash MUST equal cash - expenses
    assert data["net_cash"] == data["cash_total"] - data["expense_total"]
    # Credit must NEVER be added to liquid cash
    assert data["net_cash"] != (data["cash_total"] + data["credit_total"] - data["expense_total"])

def test_dpdp_customer_preferences_update():
    """Privacy check: verify customer marketing consent can be updated and logged."""
    res = client.patch("/api/auth/customer/preferences?customer_id=1", json={
        "allow_promotions": False,
        "preferred_language": "te"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["allow_promotions"] is False
    assert data["preferred_language"] == "te"

def test_marketplace_compare_structure():
    """Marketplace check: verify multi-store price comparison returns products with accurate price metrics."""
    res = client.get("/api/marketplace/compare")
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)
    if items:
        first = items[0]
        assert "product_name" in first
        assert "lowest_price" in first
        assert "max_savings" in first
        assert "offers" in first

if __name__ == "__main__":
    tests = [
        test_health_check,
        test_auth_login_and_hmac_signature,
        test_tampered_token_rejection,
        test_expired_token_rejection,
        test_invoice_upload_disallowed_extension,
        test_invoice_upload_allowed_file,
        test_invoice_upload_path_traversal_sanitization,
        test_speak_ledger_financial_arithmetic,
        test_dpdp_customer_preferences_update,
        test_marketplace_compare_structure,
    ]
    passed = 0
    print("=" * 65)
    print("RUNNING AUTOMATED SECURITY & BUSINESS LOGIC TEST SUITE")
    print("=" * 65)
    for t in tests:
        try:
            t()
            print(f" PASS: {t.__name__}")
            passed += 1
        except Exception as e:
            print(f" FAIL: {t.__name__} - {e}")
            raise e
    print("=" * 65)
    print(f"ALL {passed}/{len(tests)} SECURITY & LOGIC TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)
