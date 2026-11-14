from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Booking, BulkOffer, Transaction, LoyaltyActivity, Customer
from app.schemas.schemas import AssistantQuery, AssistantResponse
from datetime import datetime

router = APIRouter()


def get_at_risk_customers(merchant_id: int, db: Session):
    from app.api.loyalty import compute_loyalty
    activities_all = db.query(LoyaltyActivity).filter(
        LoyaltyActivity.merchant_id == merchant_id
    ).all()
    customer_map = {}
    for a in activities_all:
        if a.customer_id not in customer_map:
            customer_map[a.customer_id] = []
        customer_map[a.customer_id].append(a)

    at_risk = []
    for cid, acts in customer_map.items():
        customer = db.query(Customer).filter(Customer.id == cid).first()
        if customer:
            data = compute_loyalty(acts, customer)
            if data and data["is_at_risk"]:
                at_risk.append(data)
    return at_risk


@router.post("/query", response_model=AssistantResponse)
def assistant_query(data: AssistantQuery, db: Session = Depends(get_db)):
    q = data.query.lower()
    merchant_id = data.merchant_id

    try:
        # Pending bookings / booking status
        if any(kw in q for kw in ["pending", "booking"]):
            bookings = db.query(Booking).filter(
                Booking.merchant_id == merchant_id,
                Booking.status == "pending"
            ).all()
            count = len(bookings)
            items = [
                {
                    "id": b.id,
                    "reference": b.booking_reference,
                    "customer": b.customer.name if b.customer else "Unknown",
                    "quantity": b.quantity,
                    "total": b.total_amount,
                    "status": b.status,
                }
                for b in bookings
            ]
            answer = f"You have {count} pending booking(s) awaiting confirmation."
            return AssistantResponse(answer=answer, data={"count": count, "bookings": items})

        # Loyalty / at-risk customers
        elif any(kw in q for kw in ["inactive", "at risk", "loyalty", "customer"]):
            at_risk = get_at_risk_customers(merchant_id, db)
            count = len(at_risk)
            answer = f"There are {count} customer(s) potentially going inactive." if count else "All customers appear active!"
            return AssistantResponse(answer=answer, data={"count": count, "at_risk_customers": at_risk})

        # Stock / inventory
        elif any(kw in q for kw in ["stock", "low", "inventory"]):
            low = db.query(BulkOffer).filter(
                BulkOffer.merchant_id == merchant_id,
                BulkOffer.available_stock < 5,
                BulkOffer.status == "active"
            ).all()
            items = [
                {"offer_id": o.id, "product": o.product.name if o.product else "?", "stock": o.available_stock}
                for o in low
            ]
            count = len(items)
            answer = f"You have {count} offer(s) with low stock (less than 5 units)." if count else "No low stock alerts!"
            return AssistantResponse(answer=answer, data={"count": count, "low_stock": items})

        # Sales / revenue / summary
        elif any(kw in q for kw in ["sales", "revenue", "summary"]):
            txns = db.query(Transaction).filter(Transaction.merchant_id == merchant_id).all()
            cash = sum(t.amount for t in txns if t.transaction_type == "cash_sale")
            credit = sum(t.amount for t in txns if t.transaction_type == "credit_sale")
            expense = sum(t.amount for t in txns if t.transaction_type == "expense")
            net = cash - expense
            answer = f"Cash sales: ₹{cash:.0f} | Credit sales: ₹{credit:.0f} | Expenses: ₹{expense:.0f} | Net cash: ₹{net:.0f}"
            return AssistantResponse(answer=answer, data={
                "total_cash_sales": cash,
                "total_credit_sales": credit,
                "total_expenses": expense,
                "net_cash": net,
            })

        # Active offers
        elif any(kw in q for kw in ["offer", "active"]):
            offers = db.query(BulkOffer).filter(
                BulkOffer.merchant_id == merchant_id,
                BulkOffer.status == "active"
            ).all()
            items = [
                {"id": o.id, "product": o.product.name if o.product else "?",
                 "stock": o.available_stock, "bulk_price": o.bulk_price}
                for o in offers
            ]
            count = len(items)
            answer = f"You have {count} active offer(s) on the marketplace."
            return AssistantResponse(answer=answer, data={"count": count, "offers": items})

        # Fallback
        else:
            return AssistantResponse(
                answer=(
                    "I can help you with: pending bookings, loyalty & at-risk customers, "
                    "low stock alerts, sales summary, and active offers. "
                    "Try asking: 'Show pending bookings' or 'Who is at risk?'"
                ),
                data=None,
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
