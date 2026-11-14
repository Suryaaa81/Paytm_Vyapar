from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Product, Inventory
from app.schemas.schemas import ProductOut, ProductCreate, InventoryOut, InventoryCreate

router = APIRouter()


@router.get("/", response_model=List[ProductOut])
def list_products(category: Optional[str] = Query(None), db: Session = Depends(get_db)):
    try:
        q = db.query(Product)
        if category:
            q = q.filter(Product.category.ilike(f"%{category}%"))
        return q.all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    try:
        rows = db.query(Product.category).distinct().all()
        return {"categories": [r[0] for r in rows if r[0]]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inventory", response_model=List[InventoryOut])
def get_inventory(merchant_id: int = Query(...), db: Session = Depends(get_db)):
    try:
        return db.query(Inventory).filter(Inventory.merchant_id == merchant_id).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/inventory", response_model=InventoryOut)
def create_inventory(data: InventoryCreate, db: Session = Depends(get_db)):
    try:
        inv = Inventory(**data.model_dump())
        db.add(inv)
        db.commit()
        db.refresh(inv)
        return inv
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=ProductOut)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    try:
        product = Product(**data.model_dump())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


from pydantic import BaseModel
class ProductImageUpdate(BaseModel):
    image_url: str

@router.patch("/{product_id}/image", response_model=ProductOut)
def update_product_image(product_id: int, data: ProductImageUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.image_url = data.image_url
    db.commit()
    db.refresh(product)
    return product
