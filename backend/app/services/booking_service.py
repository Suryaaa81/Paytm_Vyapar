"""Booking service helpers."""
from sqlalchemy.orm import Session
from app.models.models import Booking, BulkOffer


def get_bookings_for_merchant(db: Session, merchant_id: int):
    return db.query(Booking).filter(Booking.merchant_id == merchant_id).all()


def get_pending_bookings(db: Session, merchant_id: int):
    return db.query(Booking).filter(
        Booking.merchant_id == merchant_id,
        Booking.status == "pending"
    ).all()
