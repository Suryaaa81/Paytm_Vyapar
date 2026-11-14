from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import BulkOffer, Merchant, Product, Customer, Favourite, Notification, Booking, AuditLog
from app.schemas.schemas import MarketplaceOfferOut, FavouriteCreate, FavouriteOut

router = APIRouter()


@router.get("/offers")
def list_marketplace_offers(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    neighborhood: Optional[str] = Query(None),
    sort: Optional[str] = Query("bulk_price"),
    fulfilment_method: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        q = db.query(BulkOffer).join(Merchant).join(Product).filter(
            BulkOffer.status == "active"
        )

        if category and category.lower() != "all":
            q = q.filter(Product.category.ilike(f"%{category}%"))
        if neighborhood and neighborhood.lower() != "all":
            q = q.filter(Merchant.neighborhood.ilike(f"%{neighborhood}%"))
        if fulfilment_method:
            q = q.filter(BulkOffer.fulfilment_method == fulfilment_method)
        if search:
            q = q.filter(
                Product.name.ilike(f"%{search}%") |
                Merchant.name.ilike(f"%{search}%") |
                Product.category.ilike(f"%{search}%")
            )

        offers = q.all()

        # Sort
        reverse = sort and (sort.startswith("-") or sort in ["savings_desc", "popular"])
        if sort == "savings_desc":
            offers = sorted(offers, key=lambda o: ((o.retail_price or 0) - (o.bulk_price or 0)), reverse=True)
        elif sort == "popular":
            offers = sorted(offers, key=lambda o: (o.booked_quantity or 0), reverse=True)
        else:
            sort_key = sort.lstrip("-") if sort else "bulk_price"
            try:
                offers = sorted(offers, key=lambda o: getattr(o, sort_key, 0) or 0, reverse=reverse)
            except Exception:
                pass

        result = []
        for o in offers:
            savings = None
            if o.retail_price and o.bulk_price:
                savings = max(0.0, round(o.retail_price - o.bulk_price, 2))
            progress = 0.0
            if o.minimum_quantity and o.minimum_quantity > 0:
                progress = min((o.booked_quantity / o.minimum_quantity) * 100, 100)

            img = o.image_url or (o.product.image_url if o.product else None)

            result.append({
                "id": o.id,
                "product_name": o.product.name if o.product else "",
                "product_category": o.product.category if o.product else None,
                "brand": o.product.brand if o.product else None,
                "variety": o.product.variety if o.product else None,
                "pack_size": o.product.pack_size if o.product else None,
                "unit": o.product.unit if o.product else None,
                "image_url": img,
                "merchant_name": o.merchant.name if o.merchant else "",
                "merchant_neighborhood": o.merchant.neighborhood if o.merchant else None,
                "merchant_id": o.merchant_id,
                "bulk_price": o.bulk_price,
                "retail_price": o.retail_price,
                "savings": savings,
                "minimum_quantity": o.minimum_quantity,
                "available_stock": o.available_stock,
                "booked_quantity": o.booked_quantity,
                "group_progress_pct": round(progress, 1),
                "validity_end": o.validity_end,
                "fulfilment_method": o.fulfilment_method,
                "status": o.status,
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compare")
def compare_products(
    category: Optional[str] = Query(None),
    sort: Optional[str] = Query("lowest_price"),
    db: Session = Depends(get_db)
):
    """
    Returns grouped multi-merchant price comparisons for identical or strictly comparable products
    matching by: category, name, pack size, and unit.
    """
    try:
        q = db.query(BulkOffer).join(Merchant).join(Product).filter(
            BulkOffer.status == "active"
        )
        if category and category.lower() != "all":
            q = q.filter(Product.category.ilike(f"%{category}%"))

        offers = q.all()

        # Group by canonical product key (name + pack_size)
        groups = {}
        for o in offers:
            prod_name = o.product.name if o.product else "Grocery Staple"
            pack_size = o.product.pack_size if o.product else "Bulk"
            key = f"{prod_name} ({pack_size})"

            if key not in groups:
                groups[key] = {
                    "product_name": prod_name,
                    "category": o.product.category if o.product else "Grocery",
                    "pack_size": pack_size,
                    "unit": o.product.unit if o.product else "units",
                    "variety": o.product.variety if o.product else "",
                    "offers": []
                }

            savings = max(0.0, round((o.retail_price or 0) - o.bulk_price, 2)) if o.retail_price else 0.0
            progress = min(100.0, round(((o.booked_quantity or 0) / max(1, o.minimum_quantity)) * 100, 1))

            groups[key]["offers"].append({
                "offer_id": o.id,
                "merchant_id": o.merchant_id,
                "merchant_name": o.merchant.name if o.merchant else "Neighborhood Kirana",
                "neighborhood": o.merchant.neighborhood if o.merchant else "Hyderabad",
                "bulk_price": o.bulk_price,
                "retail_price": o.retail_price,
                "customer_savings": savings,
                "minimum_quantity": o.minimum_quantity,
                "booked_quantity": o.booked_quantity,
                "progress_pct": progress,
                "available_stock": o.available_stock,
                "fulfilment_method": o.fulfilment_method,
                "validity_end": o.validity_end,
                "image_url": o.image_url or (o.product.image_url if o.product else None)
            })

        # Sort offers inside each group according to selected sort
        comparison_list = []
        for key, grp in groups.items():
            if sort == "highest_savings":
                grp["offers"].sort(key=lambda x: x["customer_savings"], reverse=True)
            elif sort == "most_popular":
                grp["offers"].sort(key=lambda x: x["booked_quantity"], reverse=True)
            else:  # default lowest_price
                grp["offers"].sort(key=lambda x: x["bulk_price"])

            grp["lowest_price"] = grp["offers"][0]["bulk_price"] if grp["offers"] else 0
            grp["max_savings"] = max([x["customer_savings"] for x in grp["offers"]]) if grp["offers"] else 0
            grp["store_count"] = len(grp["offers"])
            comparison_list.append(grp)

        return comparison_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/offers/{offer_id}")
def get_marketplace_offer(offer_id: int, db: Session = Depends(get_db)):
    offer = db.query(BulkOffer).filter(BulkOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    try:
        savings = None
        if offer.retail_price and offer.bulk_price:
            savings = max(0.0, round(offer.retail_price - offer.bulk_price, 2))
        progress = 0.0
        if offer.minimum_quantity and offer.minimum_quantity > 0:
            progress = min((offer.booked_quantity / offer.minimum_quantity) * 100, 100)

        img = offer.image_url or (offer.product.image_url if offer.product else None)

        product_data = {
            "id": offer.product.id if offer.product else offer.product_id,
            "name": offer.product.name if offer.product else "Bulk Grocery Staple",
            "category": offer.product.category if offer.product else "Grocery",
            "brand": offer.product.brand if offer.product else "Premium",
            "variety": offer.product.variety if offer.product else "Standard",
            "pack_size": offer.product.pack_size if offer.product else "Bulk pack",
            "unit": offer.product.unit if offer.product else "bags",
            "image_url": offer.product.image_url if offer.product else None,
        }
        merchant_data = {
            "id": offer.merchant.id if offer.merchant else offer.merchant_id,
            "name": offer.merchant.name if offer.merchant else "Sri Vinayaka Kirana Store",
            "neighborhood": offer.merchant.neighborhood if offer.merchant else "Ameerpet",
            "phone": offer.merchant.phone if offer.merchant else "+91 98765 43210",
            "location": offer.merchant.location if offer.merchant else "Ameerpet, Hyderabad",
        }

        return {
            "id": offer.id,
            "product_id": offer.product_id,
            "merchant_id": offer.merchant_id,
            "product": product_data,
            "merchant": merchant_data,
            "product_name": offer.product.name if offer.product else "",
            "product_category": offer.product.category if offer.product else None,
            "brand": offer.product.brand if offer.product else None,
            "variety": offer.product.variety if offer.product else None,
            "pack_size": offer.product.pack_size if offer.product else None,
            "unit": offer.product.unit if offer.product else None,
            "image_url": img,
            "merchant_name": offer.merchant.name if offer.merchant else "",
            "merchant_neighborhood": offer.merchant.neighborhood if offer.merchant else None,
            "merchant_phone": offer.merchant.phone if offer.merchant else None,
            "merchant_location": offer.merchant.location if offer.merchant else None,
            "bulk_price": offer.bulk_price,
            "retail_price": offer.retail_price,
            "savings": savings,
            "minimum_quantity": offer.minimum_quantity,
            "available_stock": offer.available_stock,
            "booked_quantity": offer.booked_quantity,
            "group_progress_pct": round(progress, 1),
            "validity_start": offer.validity_start,
            "validity_end": offer.validity_end,
            "fulfilment_method": offer.fulfilment_method,
            "description": offer.description,
            "status": offer.status,
            "created_at": offer.created_at,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Favourites Endpoints ─────────────────────────────────────────────────────

@router.get("/favourites", response_model=List[FavouriteOut])
def get_favourites(customer_id: int = Query(...), db: Session = Depends(get_db)):
    return db.query(Favourite).filter(Favourite.customer_id == customer_id).order_by(Favourite.created_at.desc()).all()


@router.post("/favourites", response_model=FavouriteOut)
def add_favourite(data: FavouriteCreate, db: Session = Depends(get_db)):
    # Check if already favourited
    existing = db.query(Favourite).filter(
        Favourite.customer_id == data.customer_id,
        Favourite.target_type == data.target_type,
        Favourite.target_id == data.target_id
    ).first()
    if existing:
        return existing

    fav = Favourite(
        customer_id=data.customer_id,
        target_type=data.target_type,
        target_id=data.target_id
    )
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav


@router.delete("/favourites/{fav_id}")
def remove_favourite(fav_id: int, db: Session = Depends(get_db)):
    fav = db.query(Favourite).filter(Favourite.id == fav_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favourite not found")
    db.delete(fav)
    db.commit()
    return {"message": "Favourite removed successfully"}


# ─── Repeat Booking with Live Revalidation ───────────────────────────────────

@router.post("/repeat-booking/{booking_id}")
def repeat_booking(booking_id: int, db: Session = Depends(get_db)):
    """
    Safely repeats a previous booking by strictly revalidating the current price,
    available stock, and active offer validity before placing the new reservation.
    """
    old_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not old_booking:
        raise HTTPException(status_code=404, detail="Original booking not found")

    # Fetch live offer
    offer = db.query(BulkOffer).with_for_update().filter(BulkOffer.id == old_booking.offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Associated bulk offer no longer exists")
    if offer.status != "active":
        raise HTTPException(status_code=400, detail=f"Offer is currently {offer.status} and cannot be repeated")

    # Revalidate expiry
    now = datetime.utcnow()
    if offer.validity_end and offer.validity_end < now:
        raise HTTPException(status_code=400, detail="This bulk offer has expired and cannot be repeated")

    # Revalidate available stock
    qty = old_booking.quantity
    if offer.available_stock < qty:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient current stock to repeat booking. Available: {offer.available_stock}, Needed: {qty}"
        )

    import random, string
    yr = datetime.utcnow().year
    digits = ''.join(random.choices(string.digits, k=4))
    new_ref = f"BK-{yr}-{digits}"

    current_price = offer.bulk_price
    total = round(qty * current_price, 2)

    new_booking = Booking(
        booking_reference=new_ref,
        customer_id=old_booking.customer_id,
        merchant_id=offer.merchant_id,
        offer_id=offer.id,
        quantity=qty,
        unit_price_at_booking=current_price,
        total_amount=total,
        status="pending",
        notes=f"Repeated from order {old_booking.booking_reference}"
    )
    db.add(new_booking)

    # Atomic stock deduction
    offer.available_stock -= qty
    offer.booked_quantity += qty

    db.flush()

    # Notifications
    notif = Notification(
        merchant_id=offer.merchant_id,
        type="repeat_booking",
        title="Repeat booking received",
        message=f"Customer repeated booking {new_ref} for {qty} units of {offer.product.name if offer.product else 'grocery'}.",
        is_read=False,
        related_id=new_booking.id
    )
    db.add(notif)

    # Customer notification
    notif_cust = Notification(
        customer_id=old_booking.customer_id,
        type="repeat_booking_success",
        title="Repeat order confirmed",
        message=f"Repeat reservation {new_ref} placed at live bulk price ₹{current_price}/unit. Total: ₹{total}",
        is_read=False,
        related_id=new_booking.id
    )
    db.add(notif_cust)

    # Audit log
    audit = AuditLog(
        actor_type="customer",
        actor_id=old_booking.customer_id,
        action="booking_repeated",
        target_type="booking",
        target_id=new_booking.id,
        details=f"Repeated order from #{old_booking.id} with reference {new_ref} at live price ₹{current_price}",
        result="success"
    )
    db.add(audit)

    db.commit()
    db.refresh(new_booking)
    return {
        "message": "Repeat booking placed successfully with verified live pricing and stock reservation",
        "booking": {
            "id": new_booking.id,
            "booking_reference": new_booking.booking_reference,
            "quantity": new_booking.quantity,
            "unit_price": new_booking.unit_price_at_booking,
            "total_amount": new_booking.total_amount,
            "status": new_booking.status,
            "offer_name": offer.product.name if offer.product else "Bulk Offer"
        }
    }


# ─── Customer In-App Notifications ───────────────────────────────────────────

@router.get("/notifications")
def get_customer_notifications(customer_id: int = Query(...), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(
        Notification.customer_id == customer_id
    ).order_by(Notification.created_at.desc()).limit(30).all()
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at
        } for n in notifs
    ]
