import os
import hmac
import hashlib
import base64
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.models import Merchant, Customer, AuditLog
from app.schemas.schemas import LoginRequest, AuthResponse, CustomerPreferencesUpdate

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "vyapar-brain-pilot-secure-key-2026")

# Cryptographically signed HMAC-SHA256 token generation
def create_demo_token(user_id: int, role: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "email": email,
        "exp": (datetime.utcnow() + timedelta(days=7)).isoformat()
    }
    raw_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    signature = hmac.new(SECRET_KEY.encode(), raw_payload.encode(), hashlib.sha256).hexdigest()
    return f"{raw_payload}.{signature}"

def parse_demo_token(token: str) -> dict:
    try:
        if "." in token:
            raw_payload, sig = token.split(".", 1)
            expected_sig = hmac.new(SECRET_KEY.encode(), raw_payload.encode(), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(sig, expected_sig):
                raise HTTPException(status_code=401, detail="Invalid token signature")
            data = json.loads(base64.urlsafe_b64decode(raw_payload.encode()).decode())
        else:
            # Backward-compatible fallback for older base64 tokens
            data = json.loads(base64.b64decode(token.encode()).decode())
        
        # Check token expiration
        if "exp" in data:
            exp_time = datetime.fromisoformat(data["exp"])
            if datetime.utcnow() > exp_time:
                raise HTTPException(status_code=401, detail="Session token has expired")
        return data
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")


@router.post("/login", response_model=AuthResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    role = creds.role.lower() if creds.role else "merchant"

    if role == "merchant":
        # Look up merchant by email or default demo
        merchant = db.query(Merchant).filter(
            (Merchant.email == creds.email) | (Merchant.phone == creds.email)
        ).first()

        # Fallback to Merchant 1 for demo
        if not merchant and creds.email in ["merchant@paytmkirana.com", "9876543210", "admin"]:
            merchant = db.query(Merchant).filter(Merchant.id == 1).first()

        if not merchant:
            # Default to store #1 for smooth hackathon demo
            merchant = db.query(Merchant).first()

        if not merchant:
            raise HTTPException(status_code=404, detail="No merchant record found in database")

        token = create_demo_token(merchant.id, "merchant", merchant.email or "merchant@paytmkirana.com")

        # Audit log
        db.add(AuditLog(
            actor_type="merchant",
            actor_id=merchant.id,
            action="login_success",
            details=f"Merchant {merchant.name} logged in successfully",
            result="success"
        ))
        db.commit()

        return AuthResponse(
            access_token=token,
            token_type="bearer",
            user_id=merchant.id,
            name=merchant.name,
            role="merchant",
            store_name=merchant.name,
            email=merchant.email or "merchant@paytmkirana.com"
        )
    else:
        # Customer login
        customer = db.query(Customer).filter(
            (Customer.email == creds.email) | (Customer.phone == creds.email)
        ).first()

        if not customer:
            customer = db.query(Customer).first()

        token = create_demo_token(customer.id, "customer", customer.email or "customer@paytmshopper.com")

        # Audit log
        db.add(AuditLog(
            actor_type="customer",
            actor_id=customer.id,
            action="login_success",
            details=f"Customer {customer.name} logged in successfully",
            result="success"
        ))
        db.commit()

        return AuthResponse(
            access_token=token,
            token_type="bearer",
            user_id=customer.id,
            name=customer.name,
            role="customer",
            email=customer.email or "customer@paytmshopper.com"
        )


@router.get("/me")
def get_current_user_profile(
    authorization: Optional[str] = Header(None),
    role: Optional[str] = "merchant",
    db: Session = Depends(get_db)
):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        data = parse_demo_token(token)
        user_id = data.get("sub")
        role = data.get("role", "merchant")
    else:
        user_id = 1

    if role == "merchant":
        m = db.query(Merchant).filter(Merchant.id == user_id).first()
        if not m:
            raise HTTPException(status_code=404, detail="Merchant not found")
        return {
            "id": m.id,
            "name": m.name,
            "role": "merchant",
            "store_name": m.name,
            "neighborhood": m.neighborhood,
            "email": m.email,
            "phone": m.phone
        }
    else:
        c = db.query(Customer).filter(Customer.id == user_id).first()
        if not c:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {
            "id": c.id,
            "name": c.name,
            "role": "customer",
            "neighborhood": c.neighborhood,
            "email": c.email,
            "phone": c.phone,
            "allow_promotions": c.allow_promotions,
            "preferred_language": c.preferred_language
        }


@router.patch("/customer/preferences")
def update_customer_preferences(
    prefs: CustomerPreferencesUpdate,
    customer_id: int = 1,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if prefs.allow_promotions is not None:
        customer.allow_promotions = prefs.allow_promotions
    if prefs.preferred_language is not None:
        customer.preferred_language = prefs.preferred_language

    db.add(AuditLog(
        actor_type="customer",
        actor_id=customer.id,
        action="preferences_updated",
        details=f"Updated preferences: allow_promotions={customer.allow_promotions}, preferred_language={customer.preferred_language}",
        result="success"
    ))
    db.commit()
    db.refresh(customer)
    return {
        "message": "Preferences updated successfully",
        "allow_promotions": customer.allow_promotions,
        "preferred_language": customer.preferred_language
    }
