from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.auth.security import get_current_user
from app.database import get_db
from app.data.models import DataRecord
from app.reports.pdf_generator import generate_pdf
from app.reports.excel_generator import generate_excel

router = APIRouter()

class ReportFormat:
    PDF = "pdf"
    EXCEL = "excel"

@router.get("/reports/export", summary="Export data as PDF or Excel")
def export_report(
    format: str = Query(ReportFormat.PDF, description="Export format: pdf or excel"),
    start_date: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Basic format validation
    if format not in (ReportFormat.PDF, ReportFormat.EXCEL):
        raise HTTPException(status_code=400, detail="Invalid format; must be 'pdf' or 'excel'")

    query = db.query(DataRecord)
    if start_date:
        query = query.filter(DataRecord.date >= start_date)
    if end_date:
        query = query.filter(DataRecord.date <= end_date)
    records = query.all()

    records_data = [
        {
            "order_id": r.order_id,
            "date": r.date.isoformat() if hasattr(r.date, "isoformat") else str(r.date),
            "region": r.region,
            "category": r.category,
            "product": r.product,
            "units_sold": r.units_sold,
            "revenue": r.revenue,
            "profit_margin": r.profit_margin,
            "customer_role": r.customer_role,
        }
        for r in records
    ]

    if format == ReportFormat.PDF:
        pdf_bytes = generate_pdf("Data Export Report", records_data)
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=report.pdf"},
        )
    else:
        excel_bytes = generate_excel("Data Export Report", records_data)
        return StreamingResponse(
            iter([excel_bytes]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=report.xlsx"},
        )
