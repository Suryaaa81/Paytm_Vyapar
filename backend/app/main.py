from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models.models import (
    Merchant, Customer, Product, Inventory,
    BulkOffer, Booking, Transaction,
    LoyaltyActivity, CampaignDraft, Notification
)
from app.database import Base
from app.seed import seed_database
from app.migrate import run_migrations

from app.api.auth import router as auth_router
from app.api.merchants import router as merchants_router
from app.api.products import router as products_router
from app.api.offers import router as offers_router
from app.api.bookings import router as bookings_router
from app.api.marketplace import router as marketplace_router
from app.api.invoices import router as invoices_router
from app.api.loyalty import router as loyalty_router
from app.api.ledger import router as ledger_router
from app.api.assistant import router as assistant_router

# Run migration check & create tables
run_migrations()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Paytm Vyapar-Brain API",
    version="1.0.0",
    description="Backend API for Paytm Vyapar-Brain — group buying, loyalty & ledger for kirana merchants",
)

import os

cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
if cors_origins_raw.strip() == "*":
    cors_origins = ["*"]
else:
    cors_origins = [orig.strip() for orig in cors_origins_raw.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    seed_database()


# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(merchants_router, prefix="/api/merchants", tags=["merchants"])
app.include_router(products_router, prefix="/api/products", tags=["products"])
app.include_router(offers_router, prefix="/api/offers", tags=["offers"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["bookings"])
app.include_router(marketplace_router, prefix="/api/marketplace", tags=["marketplace"])
app.include_router(invoices_router, prefix="/api/invoices", tags=["invoices"])
app.include_router(loyalty_router, prefix="/api/loyalty", tags=["loyalty"])
app.include_router(ledger_router, prefix="/api/ledger", tags=["ledger"])
app.include_router(assistant_router, prefix="/api/assistant", tags=["assistant"])


@app.get("/")
def root():
    return {"message": "Paytm Vyapar-Brain API", "status": "running", "version": "1.0.0"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
