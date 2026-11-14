"""Loyalty service helpers."""
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from app.models.models import LoyaltyActivity, Customer


def get_customer_loyalty_data(db: Session, customer_id: int, merchant_id: int):
    activities = db.query(LoyaltyActivity).filter(
        LoyaltyActivity.customer_id == customer_id,
        LoyaltyActivity.merchant_id == merchant_id,
    ).order_by(LoyaltyActivity.visit_date.desc()).all()

    if not activities:
        return None

    dates = [a.visit_date for a in activities]
    days_since_last = (datetime.utcnow() - dates[0]).total_seconds() / 86400

    avg_interval = None
    if len(dates) >= 2:
        intervals = [(dates[i] - dates[i + 1]).total_seconds() / 86400 for i in range(len(dates) - 1)]
        avg_interval = sum(intervals) / len(intervals)

    is_at_risk = avg_interval and days_since_last > 1.5 * avg_interval

    return {
        "customer_id": customer_id,
        "total_visits": len(activities),
        "total_purchases": sum(a.purchase_amount or 0 for a in activities),
        "days_since_last_visit": round(days_since_last, 1),
        "avg_interval_days": round(avg_interval, 1) if avg_interval else None,
        "is_at_risk": bool(is_at_risk),
        "loyalty_status": "Potentially Inactive" if is_at_risk else "Active",
    }
