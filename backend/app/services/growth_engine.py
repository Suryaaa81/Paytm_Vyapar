"""
Vyapar-Brain AI Growth & Intelligence Engine
Analyzes merchant data (sales, bookings, inventory, customer loyalty, group thresholds)
and generates deterministic, transparent, and actionable business growth recommendations.
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.models import BulkOffer, Booking, LoyaltyActivity, Customer, Transaction, Merchant
from app.api.loyalty import compute_loyalty


def generate_growth_insights(merchant_id: int, db: Session) -> List[Dict[str, Any]]:
    insights = []
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    store_name = merchant.name if merchant else "Sri Vinayaka Kirana Store"

    # 1. Fetch active offers & stock
    offers = db.query(BulkOffer).filter(
        BulkOffer.merchant_id == merchant_id,
        BulkOffer.status == "active"
    ).all()

    # 2. Fetch bookings
    bookings = db.query(Booking).filter(Booking.merchant_id == merchant_id).all()

    # 3. Fetch loyalty
    activities = db.query(LoyaltyActivity).filter(LoyaltyActivity.merchant_id == merchant_id).all()
    customer_map = {}
    for a in activities:
        if a.customer_id not in customer_map:
            customer_map[a.customer_id] = []
        customer_map[a.customer_id].append(a)

    # ──────────────────────────────────────────────────────────────────────────
    # INSIGHT 1: Group-Buying Opportunity (Threshold >= 70%)
    # ──────────────────────────────────────────────────────────────────────────
    for o in offers:
        booked = o.booked_quantity or 0
        min_qty = o.minimum_quantity or 1
        pct = (booked / min_qty) * 100
        pname = o.product.name if o.product else "Bulk Product"

        if 60 <= pct < 100:
            remaining = min_qty - booked
            insights.append({
                "id": f"group_opp_{o.id}",
                "category": "group_buying",
                "priority": "high",
                "title": f"Group Threshold Opportunity: {pname}",
                "observation": f"Offer has reached {booked}/{min_qty} ({pct:.0f}%) of its minimum group goal.",
                "supporting_data": {
                    "product": pname,
                    "booked_quantity": booked,
                    "minimum_quantity": min_qty,
                    "remaining_needed": remaining,
                    "bulk_price": o.bulk_price,
                    "available_stock": o.available_stock
                },
                "why_it_matters": f"Only {remaining} more units needed to unlock this bulk deal for the entire neighborhood group and trigger merchant confirmation.",
                "recommended_action": f"Publish a neighborhood notice or alert nearby shoppers to reserve the remaining {remaining} {o.product.unit or 'units'}.",
                "expected_benefit": f"Unlocks approximately ₹{remaining * o.bulk_price:,.0f} in additional verified group booking value.",
                "action_type": "promote_offer",
                "action_payload": {"offer_id": o.id, "product_name": pname, "remaining": remaining}
            })

    # ──────────────────────────────────────────────────────────────────────────
    # INSIGHT 2: Customer Retention / At-Risk Lapse Detection
    # ──────────────────────────────────────────────────────────────────────────
    at_risk_customers = []
    for cid, acts in customer_map.items():
        cust = db.query(Customer).filter(Customer.id == cid).first()
        if cust:
            res = compute_loyalty(acts, cust)
            if res and res.get("is_at_risk"):
                at_risk_customers.append(res)

    if at_risk_customers:
        top_cust = at_risk_customers[0]
        insights.append({
            "id": f"retention_lapse_{top_cust['customer_id']}",
            "category": "customer_retention",
            "priority": "high",
            "title": f"At-Risk Customer Alert: {top_cust['customer_name']}",
            "observation": f"Customer visited {top_cust['days_since_last_visit']:.0f} days ago, exceeding 1.5x their usual {top_cust['avg_interval_days']:.0f}-day visit frequency.",
            "supporting_data": {
                "customer_name": top_cust["customer_name"],
                "customer_id": top_cust["customer_id"],
                "days_since_last_visit": top_cust["days_since_last_visit"],
                "avg_interval_days": top_cust["avg_interval_days"],
                "historical_purchases": top_cust["total_purchases"]
            },
            "why_it_matters": "Proactive outreach to lapsed neighborhood shoppers retains repeat footfall and preserves Kirana loyalty before churn occurs.",
            "recommended_action": f"Send a polite, personalized Telugu or Hindi re-engagement invitation with current bulk offers.",
            "expected_benefit": f"Potentially recovers a repeat customer with ₹{top_cust['total_purchases']:,.0f} in previous spend.",
            "action_type": "draft_campaign",
            "action_payload": {"customer_id": top_cust["customer_id"], "customer_name": top_cust["customer_name"]}
        })

    # ──────────────────────────────────────────────────────────────────────────
    # INSIGHT 3: Slow-Moving Stock vs High Available Inventory
    # ──────────────────────────────────────────────────────────────────────────
    for o in offers:
        booked = o.booked_quantity or 0
        stock = o.available_stock or 0
        pname = o.product.name if o.product else "Bulk Product"

        if stock >= 15 and booked <= 2:
            insights.append({
                "id": f"slow_stock_{o.id}",
                "category": "inventory",
                "priority": "medium",
                "title": f"High Inventory Movement Notice: {pname}",
                "observation": f"{stock} units in stock with only {booked} units booked so far.",
                "supporting_data": {
                    "product": pname,
                    "available_stock": stock,
                    "booked_quantity": booked,
                    "bulk_price": o.bulk_price,
                    "retail_price": o.retail_price
                },
                "why_it_matters": "Inventory tied up in wholesale bags reduces store cash liquidity. Highlighting bulk discounts accelerates stock turn.",
                "recommended_action": f"Feature this deal in the neighborhood feed with store pickup incentives or adjust minimum quantity to 3.",
                "expected_benefit": f"Could liberate up to ₹{stock * o.bulk_price:,.0f} in working capital into cash flow.",
                "action_type": "adjust_offer",
                "action_payload": {"offer_id": o.id, "suggested_min_qty": 3}
            })
            break  # One slow-moving insight is enough for clarity

    # ──────────────────────────────────────────────────────────────────────────
    # INSIGHT 4: Fast-Moving / High-Demand Product
    # ──────────────────────────────────────────────────────────────────────────
    for o in offers:
        booked = o.booked_quantity or 0
        stock = o.available_stock or 0
        pname = o.product.name if o.product else "Bulk Product"

        if booked >= 5 and stock > 0:
            insights.append({
                "id": f"high_demand_{o.id}",
                "category": "sales_growth",
                "priority": "medium",
                "title": f"High Demand Product: {pname}",
                "observation": f"{booked} units successfully booked with {stock} units left in stock.",
                "supporting_data": {
                    "product": pname,
                    "booked_quantity": booked,
                    "available_stock": stock,
                    "booking_value": booked * o.bulk_price
                },
                "why_it_matters": "Demonstrates strong neighborhood appetite for wholesale staples at current merchant bulk rate.",
                "recommended_action": "Check distributor purchase invoices to reorder stock early before reaching zero stock.",
                "expected_benefit": "Guarantees fulfillment continuity and builds customer trust in group reliability.",
                "action_type": "restock_distributor",
                "action_payload": {"product_name": pname}
            })
            break

    # ──────────────────────────────────────────────────────────────────────────
    # INSIGHT 5: Cash vs Credit Ledger Health
    # ──────────────────────────────────────────────────────────────────────────
    txns = db.query(Transaction).filter(Transaction.merchant_id == merchant_id).all()
    if txns:
        cash = sum(t.amount for t in txns if t.transaction_type == "cash_sale")
        credit = sum(t.amount for t in txns if t.transaction_type == "credit_sale")
        expense = sum(t.amount for t in txns if t.transaction_type == "expense")
        if credit > 0:
            insights.append({
                "id": "ledger_credit_health",
                "category": "ledger",
                "priority": "low",
                "title": "Ledger Working Capital Breakdown",
                "observation": f"Store has ₹{credit:,.0f} in pending credit receivables and ₹{cash:,.0f} in cash sales.",
                "supporting_data": {
                    "cash_sales": cash,
                    "credit_receivables": credit,
                    "expenses": expense,
                    "net_cash": cash - expense
                },
                "why_it_matters": "Credit sales remain receivables and must not be counted as cash balance. Keeping cash positive protects daily supplier payouts.",
                "recommended_action": "Use the Speak Ledger feature to record customer collections and track settlements.",
                "expected_benefit": f"Helps maintain net cash movement of ₹{cash - expense:,.0f} without working capital deficits.",
                "action_type": "open_ledger",
                "action_payload": {}
            })

    return insights
