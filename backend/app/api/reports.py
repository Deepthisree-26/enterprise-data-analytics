from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import date

from app.auth.security import get_current_user
from app.database import get_db
from app.data.models import DataRecord
from app.data.department_models import (
    SalesTransaction,
    Customer,
    Product,
    InventoryItem,
    FinanceTransaction,
    MarketingCampaign,
    Employee,
)
from app.reports.pdf_generator import generate_pdf
from app.reports.excel_generator import generate_excel, generate_multi_sheet_excel

router = APIRouter()

class ReportFormat:
    PDF = "pdf"
    EXCEL = "excel"


def get_records_as_dicts(db: Session, model) -> List[Dict[str, Any]]:
    rows = db.query(model).all()
    out = []
    for r in rows:
        d = {}
        for col in r.__table__.columns:
            val = getattr(r, col.name)
            if hasattr(val, "isoformat"):
                val = val.isoformat()
            d[col.name] = val
        out.append(d)
    return out


@router.get("/reports/export", summary="Export department or executive data as PDF or Excel")
def export_report(
    format: str = Query(ReportFormat.PDF, description="Export format: pdf or excel"),
    department: Optional[str] = Query("Executive", description="Department: Executive, Sales, Customers, Inventory, Finance, Marketing, HR"),
    start_date: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if format not in (ReportFormat.PDF, ReportFormat.EXCEL):
        raise HTTPException(status_code=400, detail="Invalid format; must be 'pdf' or 'excel'")

    dept = (department or "Executive").strip().title()

    # Department models mapping
    dept_models = {
        "Sales": SalesTransaction,
        "Customers": Customer,
        "Products": Product,
        "Inventory": InventoryItem,
        "Finance": FinanceTransaction,
        "Marketing": MarketingCampaign,
        "HR": Employee,
    }

    if dept == "Executive":
        # Multi-department compilation
        sheets = {}
        # Executive Summary sheet
        sales_rows = get_records_as_dicts(db, SalesTransaction)
        if not sales_rows:
            # Fallback legacy DataRecord
            sales_rows = get_records_as_dicts(db, DataRecord)

        cust_rows = get_records_as_dicts(db, Customer)
        inv_rows = get_records_as_dicts(db, InventoryItem)
        fin_rows = get_records_as_dicts(db, FinanceTransaction)
        mkt_rows = get_records_as_dicts(db, MarketingCampaign)
        hr_rows = get_records_as_dicts(db, Employee)

        summary_rows = [
            {
                "Department": "Sales",
                "Status": "Active" if sales_rows else "No Data Uploaded",
                "Records": len(sales_rows),
                "Key Metric": f"${sum(float(r.get('revenue', 0)) for r in sales_rows):,.2f} Revenue" if sales_rows else "N/A",
            },
            {
                "Department": "Customers",
                "Status": "Active" if cust_rows else "No Data Uploaded",
                "Records": len(cust_rows),
                "Key Metric": f"{len(cust_rows)} Customers" if cust_rows else "N/A",
            },
            {
                "Department": "Inventory",
                "Status": "Active" if inv_rows else "No Data Uploaded",
                "Records": len(inv_rows),
                "Key Metric": f"${sum(float(r.get('inventory_value', 0)) for r in inv_rows):,.2f} Valuation" if inv_rows else "N/A",
            },
            {
                "Department": "Finance",
                "Status": "Active" if fin_rows else "No Data Uploaded",
                "Records": len(fin_rows),
                "Key Metric": f"{len(fin_rows)} Transactions" if fin_rows else "N/A",
            },
            {
                "Department": "Marketing",
                "Status": "Active" if mkt_rows else "No Data Uploaded",
                "Records": len(mkt_rows),
                "Key Metric": f"{len(mkt_rows)} Campaigns" if mkt_rows else "N/A",
            },
            {
                "Department": "HR",
                "Status": "Active" if hr_rows else "No Data Uploaded",
                "Records": len(hr_rows),
                "Key Metric": f"{len(hr_rows)} Employees" if hr_rows else "N/A",
            },
        ]
        sheets["Executive Summary"] = summary_rows

        if sales_rows:
            sheets["Sales"] = sales_rows
        if cust_rows:
            sheets["Customers"] = cust_rows
        if inv_rows:
            sheets["Inventory"] = inv_rows
        if fin_rows:
            sheets["Finance"] = fin_rows
        if mkt_rows:
            sheets["Marketing"] = mkt_rows
        if hr_rows:
            sheets["HR"] = hr_rows

        if format == ReportFormat.EXCEL:
            excel_bytes = generate_multi_sheet_excel(sheets)
            return StreamingResponse(
                iter([excel_bytes]),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=Executive_Board_Report.xlsx"},
            )
        else:
            kpi_dict = {
                "Revenue": f"${sum(float(r.get('revenue', 0)) for r in sales_rows):,.2f}" if sales_rows else "N/A",
                "Customers": f"{len(cust_rows)}" if cust_rows else "N/A",
                "Inventory Val": f"${sum(float(r.get('inventory_value', 0)) for r in inv_rows):,.2f}" if inv_rows else "N/A",
                "Headcount": f"{len(hr_rows)}" if hr_rows else "N/A",
            }
            pdf_bytes = generate_pdf("Executive Overview Report", summary_rows, summary_kpis=kpi_dict)
            return StreamingResponse(
                iter([pdf_bytes]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=Executive_Board_Report.pdf"},
            )

    # Department-specific report
    target_model = dept_models.get(dept)
    if not target_model:
        # Fallback to legacy DataRecord if unknown
        target_model = DataRecord

    records = get_records_as_dicts(db, target_model)
    report_title = f"{dept} Department Audit Report"

    if format == ReportFormat.PDF:
        pdf_bytes = generate_pdf(report_title, records)
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={dept}_Report.pdf"},
        )
    else:
        excel_bytes = generate_excel(report_title, records)
        return StreamingResponse(
            iter([excel_bytes]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={dept}_Report.xlsx"},
        )
