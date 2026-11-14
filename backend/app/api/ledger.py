import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.models import Transaction, AuditLog
from app.schemas.schemas import (
    TranscribeRequest, ParseRequest, ParseResponse,
    TransactionBatchCreate, TransactionOut, LedgerSummaryOut, ParsedTransaction
)

router = APIRouter()

MOCK_TRANSCRIPTION = "Cash sale 450 rupees, credit sale 200 rupees, shop expense 150 rupees"


@router.post("/transcribe")
async def transcribe(
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Accept audio file OR return mock transcription."""
    if file:
        # In production, send to Sarvam ASR API
        # For now return mock
        return {"transcription": MOCK_TRANSCRIPTION, "source": "mock"}
    return {"transcription": MOCK_TRANSCRIPTION, "source": "mock"}


@router.post("/transcribe/text")
def transcribe_text(data: TranscribeRequest):
    """Accept JSON body {text: str}."""
    if data.text:
        return {"transcription": data.text, "source": "passthrough"}
    return {"transcription": MOCK_TRANSCRIPTION, "source": "mock"}


@router.post("/parse", response_model=ParseResponse)
def parse_text(data: ParseRequest):
    """Parse transaction text into structured transactions."""
    text = data.text.lower()
    transactions = []

    # Cash sales: "cash sale 450", "received 450 cash", "450 cash"
    for m in re.finditer(r"(?:cash\s+sale\s+(\d+)|received\s+(\d+)(?:\s+cash)?|(\d+)\s+cash)", text):
        val = next(v for v in m.groups() if v is not None)
        transactions.append(ParsedTransaction(type="cash_sale", amount=float(val), description="Cash sale"))

    # Credit sales: "credit sale 200", "200 on credit", "200 credit"
    for m in re.finditer(r"(?:credit\s+sale\s+(\d+)|(\d+)\s+on\s+credit|(\d+)\s+credit)", text):
        val = next(v for v in m.groups() if v is not None)
        transactions.append(ParsedTransaction(type="credit_sale", amount=float(val), description="Credit sale"))

    # Expenses: "shop expense 150", "expense 150", "paid 150"
    for m in re.finditer(r"(?:(?:shop\s+)?expense\s+(\d+)|paid\s+(\d+))", text):
        val = next(v for v in m.groups() if v is not None)
        transactions.append(ParsedTransaction(type="expense", amount=float(val), description="Shop expense"))

    cash_total = sum(t.amount for t in transactions if t.type == "cash_sale")
    credit_total = sum(t.amount for t in transactions if t.type == "credit_sale")
    expense_total = sum(t.amount for t in transactions if t.type == "expense")
    net_cash = cash_total - expense_total

    return ParseResponse(
        transactions=transactions,
        cash_total=cash_total,
        credit_total=credit_total,
        expense_total=expense_total,
        net_cash=net_cash,
    )


@router.post("/transactions")
def save_transactions(data: TransactionBatchCreate, db: Session = Depends(get_db)):
    """Save a batch of transactions to DB."""
    try:
        saved = []
        for item in data.transactions:
            txn = Transaction(
                merchant_id=data.merchant_id,
                transaction_type=item.type,
                amount=item.amount,
                description=item.description,
                entry_date=datetime.utcnow().date(),
                source=data.source or "manual",
                raw_voice_text=data.raw_text,
            )
            db.add(txn)
            saved.append(txn)

        audit = AuditLog(
            actor_type="merchant",
            actor_id=data.merchant_id,
            action="ledger_batch_posted",
            target_type="ledger",
            details=f"Posted {len(saved)} voice/manual ledger transactions. Raw speech: {data.raw_text or 'N/A'}",
            result="success"
        )
        db.add(audit)

        db.commit()
        for t in saved:
            db.refresh(t)
        return {"message": f"{len(saved)} transactions saved", "count": len(saved)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
def ledger_summary(merchant_id: int = Query(...), db: Session = Depends(get_db)):
    """Return ledger summary for a merchant."""
    try:
        txns = db.query(Transaction).filter(Transaction.merchant_id == merchant_id).all()
        cash = sum(t.amount for t in txns if t.transaction_type == "cash_sale")
        credit = sum(t.amount for t in txns if t.transaction_type == "credit_sale")
        expense = sum(t.amount for t in txns if t.transaction_type == "expense")
        net = cash - expense

        recent = db.query(Transaction).filter(
            Transaction.merchant_id == merchant_id
        ).order_by(Transaction.created_at.desc()).limit(10).all()

        return {
            "total_cash_sales": cash,
            "total_credit_sales": credit,
            "total_expenses": expense,
            "net_cash_movement": net,
            "recent_transactions": recent,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
