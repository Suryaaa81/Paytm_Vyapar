from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.models import LoyaltyActivity, Customer, CampaignDraft, Merchant, AuditLog
from app.schemas.schemas import CampaignDraftCreate

router = APIRouter()

CAMPAIGN_TEMPLATES = {
    "english": "Hello {name}! Sri Vinayaka Kirana misses you. Special bulk deal on Sona Masoori Rice & Toor Dal this week! Stop by or reserve your bag today. 🛍️",
    "telugu": "నమస్తే {name} గారు! శ్రీ వినాయక కిరాణా స్టోర్ మిమ్మల్ని మిస్ అవుతోంది. సోనా మసూరి బియ్యం & కందిపప్పుపై ప్రత్యేక బల్క్ ఆఫర్ నడుస్తోంది. ఈరోజే విచ్చేయండి! 🛍️",
    "hindi": "नमस्ते {name} जी! श्री विनायक किराना स्टोर में आपको याद किया जा रहा है। सोना मसूरी चावल और तुअर दाल पर इस सप्ताह विशेष बल्क छूट उपलब्ध है! 🛍️",
}


def classify_customer(activities: List[LoyaltyActivity], customer: Customer) -> dict:
    if not activities:
        return {
            "customer_id": customer.id,
            "customer_name": customer.name,
            "customer_phone": customer.phone,
            "customer_email": customer.email,
            "allow_promotions": customer.allow_promotions,
            "preferred_language": customer.preferred_language or "en",
            "total_visits": 0,
            "total_purchases": 0.0,
            "days_since_last_visit": 999,
            "avg_interval_days": 0,
            "segment": "New Customer",
            "loyalty_status": "New",
            "is_at_risk": False,
            "last_visit_date": None,
            "risk_evidence": "Insufficient historical visits to detect lapse pattern."
        }

    dates = sorted([a.visit_date for a in activities], reverse=True)
    total_purchases = round(sum(a.purchase_amount or 0 for a in activities), 2)
    visit_count = len(activities)

    last_visit = dates[0]
    days_since_last = round((datetime.utcnow() - last_visit).total_seconds() / 86400, 1)

    avg_interval = None
    if len(dates) >= 2:
        intervals = [(dates[i] - dates[i + 1]).total_seconds() / 86400 for i in range(len(dates) - 1)]
        avg_interval = round(sum(intervals) / len(intervals), 1)

    is_at_risk = False
    evidence = "Purchase patterns are normal."
    if avg_interval and avg_interval > 0:
        if days_since_last > 1.5 * avg_interval:
            is_at_risk = True
            evidence = f"Customer usually visits every {avg_interval} days, but last visit was {days_since_last} days ago ({round(days_since_last / avg_interval, 1)}x usual interval)."

    # Segment classification
    if total_purchases >= 5000 or visit_count >= 10:
        segment = "High-Value Repeat Customer"
    elif is_at_risk and days_since_last <= 30:
        segment = "Potentially Inactive"
    elif days_since_last > 30:
        segment = "Recently Inactive"
    elif visit_count >= 4 and avg_interval and days_since_last <= avg_interval * 1.2:
        segment = "Regular Customer"
    else:
        segment = "Active Customer"

    return {
        "customer_id": customer.id,
        "customer_name": customer.name,
        "customer_phone": customer.phone,
        "customer_email": customer.email,
        "allow_promotions": customer.allow_promotions,
        "preferred_language": customer.preferred_language or "en",
        "total_visits": visit_count,
        "total_purchases": total_purchases,
        "days_since_last_visit": days_since_last,
        "avg_interval_days": avg_interval,
        "is_at_risk": is_at_risk,
        "segment": segment,
        "loyalty_status": segment,
        "last_visit_date": last_visit,
        "risk_evidence": evidence,
        "recommended_action": f"Send polite personalized {customer.preferred_language or 'Telugu/Hindi'} re-engagement with current store bulk rates." if is_at_risk else "Maintain regular store service."
    }

compute_loyalty = classify_customer


@router.get("/customers")
def get_loyalty_customers(
    merchant_id: int = Query(...),
    segment: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        activities_all = db.query(LoyaltyActivity).filter(
            LoyaltyActivity.merchant_id == merchant_id
        ).all()

        customer_map = {}
        for a in activities_all:
            if a.customer_id not in customer_map:
                customer_map[a.customer_id] = []
            customer_map[a.customer_id].append(a)

        result = []
        for cid, acts in customer_map.items():
            customer = db.query(Customer).filter(Customer.id == cid).first()
            if customer:
                data = classify_customer(acts, customer)
                if not segment or segment.lower() == "all" or data["segment"].lower() == segment.lower():
                    result.append(data)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/at-risk")
def get_at_risk_customers(merchant_id: int = Query(...), db: Session = Depends(get_db)):
    try:
        activities_all = db.query(LoyaltyActivity).filter(
            LoyaltyActivity.merchant_id == merchant_id
        ).all()

        customer_map = {}
        for a in activities_all:
            if a.customer_id not in customer_map:
                customer_map[a.customer_id] = []
            customer_map[a.customer_id].append(a)

        result = []
        for cid, acts in customer_map.items():
            customer = db.query(Customer).filter(Customer.id == cid).first()
            if customer:
                data = classify_customer(acts, customer)
                if data and data["is_at_risk"]:
                    result.append(data)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/campaign-draft")
def create_campaign_draft(data: CampaignDraftCreate, db: Session = Depends(get_db)):
    try:
        customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Consent & opt-out check
        if not customer.allow_promotions:
            raise HTTPException(
                status_code=400,
                detail=f"Customer {customer.name} has opted out of promotional communications. Respect customer privacy preferences."
            )

        merchant = db.query(Merchant).filter(Merchant.id == data.merchant_id).first()
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")

        message = data.message
        lang = (data.language or customer.preferred_language or "english").lower()
        if not message:
            template = CAMPAIGN_TEMPLATES.get(lang, CAMPAIGN_TEMPLATES["english"])
            message = template.format(name=customer.name, store_name=merchant.name)

        draft = CampaignDraft(
            merchant_id=data.merchant_id,
            customer_id=data.customer_id,
            language=lang,
            message_text=message,
            status="draft",
        )
        db.add(draft)
        db.flush()

        audit = AuditLog(
            actor_type="merchant",
            actor_id=data.merchant_id,
            action="campaign_drafted",
            target_type="campaign",
            target_id=draft.id,
            details=f"Drafted {lang} re-engagement campaign for customer #{customer.id} ({customer.name})",
            result="success"
        )
        db.add(audit)

        db.commit()
        db.refresh(draft)
        return {
            "id": draft.id,
            "merchant_id": draft.merchant_id,
            "customer_id": draft.customer_id,
            "customer_name": customer.name,
            "language": draft.language,
            "message_text": draft.message_text,
            "status": draft.status,
            "created_at": draft.created_at
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


class CampaignStatusUpdate(BaseModel):
    status: str  # 'approved', 'simulated_sent', 'cancelled'


@router.patch("/campaign-draft/{draft_id}/status")
def update_campaign_status(draft_id: int, body: CampaignStatusUpdate, db: Session = Depends(get_db)):
    draft = db.query(CampaignDraft).filter(CampaignDraft.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Campaign draft not found")

    allowed = ["draft", "pending_approval", "approved", "simulated_sent", "cancelled"]
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status '{body.status}'. Allowed: {allowed}")

    draft.status = body.status

    audit = AuditLog(
        actor_type="merchant",
        actor_id=draft.merchant_id,
        action=f"campaign_{body.status}",
        target_type="campaign",
        target_id=draft.id,
        details=f"Campaign draft #{draft.id} status updated to {body.status}",
        result="success"
    )
    db.add(audit)

    db.commit()
    db.refresh(draft)
    return {
        "id": draft.id,
        "status": draft.status,
        "message": f"Campaign successfully {body.status.replace('_', ' ')} (Simulated delivery for hackathon prototype)"
    }


@router.get("/campaigns")
def list_campaigns(merchant_id: int = Query(...), db: Session = Depends(get_db)):
    drafts = db.query(CampaignDraft).filter(
        CampaignDraft.merchant_id == merchant_id
    ).order_by(CampaignDraft.created_at.desc()).all()

    return [
        {
            "id": d.id,
            "customer_id": d.customer_id,
            "customer_name": d.customer.name if d.customer else "Shopper",
            "language": d.language,
            "message_text": d.message_text,
            "status": d.status,
            "created_at": d.created_at
        } for d in drafts
    ]
