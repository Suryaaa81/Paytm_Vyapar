from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Text, Date
)
from sqlalchemy.orm import relationship
from app.database import Base


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    location = Column(String(300))
    neighborhood = Column(String(100))
    category = Column(String(100))
    phone = Column(String(20))
    email = Column(String(100), default="merchant@paytmkirana.com")
    password_hash = Column(String(200), default="demo123")
    role = Column(String(20), default="merchant")
    description = Column(Text)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    offers = relationship("BulkOffer", back_populates="merchant")
    transactions = relationship("Transaction", back_populates="merchant")
    notifications = relationship("Notification", back_populates="merchant")
    inventory = relationship("Inventory", back_populates="merchant")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    phone = Column(String(20))
    email = Column(String(100), default="customer@paytmshopper.com")
    password_hash = Column(String(200), default="demo123")
    role = Column(String(20), default="customer")
    neighborhood = Column(String(100))
    location = Column(String(300))
    allow_promotions = Column(Boolean, default=True)
    preferred_language = Column(String(10), default="en")
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="customer")
    loyalty_activities = relationship("LoyaltyActivity", back_populates="customer")
    favourites = relationship("Favourite", back_populates="customer")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100))
    brand = Column(String(100))
    variety = Column(String(100))
    unit = Column(String(50))
    pack_size = Column(String(50))
    image_url = Column(String(500), nullable=True)
    description = Column(Text)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    offers = relationship("BulkOffer", back_populates="product")
    inventory = relationship("Inventory", back_populates="product")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    pack_size = Column(String(50))
    purchase_price = Column(Float)
    available_quantity = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="inventory")
    product = relationship("Product", back_populates="inventory")


class BulkOffer(Base):
    __tablename__ = "bulk_offers"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    bulk_price = Column(Float, nullable=False)
    retail_price = Column(Float)
    minimum_quantity = Column(Integer, nullable=False)
    available_stock = Column(Integer, nullable=False)
    booked_quantity = Column(Integer, default=0)
    validity_start = Column(DateTime)
    validity_end = Column(DateTime)
    image_url = Column(String(500), nullable=True)
    fulfilment_method = Column(String(20), default="pickup")  # pickup/delivery/both
    description = Column(Text)
    status = Column(String(20), default="active")  # active/paused/expired/deleted
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="offers")
    product = relationship("Product", back_populates="offers")
    bookings = relationship("Booking", back_populates="offer")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(20), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    offer_id = Column(Integer, ForeignKey("bulk_offers.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price_at_booking = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(30), default="pending")  # pending/confirmed/ready_for_pickup/fulfilled/cancelled
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="bookings")
    merchant = relationship("Merchant")
    offer = relationship("BulkOffer", back_populates="bookings")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # cash_sale/credit_sale/expense
    amount = Column(Float, nullable=False)
    description = Column(Text)
    entry_date = Column(Date, default=datetime.utcnow)
    source = Column(String(20), default="manual")  # voice/manual
    raw_voice_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="transactions")


class LoyaltyActivity(Base):
    __tablename__ = "loyalty_activity"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    visit_date = Column(DateTime, nullable=False)
    purchase_amount = Column(Float, default=0)
    notes = Column(Text)

    customer = relationship("Customer", back_populates="loyalty_activities")
    merchant = relationship("Merchant")


class CampaignDraft(Base):
    __tablename__ = "campaign_drafts"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    language = Column(String(20), default="english")
    message_text = Column(Text)
    status = Column(String(20), default="draft")  # draft/sent_simulation
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant")
    customer = relationship("Customer")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    type = Column(String(50))
    title = Column(String(200))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    related_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="notifications")
    customer = relationship("Customer")


class Favourite(Base):
    __tablename__ = "favourites"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    target_type = Column(String(20), nullable=False)  # 'merchant', 'product', 'offer'
    target_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="favourites")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_type = Column(String(20), nullable=False)  # 'merchant', 'customer', 'system'
    actor_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)  # 'offer_created', 'booking_confirmed', 'stock_updated', etc.
    target_type = Column(String(50), nullable=True)
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    result = Column(String(20), default="success")  # 'success', 'failure'
