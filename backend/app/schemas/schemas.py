from datetime import datetime, date
from typing import Optional, List, Any
from pydantic import BaseModel


# ─── Merchant ────────────────────────────────────────────────────────────────

class MerchantBase(BaseModel):
    name: str
    location: Optional[str] = None
    neighborhood: Optional[str] = None
    category: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = "merchant"
    description: Optional[str] = None

class MerchantCreate(MerchantBase):
    pass

class MerchantOut(MerchantBase):
    id: int
    is_demo: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Customer ─────────────────────────────────────────────────────────────────

class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = "customer"
    neighborhood: Optional[str] = None
    location: Optional[str] = None
    allow_promotions: Optional[bool] = True
    preferred_language: Optional[str] = "en"

class CustomerCreate(CustomerBase):
    pass

class CustomerPreferencesUpdate(BaseModel):
    allow_promotions: Optional[bool] = None
    preferred_language: Optional[str] = None

class CustomerOut(CustomerBase):
    id: int
    is_demo: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Product ──────────────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    brand: Optional[str] = None
    variety: Optional[str] = None
    unit: Optional[str] = None
    pack_size: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    is_demo: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Inventory ────────────────────────────────────────────────────────────────

class InventoryBase(BaseModel):
    merchant_id: int
    product_id: int
    pack_size: Optional[str] = None
    purchase_price: Optional[float] = None
    available_quantity: int = 0
    reserved_quantity: int = 0

class InventoryCreate(InventoryBase):
    pass

class InventoryOut(InventoryBase):
    id: int
    last_updated: Optional[datetime] = None
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


# ─── BulkOffer ────────────────────────────────────────────────────────────────

class BulkOfferBase(BaseModel):
    merchant_id: int
    product_id: int
    bulk_price: float
    retail_price: Optional[float] = None
    minimum_quantity: int
    available_stock: int
    image_url: Optional[str] = None
    fulfilment_method: Optional[str] = "pickup"
    description: Optional[str] = None
    validity_start: Optional[datetime] = None
    validity_end: Optional[datetime] = None

class BulkOfferCreate(BulkOfferBase):
    pass

class BulkOfferUpdate(BaseModel):
    bulk_price: Optional[float] = None
    retail_price: Optional[float] = None
    minimum_quantity: Optional[int] = None
    available_stock: Optional[int] = None
    image_url: Optional[str] = None
    fulfilment_method: Optional[str] = None
    description: Optional[str] = None
    validity_start: Optional[datetime] = None
    validity_end: Optional[datetime] = None

class BulkOfferDuplicate(BaseModel):
    bulk_price: Optional[float] = None
    minimum_quantity: Optional[int] = None
    available_stock: Optional[int] = None
    validity_days: Optional[int] = 7

class BulkOfferStatusUpdate(BaseModel):
    status: str

class BulkOfferOut(BulkOfferBase):
    id: int
    booked_quantity: int
    status: str
    created_at: datetime
    product: Optional[ProductOut] = None
    merchant: Optional[MerchantOut] = None

    class Config:
        from_attributes = True

class MarketplaceOfferOut(BaseModel):
    id: int
    product_name: str
    product_category: Optional[str]
    brand: Optional[str] = None
    variety: Optional[str] = None
    pack_size: Optional[str]
    unit: Optional[str]
    image_url: Optional[str] = None
    merchant_name: str
    merchant_neighborhood: Optional[str]
    bulk_price: float
    retail_price: Optional[float]
    savings: Optional[float]
    minimum_quantity: int
    available_stock: int
    booked_quantity: int
    group_progress_pct: float
    validity_end: Optional[datetime]
    fulfilment_method: Optional[str]
    status: str

    class Config:
        from_attributes = True


# ─── Booking ──────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    customer_id: int
    offer_id: int
    quantity: int
    notes: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str

class BookingOut(BaseModel):
    id: int
    booking_reference: str
    customer_id: int
    merchant_id: int
    offer_id: int
    quantity: int
    unit_price_at_booking: float
    total_amount: float
    status: str
    notes: Optional[str]
    created_at: datetime
    customer_name: Optional[str] = None
    offer_name: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Transaction ──────────────────────────────────────────────────────────────

class TransactionItem(BaseModel):
    type: str  # cash_sale / credit_sale / expense
    amount: float
    description: Optional[str] = None

class TransactionBatchCreate(BaseModel):
    merchant_id: int
    transactions: List[TransactionItem]
    source: Optional[str] = "manual"
    raw_text: Optional[str] = None

class TransactionOut(BaseModel):
    id: int
    merchant_id: int
    transaction_type: str
    amount: float
    description: Optional[str]
    entry_date: Optional[date]
    source: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Loyalty ──────────────────────────────────────────────────────────────────

class LoyaltyActivityCreate(BaseModel):
    customer_id: int
    merchant_id: int
    visit_date: Optional[datetime] = None
    purchase_amount: Optional[float] = 0
    notes: Optional[str] = None

class LoyaltyCustomerOut(BaseModel):
    customer_id: int
    customer_name: str
    customer_phone: Optional[str]
    total_visits: int
    total_purchases: float
    days_since_last_visit: Optional[float]
    avg_interval_days: Optional[float]
    is_at_risk: bool
    loyalty_status: str
    last_visit_date: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Campaign ─────────────────────────────────────────────────────────────────

class CampaignDraftCreate(BaseModel):
    merchant_id: int
    customer_id: int
    language: Optional[str] = "english"
    message: Optional[str] = None

class CampaignDraftOut(BaseModel):
    id: int
    merchant_id: int
    customer_id: int
    language: str
    message_text: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Ledger ───────────────────────────────────────────────────────────────────

class TranscribeRequest(BaseModel):
    text: Optional[str] = None

class ParseRequest(BaseModel):
    text: str

class ParsedTransaction(BaseModel):
    type: str
    amount: float
    description: str

class ParseResponse(BaseModel):
    transactions: List[ParsedTransaction]
    cash_total: float
    credit_total: float
    expense_total: float
    net_cash: float

class LedgerSummaryOut(BaseModel):
    total_cash_sales: float
    total_credit_sales: float
    total_expenses: float
    net_cash_movement: float
    recent_transactions: List[TransactionOut]


# ─── Assistant ────────────────────────────────────────────────────────────────

class AssistantQuery(BaseModel):
    merchant_id: int
    query: str

class AssistantResponse(BaseModel):
    answer: str
    data: Any = None
    source: str = "calculated"


# ─── Notification ─────────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    merchant_id: int
    type: Optional[str]
    title: Optional[str]
    message: Optional[str]
    is_read: bool
    related_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    active_offers_count: int
    total_bookings_count: int
    pending_bookings_count: int
    total_quantity_booked: int
    estimated_sales_value: float
    customers_reached: int

class DashboardOut(BaseModel):
    merchant: MerchantOut
    stats: DashboardStats
    recent_bookings: List[BookingOut]
    active_offers: List[BulkOfferOut]
    low_stock_alerts: List[BulkOfferOut]
    notifications: List[NotificationOut]


# ─── Invoice ──────────────────────────────────────────────────────────────────

class InvoiceItem(BaseModel):
    product_name: str
    quantity: int
    unit_price: float
    total: float
    unit: Optional[str] = None

class InvoiceConfirm(BaseModel):
    merchant_id: int
    items: List[InvoiceItem]


# ─── Favourites ───────────────────────────────────────────────────────────────

class FavouriteCreate(BaseModel):
    customer_id: int
    target_type: str  # 'merchant', 'product', 'offer'
    target_id: int

class FavouriteOut(BaseModel):
    id: int
    customer_id: int
    target_type: str
    target_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Audit Log ────────────────────────────────────────────────────────────────

class AuditLogOut(BaseModel):
    id: int
    actor_type: str
    actor_id: Optional[int]
    action: str
    target_type: Optional[str]
    target_id: Optional[int]
    details: Optional[str]
    timestamp: datetime
    result: str

    class Config:
        from_attributes = True


# ─── Authentication & RBAC ────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "merchant"  # "merchant" or "customer"

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    role: str
    store_name: Optional[str] = None
    email: str


# ─── Daily Merchant Summary ───────────────────────────────────────────────────

class DailySummaryOut(BaseModel):
    date: str
    headline: str
    total_bookings: int
    confirmed_bookings: int
    fulfilled_bookings: int
    pending_bookings: int
    fulfilled_sales_value: float
    pending_booking_value: float
    top_performing_offer: Optional[str]
    slow_moving_product: Optional[str]
    low_stock_count: int
    at_risk_customers_count: int
    key_recommendations: List[str]
