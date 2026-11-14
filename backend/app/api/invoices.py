import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Inventory, Product
from app.schemas.schemas import InvoiceConfirm

router = APIRouter()

MOCK_INVOICE_ITEMS = [
    {"product_name": "Sona Masoori Rice", "quantity": 10, "unit_price": 1350.0, "total": 13500.0, "unit": "25kg bag"},
    {"product_name": "Toor Dal", "quantity": 5, "unit_price": 850.0, "total": 4250.0, "unit": "10kg bag"},
    {"product_name": "Sunflower Oil", "quantity": 3, "unit_price": 1800.0, "total": 5400.0, "unit": "15L tin"},
]

ALLOWED_INVOICE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/extract")
async def extract_invoice(file: Optional[UploadFile] = File(None)):
    """Accept multipart file and return OCR extraction with file security validation."""
    clean_filename = None
    if file and file.filename:
        # Prevent path traversal
        clean_filename = os.path.basename(file.filename)
        _, ext = os.path.splitext(clean_filename.lower())
        
        # Enforce allowed extensions
        if ext not in ALLOWED_INVOICE_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type '{ext}'. Only JPG, PNG, PDF, and WEBP files are allowed."
            )
        
        # Enforce size limit
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File size exceeds maximum allowed limit of 5MB."
            )

    return {
        "source": "mock",
        "filename": clean_filename,
        "items": MOCK_INVOICE_ITEMS,
        "total_amount": sum(i["total"] for i in MOCK_INVOICE_ITEMS),
        "vendor": "Sri Balaji APMC Wholesalers",
        "invoice_date": "2026-11-14",
        "message": "Mock extraction — integrate OCR service for live vendor pipelines"
    }


@router.post("/confirm")
def confirm_invoice(data: InvoiceConfirm, db: Session = Depends(get_db)):
    """Accept list of items and save to inventory."""
    try:
        created = []
        for item in data.items:
            # Try to find matching product
            product = db.query(Product).filter(
                Product.name.ilike(f"%{item.product_name}%")
            ).first()

            if product:
                inv = Inventory(
                    merchant_id=data.merchant_id,
                    product_id=product.id,
                    purchase_price=item.unit_price,
                    available_quantity=item.quantity,
                )
                db.add(inv)
                created.append({"product": product.name, "quantity": item.quantity})

        db.commit()
        return {
            "message": f"Inventory updated for {len(created)} items",
            "items_saved": created
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
