import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Booking, BulkOffer, Customer, Notification, AuditLog
from app.schemas.schemas import BookingCreate, BookingOut, BookingStatusUpdate

router = APIRouter()

VALID_TRANSITIONS = {
    "pending": ["confirmed", "rejected", "cancelled"],
    "confirmed": ["ready_for_pickup", "cancelled"],
    "ready_for_pickup": ["fulfilled", "cancelled"],
    "fulfilled": [],  # Terminal: Cannot be cancelled
    "rejected": [],   # Terminal
    "cancelled": [],  # Terminal
    "expired": [],    # Terminal
}


def generate_booking_ref():
    yr = datetime.utcnow().year
    digits = ''.join(random.choices(string.digits, k=4))
    return f"BK-{yr}-{digits}"


def booking_to_out(b: Booking) -> BookingOut:
    return BookingOut(
        id=b.id,
        booking_reference=b.booking_reference,
        customer_id=b.customer_id,
        merchant_id=b.merchant_id,
        offer_id=b.offer_id,
        quantity=b.quantity,
        unit_price_at_booking=b.unit_price_at_booking,
        total_amount=b.total_amount,
        status=b.status,
        notes=b.notes,
        created_at=b.created_at,
        customer_name=b.customer.name if b.customer else None,
        offer_name=b.offer.product.name if b.offer and b.offer.product else None,
    )


@router.post("/", response_model=BookingOut)
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    # 1. Validate customer
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # 2. Validate offer with atomic lock
    offer = db.query(BulkOffer).with_for_update().filter(BulkOffer.id == data.offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer.status != "active":
        raise HTTPException(status_code=400, detail=f"Offer is not active (current status: {offer.status})")

    # 3. Validate offer expiry
    now = datetime.utcnow()
    if offer.validity_end and offer.validity_end < now:
        offer.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="This bulk offer has expired and can no longer be booked.")

    # 4. Validate quantity
    if data.quantity < 1:
        raise HTTPException(status_code=400, detail="Booking quantity must be at least 1 unit")
    if offer.available_stock < data.quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient stock. Available: {offer.available_stock} {offer.product.unit if offer.product else 'units'}")

    try:
        total = round(data.quantity * offer.bulk_price, 2)

        booking = Booking(
            booking_reference=generate_booking_ref(),
            customer_id=data.customer_id,
            merchant_id=offer.merchant_id,
            offer_id=data.offer_id,
            quantity=data.quantity,
            unit_price_at_booking=offer.bulk_price,
            total_amount=total,
            status="pending",
            notes=data.notes,
        )
        db.add(booking)

        # Atomic stock deduction and reservation
        offer.available_stock -= data.quantity
        offer.booked_quantity += data.quantity

        db.flush()

        # In-app notification for Merchant
        notif_merchant = Notification(
            merchant_id=offer.merchant_id,
            type="new_booking",
            title="New bulk booking received",
            message=f"Booking {booking.booking_reference} received from {customer.name} for {data.quantity} units of {offer.product.name if offer.product else 'grocery'}.",
            is_read=False,
            related_id=booking.id,
        )
        db.add(notif_merchant)

        # In-app notification for Customer
        notif_customer = Notification(
            merchant_id=offer.merchant_id,
            customer_id=customer.id,
            type="booking_created",
            title="Bulk order reservation placed",
            message=f"Your booking {booking.booking_reference} for {data.quantity} units has been placed with {offer.merchant.name if offer.merchant else 'the merchant'}.",
            is_read=False,
            related_id=booking.id,
        )
        db.add(notif_customer)

        # Threshold notification if minimum bulk target reached
        if offer.booked_quantity >= offer.minimum_quantity:
            notif_thresh = Notification(
                merchant_id=offer.merchant_id,
                type="min_qty_reached",
                title="Minimum group quantity reached! 🎉",
                message=f"Threshold reached for {offer.product.name if offer.product else 'bulk offer'} ({offer.booked_quantity}/{offer.minimum_quantity} units). Ready to confirm fulfilment!",
                is_read=False,
                related_id=offer.id,
            )
            db.add(notif_thresh)

        # Audit log entry
        audit = AuditLog(
            actor_type="customer",
            actor_id=customer.id,
            action="booking_created",
            target_type="booking",
            target_id=booking.id,
            details=f"Booked {data.quantity} units of offer #{offer.id} at ₹{offer.bulk_price}/unit. Total: ₹{total}",
            result="success"
        )
        db.add(audit)

        db.commit()
        db.refresh(booking)
        return booking_to_out(booking)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def list_bookings(
    merchant_id: Optional[int] = Query(None),
    customer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        q = db.query(Booking)
        if merchant_id:
            q = q.filter(Booking.merchant_id == merchant_id)
        if customer_id:
            q = q.filter(Booking.customer_id == customer_id)
        bookings = q.order_by(Booking.created_at.desc()).all()
        return [booking_to_out(b) for b in bookings]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking_to_out(b)


@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(booking_id: int, data: BookingStatusUpdate, db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    allowed = VALID_TRANSITIONS.get(b.status, [])
    if data.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition booking status from '{b.status}' to '{data.status}'. Allowed transitions: {allowed}"
        )

    try:
        # If rejected or cancelled, restore reserved stock to the merchant's available stock
        if data.status in ["cancelled", "rejected"]:
            offer = db.query(BulkOffer).with_for_update().filter(BulkOffer.id == b.offer_id).first()
            if offer:
                offer.available_stock += b.quantity
                offer.booked_quantity = max(0, offer.booked_quantity - b.quantity)

        # Notify Customer on status update
        notif_msg = f"Your booking {b.booking_reference} status has been updated to '{data.status}' by {b.merchant.name if b.merchant else 'the merchant'}."
        if data.status == "confirmed":
            notif_msg = f"Great news! Your booking {b.booking_reference} was confirmed by {b.merchant.name if b.merchant else 'the store'}."
        elif data.status == "ready_for_pickup":
            notif_msg = f"Your order {b.booking_reference} is packed and ready for pickup at {b.merchant.name if b.merchant else 'the store'}!"
        elif data.status == "fulfilled":
            notif_msg = f"Your order {b.booking_reference} has been fulfilled. Thank you for shopping local!"
        elif data.status == "rejected":
            notif_msg = f"Notice: Booking {b.booking_reference} could not be confirmed by {b.merchant.name if b.merchant else 'the store'}."

        notif_cust = Notification(
            merchant_id=b.merchant_id,
            customer_id=b.customer_id,
            type=f"booking_{data.status}",
            title=f"Order Update: {data.status.replace('_', ' ').capitalize()}",
            message=notif_msg,
            is_read=False,
            related_id=b.id,
        )
        db.add(notif_cust)

        # Audit log entry
        audit = AuditLog(
            actor_type="merchant" if data.status != "cancelled" else "user",
            actor_id=b.merchant_id,
            action=f"booking_status_{data.status}",
            target_type="booking",
            target_id=b.id,
            details=f"Status changed from {b.status} to {data.status} for reference {b.booking_reference}",
            result="success"
        )
        db.add(audit)

        b.status = data.status
        db.commit()
        db.refresh(b)
        return booking_to_out(b)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
