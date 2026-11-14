from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.models import BulkOffer, Product, AuditLog
from app.schemas.schemas import BulkOfferOut, BulkOfferCreate, BulkOfferUpdate, BulkOfferStatusUpdate, BulkOfferDuplicate

router = APIRouter()


class StockAdjustment(BaseModel):
    delta: Optional[int] = None
    new_stock: Optional[int] = None


@router.get("/", response_model=List[BulkOfferOut])
def list_offers(merchant_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    try:
        q = db.query(BulkOffer)
        if merchant_id:
            q = q.filter(BulkOffer.merchant_id == merchant_id)
        return q.order_by(BulkOffer.created_at.desc()).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{offer_id}", response_model=BulkOfferOut)
def get_offer(offer_id: int, db: Session = Depends(get_db)):
    offer = db.query(BulkOffer).filter(BulkOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer


@router.post("/")
def create_offer(data: BulkOfferCreate, db: Session = Depends(get_db)):
    try:
        # Validations
        if data.bulk_price <= 0:
            raise HTTPException(status_code=400, detail="bulk_price must be greater than 0")
        if data.available_stock <= 0:
            raise HTTPException(status_code=400, detail="available_stock must be greater than 0")
        if data.minimum_quantity <= 0:
            raise HTTPException(status_code=400, detail="minimum_quantity must be greater than 0")
        if data.minimum_quantity > data.available_stock:
            raise HTTPException(status_code=400, detail="minimum_quantity cannot exceed available_stock")

        # Resolve or create product if product_id is not explicitly provided
        product_id = data.product_id
        if not product_id:
            prod_name = data.product_name or "Custom Bulk Item"
            existing_product = db.query(Product).filter(Product.name.ilike(prod_name)).first()
            if existing_product:
                product_id = existing_product.id
            else:
                new_prod = Product(
                    name=prod_name,
                    category=data.category or "General",
                    brand=data.brand or "Local Brand",
                    variety=data.variety or "",
                    pack_size=data.pack_size or "Standard Pack",
                    unit=data.unit or "units",
                    description=data.description or f"Bulk {prod_name}"
                )
                db.add(new_prod)
                db.flush()
                product_id = new_prod.id

        warning = False
        if data.retail_price and data.bulk_price > data.retail_price:
            warning = True

        offer_dict = data.model_dump(exclude={"product_name", "category", "brand", "variety", "pack_size", "unit"})
        offer_dict["product_id"] = product_id

        offer = BulkOffer(**offer_dict)
        db.add(offer)
        db.flush()

        # Audit log
        audit = AuditLog(
            actor_type="merchant",
            actor_id=data.merchant_id,
            action="offer_created",
            target_type="offer",
            target_id=offer.id,
            details=f"Created bulk offer for product #{product_id} at ₹{data.bulk_price} (min {data.minimum_quantity})",
            result="success"
        )
        db.add(audit)

        db.commit()
        db.refresh(offer)

        result = BulkOfferOut.model_validate(offer)
        response = result.model_dump()
        response["warning"] = warning
        if warning:
            response["warning_message"] = "bulk_price is higher than retail_price"
        return response
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{offer_id}/duplicate", response_model=BulkOfferOut)
def duplicate_offer(offer_id: int, options: BulkOfferDuplicate, db: Session = Depends(get_db)):
    """
    Duplicates an existing bulk offer: reuses product, category, pack size, description,
    and applies merchant-customized bulk price, stock, and validity before publishing.
    """
    orig = db.query(BulkOffer).filter(BulkOffer.id == offer_id).first()
    if not orig:
        raise HTTPException(status_code=404, detail="Original bulk offer not found")

    try:
        now = datetime.utcnow()
        validity_end = now + timedelta(days=options.validity_days or 7)

        bulk_price = options.bulk_price if options.bulk_price is not None else orig.bulk_price
        available_stock = options.available_stock if options.available_stock is not None else orig.available_stock
        minimum_quantity = options.minimum_quantity if options.minimum_quantity is not None else orig.minimum_quantity

        if minimum_quantity > available_stock:
            raise HTTPException(status_code=400, detail="Minimum group quantity cannot exceed available stock")

        duplicated = BulkOffer(
            merchant_id=orig.merchant_id,
            product_id=orig.product_id,
            bulk_price=bulk_price,
            retail_price=orig.retail_price,
            minimum_quantity=minimum_quantity,
            available_stock=available_stock,
            booked_quantity=0,
            image_url=orig.image_url,
            fulfilment_method=orig.fulfilment_method,
            description=f"{orig.description} (Repeated Offer)",
            status="active",
            validity_start=now,
            validity_end=validity_end
        )
        db.add(duplicated)
        db.flush()

        audit = AuditLog(
            actor_type="merchant",
            actor_id=orig.merchant_id,
            action="offer_duplicated",
            target_type="offer",
            target_id=duplicated.id,
            details=f"Duplicated from offer #{orig.id} at ₹{bulk_price}",
            result="success"
        )
        db.add(audit)

        db.commit()
        db.refresh(duplicated)
        return duplicated
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{offer_id}/stock", response_model=BulkOfferOut)
def adjust_offer_stock(offer_id: int, adj: StockAdjustment, db: Session = Depends(get_db)):
    """
    1-tap stock adjustment: supports delta (+1, +5, -1, -5) or setting absolute stock quantity.
    """
    offer = db.query(BulkOffer).filter(BulkOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    try:
        old_stock = offer.available_stock
        if adj.new_stock is not None:
            offer.available_stock = max(0, adj.new_stock)
        elif adj.delta is not None:
            offer.available_stock = max(0, offer.available_stock + adj.delta)
        else:
            raise HTTPException(status_code=400, detail="Either delta or new_stock must be provided")

        audit = AuditLog(
            actor_type="merchant",
            actor_id=offer.merchant_id,
            action="stock_adjusted",
            target_type="offer",
            target_id=offer.id,
            details=f"Stock changed from {old_stock} to {offer.available_stock} (delta: {adj.delta})",
            result="success"
        )
        db.add(audit)

        db.commit()
        db.refresh(offer)
        return offer
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{offer_id}/toggle-status", response_model=BulkOfferOut)
def toggle_offer_status(offer_id: int, db: Session = Depends(get_db)):
    """Toggle between active and paused status."""
    offer = db.query(BulkOffer).filter(BulkOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    new_status = "paused" if offer.status == "active" else "active"
    offer.status = new_status

    audit = AuditLog(
        actor_type="merchant",
        actor_id=offer.merchant_id,
        action=f"offer_{new_status}",
        target_type="offer",
        target_id=offer.id,
        details=f"Offer status toggled to {new_status}",
        result="success"
    )
    db.add(audit)

    db.commit()
    db.refresh(offer)
    return offer


@router.put("/{offer_id}", response_model=BulkOfferOut)
def update_offer(offer_id: int, data: BulkOfferUpdate, db: Session = Depends(get_db)):
    offer = db.query(BulkOffer).filter(BulkOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    try:
        update_dict = data.model_dump(exclude_unset=True)

        # Update product metadata if included
        product_fields = {"product_name", "category", "brand", "variety", "pack_size", "unit"}
        prod = offer.product
        if prod:
            if "product_name" in update_dict and update_dict["product_name"]:
                prod.name = update_dict["product_name"]
            if "category" in update_dict and update_dict["category"]:
                prod.category = update_dict["category"]
            if "brand" in update_dict and update_dict["brand"]:
                prod.brand = update_dict["brand"]
            if "variety" in update_dict and update_dict["variety"]:
                prod.variety = update_dict["variety"]
            if "pack_size" in update_dict and update_dict["pack_size"]:
                prod.pack_size = update_dict["pack_size"]
            if "unit" in update_dict and update_dict["unit"]:
                prod.unit = update_dict["unit"]

        # Update offer fields
        for field, value in update_dict.items():
            if field not in product_fields and hasattr(offer, field):
                setattr(offer, field, value)

        audit = AuditLog(
            actor_type="merchant",
            actor_id=offer.merchant_id,
            action="offer_updated",
            target_type="offer",
            target_id=offer.id,
            details=f"Updated offer fields: {list(update_dict.keys())}",
            result="success"
        )
        db.add(audit)

        db.commit()
        db.refresh(offer)
        return offer
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{offer_id}/status", response_model=BulkOfferOut)
def update_offer_status(offer_id: int, data: BulkOfferStatusUpdate, db: Session = Depends(get_db)):
    offer = db.query(BulkOffer).filter(BulkOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    valid_statuses = ["active", "paused", "expired", "deleted"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    try:
        offer.status = data.status
        db.commit()
        db.refresh(offer)
        return offer
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{offer_id}")
def delete_offer(offer_id: int, db: Session = Depends(get_db)):
    offer = db.query(BulkOffer).filter(BulkOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    try:
        offer.status = "deleted"
        db.commit()
        return {"message": "Offer deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
