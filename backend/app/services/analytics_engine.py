"""
Business Analytics & Impact Engine
Calculates true database metrics: Booked Value, Confirmed Value, Fulfilled Sales,
Customer Savings, Booking Status Breakdown, and Product-Wise Breakdown.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Booking, BulkOffer, Merchant, Customer, Transaction


def calculate_business_analytics(merchant_id: int, db: Session) -> Dict[str, Any]:
    bookings = db.query(Booking).filter(Booking.merchant_id == merchant_id).all()
    offers = db.query(BulkOffer).filter(BulkOffer.merchant_id == merchant_id).all()
    txns = db.query(Transaction).filter(Transaction.merchant_id == merchant_id).all()

    # 1. Booking Status Breakdown
    booked_value = sum(b.total_amount for b in bookings if b.status != "cancelled")
    confirmed_value = sum(b.total_amount for b in bookings if b.status in ["confirmed", "ready_for_pickup", "fulfilled"])
    fulfilled_value = sum(b.total_amount for b in bookings if b.status == "fulfilled")
    pending_value = sum(b.total_amount for b in bookings if b.status == "pending")

    status_counts = {
        "pending": len([b for b in bookings if b.status == "pending"]),
        "confirmed": len([b for b in bookings if b.status == "confirmed"]),
        "ready_for_pickup": len([b for b in bookings if b.status == "ready_for_pickup"]),
        "fulfilled": len([b for b in bookings if b.status == "fulfilled"]),
        "cancelled": len([b for b in bookings if b.status == "cancelled"]),
    }

    # 2. Customer Savings Calculated on Valid Bookings
    customer_savings_total = 0.0
    for b in bookings:
        if b.status != "cancelled" and b.offer:
            retail = b.offer.retail_price or b.unit_price_at_booking
            saving_per_unit = max(0.0, retail - b.unit_price_at_booking)
            customer_savings_total += saving_per_unit * b.quantity

    # 3. Product-wise distribution
    product_stats = {}
    for b in bookings:
        if b.status != "cancelled" and b.offer and b.offer.product:
            pname = b.offer.product.name
            if pname not in product_stats:
                product_stats[pname] = {
                    "product_name": pname,
                    "quantity_booked": 0,
                    "booking_value": 0.0,
                    "orders_count": 0
                }
            product_stats[pname]["quantity_booked"] += b.quantity
            product_stats[pname]["booking_value"] += b.total_amount
            product_stats[pname]["orders_count"] += 1

    # 4. Cash movement from ledger
    cash_sales = sum(t.amount for t in txns if t.transaction_type == "cash_sale")
    credit_sales = sum(t.amount for t in txns if t.transaction_type == "credit_sale")
    expenses = sum(t.amount for t in txns if t.transaction_type == "expense")
    net_cash = cash_sales - expenses

    # 5. Conversion & Threshold Stats
    offers_completed_threshold = len([o for o in offers if (o.booked_quantity or 0) >= (o.minimum_quantity or 1)])

    return {
        "financial_summary": {
            "total_booked_value": booked_value,
            "confirmed_value": confirmed_value,
            "fulfilled_sales_value": fulfilled_value,
            "pending_value": pending_value,
            "customer_savings": customer_savings_total,
            "cash_sales_ledger": cash_sales,
            "credit_sales_ledger": credit_sales,
            "expenses_ledger": expenses,
            "net_cash_movement": net_cash
        },
        "booking_status_counts": status_counts,
        "product_performance": list(product_stats.values()),
        "threshold_stats": {
            "total_offers": len(offers),
            "offers_completed_threshold": offers_completed_threshold,
            "completion_rate_pct": round((offers_completed_threshold / len(offers) * 100), 1) if offers else 0.0
        }
    }


def calculate_marketplace_impact(db: Session) -> Dict[str, Any]:
    all_bookings = db.query(Booking).all()
    all_offers = db.query(BulkOffer).all()
    all_merchants = db.query(Merchant).all()
    all_customers = db.query(Customer).all()

    total_booking_val = sum(b.total_amount for b in all_bookings if b.status != "cancelled")
    fulfilled_val = sum(b.total_amount for b in all_bookings if b.status == "fulfilled")
    total_qty = sum(b.quantity for b in all_bookings if b.status != "cancelled")

    total_savings = 0.0
    for b in all_bookings:
        if b.status != "cancelled" and b.offer:
            retail = b.offer.retail_price or b.unit_price_at_booking
            saving_per_unit = max(0.0, retail - b.unit_price_at_booking)
            total_savings += saving_per_unit * b.quantity

    threshold_reached = len([o for o in all_offers if (o.booked_quantity or 0) >= (o.minimum_quantity or 1)])

    return {
        "merchant_impact": {
            "total_merchants": len(all_merchants),
            "total_booking_value": total_booking_val,
            "fulfilled_sales_value": fulfilled_val,
            "total_quantity_booked": total_qty,
            "customers_reached": len(set(b.customer_id for b in all_bookings)),
        },
        "customer_impact": {
            "total_savings": total_savings,
            "total_reservations": len(all_bookings),
            "unique_customers": len(all_customers),
            "avg_savings_per_booking": round(total_savings / len(all_bookings), 1) if all_bookings else 0.0
        },
        "marketplace_impact": {
            "published_offers": len(all_offers),
            "active_offers": len([o for o in all_offers if o.status == "active"]),
            "threshold_completion_rate_pct": round((threshold_reached / len(all_offers) * 100), 1) if all_offers else 0.0
        }
    }
