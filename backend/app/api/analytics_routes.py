from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
import pandas as pd

from app.database import get_db
from app.auth.schemas import TokenData
from app.auth.security import get_current_user
from app.data.department_models import (
    SalesTransaction,
    Customer,
    Product,
    InventoryItem,
    FinanceTransaction,
    MarketingCampaign,
    Employee,
    UploadHistory,
)
from app.data.models import DataRecord

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/status")
def get_departments_status(db: Session = Depends(get_db)):
    """Check dataset availability for every department."""
    sales_cnt = db.query(SalesTransaction).count() or db.query(DataRecord).count()
    cust_cnt = db.query(Customer).count()
    prod_cnt = db.query(Product).count()
    inv_cnt = db.query(InventoryItem).count()
    fin_cnt = db.query(FinanceTransaction).count()
    mkt_cnt = db.query(MarketingCampaign).count()
    hr_cnt = db.query(Employee).count()

    return {
        "Sales": {"has_data": sales_cnt > 0, "count": sales_cnt},
        "Customers": {"has_data": cust_cnt > 0, "count": cust_cnt},
        "Products": {"has_data": prod_cnt > 0, "count": prod_cnt},
        "Inventory": {"has_data": inv_cnt > 0, "count": inv_cnt},
        "Finance": {"has_data": fin_cnt > 0, "count": fin_cnt},
        "Marketing": {"has_data": mkt_cnt > 0, "count": mkt_cnt},
        "HR": {"has_data": hr_cnt > 0, "count": hr_cnt},
    }


@router.get("/executive")
def get_executive_overview(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """
    Combines live data from all uploaded department tables.
    Returns real database metrics with proper empty flags. Zero fake numbers.
    """
    # 1. Sales Data
    sales = db.query(SalesTransaction).all()
    if not sales:
        # Fallback to legacy DataRecord if sales_transactions is empty
        legacy_records = db.query(DataRecord).all()
        has_sales = len(legacy_records) > 0
        total_revenue = sum(float(r.revenue or 0) for r in legacy_records) if has_sales else 0.0
        total_units = sum(int(r.units_sold or 0) for r in legacy_records) if has_sales else 0
        total_profit = sum(float(r.revenue or 0) * float(r.profit_margin or 0) for r in legacy_records) if has_sales else 0.0
        avg_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0.0
        sales_orders = len(legacy_records)
    else:
        has_sales = True
        total_revenue = sum(float(s.revenue or 0) for s in sales)
        total_units = sum(int(s.units_sold or 0) for s in sales)
        total_profit = sum(float(s.profit or 0) for s in sales)
        avg_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0.0
        sales_orders = len(sales)

    # 2. Customers Data
    customers = db.query(Customer).all()
    has_customers = len(customers) > 0
    total_customers = len(customers)
    active_customers = len([c for c in customers if c.customer_status == "Active"])
    churned_customers = len([c for c in customers if c.customer_status == "Churned"])
    avg_customer_spend = (sum(float(c.total_spend or 0) for c in customers) / total_customers) if total_customers > 0 else 0.0

    # 3. Inventory Data
    inventory = db.query(InventoryItem).all()
    has_inventory = len(inventory) > 0
    total_inventory_value = sum(float(i.inventory_value or 0) for i in inventory)
    low_stock_count = len([i for i in inventory if i.stock_status in ["Low Stock", "Critical"]])
    out_of_stock_count = len([i for i in inventory if i.stock_status == "Out of Stock"])

    # 4. Finance Data
    finance = db.query(FinanceTransaction).all()
    has_finance = len(finance) > 0
    fin_revenue = sum(float(f.amount or 0) for f in finance if f.transaction_type.lower() == "revenue")
    fin_expenses = sum(float(f.amount or 0) for f in finance if f.transaction_type.lower() == "expense")
    fin_net_profit = fin_revenue - fin_expenses
    fin_variance = sum(float(f.variance or 0) for f in finance)

    # 5. Marketing Data
    marketing = db.query(MarketingCampaign).all()
    has_marketing = len(marketing) > 0
    total_mkt_spend = sum(float(m.marketing_spend or 0) for m in marketing)
    total_mkt_rev = sum(float(m.revenue_generated or 0) for m in marketing)
    overall_roi = ((total_mkt_rev - total_mkt_spend) / total_mkt_spend * 100) if total_mkt_spend > 0 else 0.0
    total_leads = sum(int(m.leads or 0) for m in marketing)
    total_conversions = sum(int(m.conversions or 0) for m in marketing)

    # 6. HR Data
    employees = db.query(Employee).all()
    has_hr = len(employees) > 0
    total_employees = len(employees)
    active_employees = len([e for e in employees if e.employment_status == "Active"])
    avg_attendance = (sum(float(e.attendance_percentage or 0) for e in employees) / total_employees) if total_employees > 0 else 0.0
    high_attrition_count = len([e for e in employees if e.attrition_risk == "High"])

    # Cross-Department Analytics:
    # A. Top revenue customers (Sales join Customers)
    top_revenue_customers = []
    if has_sales:
        cust_rev_map = {}
        for s in (sales if sales else []):
            cid = s.customer_id
            cust_rev_map[cid] = cust_rev_map.get(cid, 0.0) + float(s.revenue or 0)
        sorted_custs = sorted(cust_rev_map.items(), key=lambda x: x[1], reverse=True)[:5]
        
        c_names = {c.customer_id: c.customer_name for c in customers}
        for cid, r_val in sorted_custs:
            top_revenue_customers.append({
                "customer_id": cid,
                "customer_name": c_names.get(cid, f"Customer {cid}"),
                "revenue": round(r_val, 2),
            })

    # B. High sales but low inventory products
    high_sales_low_inventory = []
    if has_sales and has_inventory:
        prod_sales_vol = {}
        for s in (sales if sales else []):
            pid = s.product_id
            prod_sales_vol[pid] = prod_sales_vol.get(pid, 0) + int(s.units_sold or 0)

        inv_map = {i.product_id: i for i in inventory}
        for pid, vol in sorted(prod_sales_vol.items(), key=lambda x: x[1], reverse=True):
            if pid in inv_map:
                inv_item = inv_map[pid]
                if inv_item.stock_quantity <= inv_item.reorder_level:
                    high_sales_low_inventory.append({
                        "product_id": pid,
                        "product_name": inv_item.product_name,
                        "units_sold": vol,
                        "stock_quantity": inv_item.stock_quantity,
                        "reorder_level": inv_item.reorder_level,
                        "stock_status": inv_item.stock_status,
                    })
        high_sales_low_inventory = high_sales_low_inventory[:5]

    # C. Products at risk of stockout
    stockout_risks = []
    if has_inventory:
        for i in inventory:
            if i.stock_status in ["Critical", "Low Stock", "Out of Stock"]:
                stockout_risks.append({
                    "product_id": i.product_id,
                    "product_name": i.product_name,
                    "warehouse": i.warehouse,
                    "stock_quantity": i.stock_quantity,
                    "reorder_level": i.reorder_level,
                    "status": i.stock_status,
                })
        stockout_risks = stockout_risks[:6]

    # D. Top Marketing Channels
    channel_perf = []
    if has_marketing:
        ch_rev = {}
        for m in marketing:
            ch_rev[m.channel] = ch_rev.get(m.channel, 0.0) + float(m.revenue_generated or 0)
        channel_perf = [
            {"channel": ch, "revenue": round(val, 2)}
            for ch, val in sorted(ch_rev.items(), key=lambda x: x[1], reverse=True)
        ]

    # Top KPI cards
    cards = [
        {"label": "Total Revenue", "value": f"${total_revenue:,.2f}" if has_sales else "Unavailable", "has_data": has_sales, "dept": "Sales"},
        {"label": "Gross Profit", "value": f"${total_profit:,.2f}" if has_sales else "Unavailable", "has_data": has_sales, "dept": "Sales"},
        {"label": "Profit Margin", "value": f"{avg_margin:.1f}%" if has_sales else "Unavailable", "has_data": has_sales, "dept": "Sales"},
        {"label": "Customers", "value": f"{total_customers:,}" if has_customers else "Unavailable", "has_data": has_customers, "dept": "Customers"},
        {"label": "Orders", "value": f"{sales_orders:,}" if has_sales else "Unavailable", "has_data": has_sales, "dept": "Sales"},
        {"label": "Inventory Value", "value": f"${total_inventory_value:,.2f}" if has_inventory else "Unavailable", "has_data": has_inventory, "dept": "Inventory"},
        {"label": "Marketing ROI", "value": f"{overall_roi:.1f}%" if has_marketing else "Unavailable", "has_data": has_marketing, "dept": "Marketing"},
        {"label": "Employees", "value": f"{total_employees:,}" if has_hr else "Unavailable", "has_data": has_hr, "dept": "HR"},
    ]

    return {
        "cards": cards,
        "departments": {
            "Sales": {
                "has_data": has_sales,
                "revenue": total_revenue,
                "profit": total_profit,
                "margin": avg_margin,
                "units": total_units,
                "orders": sales_orders,
            },
            "Customers": {
                "has_data": has_customers,
                "total": total_customers,
                "active": active_customers,
                "churned": churned_customers,
                "avg_spend": avg_customer_spend,
            },
            "Inventory": {
                "has_data": has_inventory,
                "total_value": total_inventory_value,
                "sku_count": len(inventory),
                "low_stock": low_stock_count,
                "out_of_stock": out_of_stock_count,
            },
            "Finance": {
                "has_data": has_finance,
                "revenue": fin_revenue,
                "expenses": fin_expenses,
                "net_profit": fin_net_profit,
                "variance": fin_variance,
            },
            "Marketing": {
                "has_data": has_marketing,
                "campaigns": len(marketing),
                "spend": total_mkt_spend,
                "revenue": total_mkt_rev,
                "roi": overall_roi,
                "leads": total_leads,
                "conversions": total_conversions,
            },
            "HR": {
                "has_data": has_hr,
                "total_employees": total_employees,
                "active_employees": active_employees,
                "avg_attendance": avg_attendance,
                "high_attrition": high_attrition_count,
            },
        },
        "cross_analytics": {
            "top_revenue_customers": top_revenue_customers,
            "high_sales_low_inventory": high_sales_low_inventory,
            "stockout_risks": stockout_risks,
            "channel_performance": channel_perf,
        },
    }


@router.get("/sales")
def get_sales_analytics(db: Session = Depends(get_db)):
    sales = db.query(SalesTransaction).all()
    if not sales:
        # Check legacy DataRecord
        legacy = db.query(DataRecord).all()
        if not legacy:
            return {"has_data": False, "message": "No Sales dataset has been uploaded yet."}
        # Build from legacy
        total_rev = sum(float(r.revenue or 0) for r in legacy)
        total_units = sum(int(r.units_sold or 0) for r in legacy)
        total_profit = sum(float(r.revenue or 0) * float(r.profit_margin or 0) for r in legacy)
        avg_margin = (total_profit / total_rev * 100) if total_rev > 0 else 0.0

        # Region
        reg_map = {}
        for r in legacy:
            reg_map[r.region] = reg_map.get(r.region, 0.0) + float(r.revenue or 0)
        region_chart = [{"region": k, "revenue": round(v, 2)} for k, v in reg_map.items()]

        # Product
        prod_map = {}
        for r in legacy:
            prod_map[r.product] = prod_map.get(r.product, 0.0) + float(r.revenue or 0)
        product_chart = [{"product": k, "revenue": round(v, 2)} for k, v in sorted(prod_map.items(), key=lambda x: x[1], reverse=True)[:5]]

        # Trend
        date_map = {}
        for r in legacy:
            d_str = str(r.date)
            date_map[d_str] = date_map.get(d_str, 0.0) + float(r.revenue or 0)
        trend_chart = [{"date": k, "revenue": round(v, 2)} for k, v in sorted(date_map.items())[-10:]]

        return {
            "has_data": True,
            "metrics": {
                "total_revenue": total_rev,
                "total_profit": total_profit,
                "profit_margin": avg_margin,
                "units_sold": total_units,
                "orders": len(legacy),
            },
            "charts": {
                "regional": region_chart,
                "by_product": product_chart,
                "revenue_trend": trend_chart,
            }
        }

    total_rev = sum(float(s.revenue or 0) for s in sales)
    total_units = sum(int(s.units_sold or 0) for s in sales)
    total_profit = sum(float(s.profit or 0) for s in sales)
    avg_margin = (total_profit / total_rev * 100) if total_rev > 0 else 0.0

    # Regional breakdown
    reg_map = {}
    for s in sales:
        reg_map[s.region] = reg_map.get(s.region, 0.0) + float(s.revenue or 0)
    region_chart = [{"region": k, "revenue": round(v, 2)} for k, v in reg_map.items()]

    # Product breakdown
    prod_map = {}
    for s in sales:
        prod_map[s.product] = prod_map.get(s.product, 0.0) + float(s.revenue or 0)
    product_chart = [{"product": k, "revenue": round(v, 2)} for k, v in sorted(prod_map.items(), key=lambda x: x[1], reverse=True)[:6]]

    # Trend by date
    date_map = {}
    profit_date_map = {}
    for s in sales:
        d_str = str(s.date)
        date_map[d_str] = date_map.get(d_str, 0.0) + float(s.revenue or 0)
        profit_date_map[d_str] = profit_date_map.get(d_str, 0.0) + float(s.profit or 0)

    trend_chart = [
        {"date": k, "revenue": round(v, 2), "profit": round(profit_date_map.get(k, 0), 2)}
        for k, v in sorted(date_map.items())[-12:]
    ]

    return {
        "has_data": True,
        "metrics": {
            "total_revenue": total_rev,
            "total_profit": total_profit,
            "profit_margin": avg_margin,
            "units_sold": total_units,
            "orders": len(sales),
        },
        "charts": {
            "regional": region_chart,
            "by_product": product_chart,
            "revenue_trend": trend_chart,
        }
    }


@router.get("/customers")
def get_customers_analytics(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    if not customers:
        return {"has_data": False, "message": "No Customer dataset has been uploaded yet."}

    total = len(customers)
    active = len([c for c in customers if c.customer_status == "Active"])
    churned = len([c for c in customers if c.customer_status == "Churned"])
    returning = len([c for c in customers if (c.total_orders or 0) > 1])
    new_custs = total - returning
    total_spend = sum(float(c.total_spend or 0) for c in customers)
    avg_spend = total_spend / total if total > 0 else 0.0

    # Regional
    reg_map = {}
    for c in customers:
        reg_map[c.region] = reg_map.get(c.region, 0) + 1
    region_chart = [{"region": k, "count": v} for k, v in reg_map.items()]

    # Segment
    seg_map = {}
    for c in customers:
        seg_map[c.segment] = seg_map.get(c.segment, 0) + 1
    segment_chart = [{"segment": k, "count": v} for k, v in seg_map.items()]

    # Status Breakdown
    status_chart = [
        {"status": "Active", "count": active},
        {"status": "Churned", "count": churned},
        {"status": "Inactive", "count": total - active - churned},
    ]

    return {
        "has_data": True,
        "metrics": {
            "total_customers": total,
            "active_customers": active,
            "churned_customers": churned,
            "returning_customers": returning,
            "new_customers": new_custs,
            "average_spend": avg_spend,
        },
        "charts": {
            "regional": region_chart,
            "segment": segment_chart,
            "status": status_chart,
        }
    }


@router.get("/inventory")
def get_inventory_analytics(db: Session = Depends(get_db)):
    items = db.query(InventoryItem).all()
    if not items:
        return {"has_data": False, "message": "No Inventory dataset has been uploaded yet."}

    total_val = sum(float(i.inventory_value or 0) for i in items)
    low_stock = len([i for i in items if i.stock_status == "Low Stock"])
    critical = len([i for i in items if i.stock_status == "Critical"])
    out_of_stock = len([i for i in items if i.stock_status == "Out of Stock"])
    in_stock = len([i for i in items if i.stock_status == "In Stock"])

    # Category breakdown
    cat_val = {}
    for i in items:
        cat_val[i.category] = cat_val.get(i.category, 0.0) + float(i.inventory_value or 0)
    category_chart = [{"category": k, "value": round(v, 2)} for k, v in cat_val.items()]

    # Status breakdown
    status_chart = [
        {"status": "In Stock", "count": in_stock},
        {"status": "Low Stock", "count": low_stock},
        {"status": "Critical", "count": critical},
        {"status": "Out of Stock", "count": out_of_stock},
    ]

    # Warehouse breakdown
    wh_val = {}
    for i in items:
        wh_val[i.warehouse] = wh_val.get(i.warehouse, 0.0) + float(i.inventory_value or 0)
    warehouse_chart = [{"warehouse": k, "value": round(v, 2)} for k, v in wh_val.items()]

    return {
        "has_data": True,
        "metrics": {
            "inventory_value": total_val,
            "total_skus": len(items),
            "low_stock": low_stock,
            "critical_stock": critical,
            "out_of_stock": out_of_stock,
        },
        "charts": {
            "by_category": category_chart,
            "status": status_chart,
            "by_warehouse": warehouse_chart,
        }
    }


@router.get("/finance")
def get_finance_analytics(db: Session = Depends(get_db)):
    txs = db.query(FinanceTransaction).all()
    if not txs:
        return {"has_data": False, "message": "No Financial dataset has been uploaded yet."}

    rev = sum(float(t.amount or 0) for t in txs if t.transaction_type.lower() == "revenue")
    exp = sum(float(t.amount or 0) for t in txs if t.transaction_type.lower() == "expense")
    net_profit = rev - exp
    margin = (net_profit / rev * 100) if rev > 0 else 0.0
    tot_budget = sum(float(t.budget or 0) for t in txs)
    tot_actual = sum(float(t.actual_amount or 0) for t in txs)
    variance = tot_budget - tot_actual

    # Category breakdown for expenses
    exp_cat = {}
    for t in txs:
        if t.transaction_type.lower() == "expense":
            exp_cat[t.category] = exp_cat.get(t.category, 0.0) + float(t.amount or 0)
    category_chart = [{"category": k, "amount": round(v, 2)} for k, v in exp_cat.items()]

    # Budget vs Actual by Department
    dept_bva = {}
    for t in txs:
        d = t.department
        if d not in dept_bva:
            dept_bva[d] = {"budget": 0.0, "actual": 0.0}
        dept_bva[d]["budget"] += float(t.budget or 0)
        dept_bva[d]["actual"] += float(t.actual_amount or 0)

    bva_chart = [
        {"department": k, "budget": round(v["budget"], 2), "actual": round(v["actual"], 2)}
        for k, v in dept_bva.items()
    ]

    return {
        "has_data": True,
        "metrics": {
            "revenue": rev,
            "expenses": exp,
            "net_profit": net_profit,
            "margin": margin,
            "budget_variance": variance,
        },
        "charts": {
            "expenses_by_category": category_chart,
            "budget_vs_actual": bva_chart,
        }
    }


@router.get("/marketing")
def get_marketing_analytics(db: Session = Depends(get_db)):
    cmps = db.query(MarketingCampaign).all()
    if not cmps:
        return {"has_data": False, "message": "No Marketing dataset has been uploaded yet."}

    spend = sum(float(c.marketing_spend or 0) for c in cmps)
    rev = sum(float(c.revenue_generated or 0) for c in cmps)
    leads = sum(int(c.leads or 0) for c in cmps)
    conv = sum(int(c.conversions or 0) for c in cmps)
    avg_conv_rate = (conv / leads * 100) if leads > 0 else 0.0
    overall_roi = ((rev - spend) / spend * 100) if spend > 0 else 0.0

    # Channel ROI
    ch_map = {}
    for c in cmps:
        ch = c.channel
        if ch not in ch_map:
            ch_map[ch] = {"spend": 0.0, "revenue": 0.0}
        ch_map[ch]["spend"] += float(c.marketing_spend or 0)
        ch_map[ch]["revenue"] += float(c.revenue_generated or 0)

    channel_chart = [
        {
            "channel": k,
            "spend": round(v["spend"], 2),
            "revenue": round(v["revenue"], 2),
            "roi": round(((v["revenue"] - v["spend"]) / v["spend"] * 100) if v["spend"] > 0 else 0.0, 1),
        }
        for k, v in ch_map.items()
    ]

    campaign_table = [
        {
            "campaign_id": c.campaign_id,
            "campaign_name": c.campaign_name,
            "channel": c.channel,
            "spend": c.marketing_spend,
            "revenue": c.revenue_generated,
            "roi": c.roi,
            "conversion_rate": c.conversion_rate,
        }
        for c in cmps[:8]
    ]

    return {
        "has_data": True,
        "metrics": {
            "campaigns": len(cmps),
            "leads": leads,
            "conversions": conv,
            "marketing_spend": spend,
            "conversion_rate": avg_conv_rate,
            "roi": overall_roi,
        },
        "charts": {
            "channel_roi": channel_chart,
            "campaign_performance": campaign_table,
        }
    }


@router.get("/hr")
def get_hr_analytics(db: Session = Depends(get_db)):
    emps = db.query(Employee).all()
    if not emps:
        return {"has_data": False, "message": "No HR dataset has been uploaded yet."}

    total = len(emps)
    active = len([e for e in emps if e.employment_status == "Active"])
    resigned = len([e for e in emps if e.employment_status in ["Resigned", "Terminated"]])
    attrition_rate = (resigned / total * 100) if total > 0 else 0.0
    avg_att = (sum(float(e.attendance_percentage or 0) for e in emps) / total) if total > 0 else 0.0
    avg_perf = (sum(float(e.performance_score or 0) for e in emps) / total) if total > 0 else 0.0

    # Dept breakdown
    dept_map = {}
    for e in emps:
        dept_map[e.department] = dept_map.get(e.department, 0) + 1
    dept_chart = [{"department": k, "count": v} for k, v in dept_map.items()]

    # Region breakdown
    reg_map = {}
    for e in emps:
        reg_map[e.region] = reg_map.get(e.region, 0) + 1
    region_chart = [{"region": k, "count": v} for k, v in reg_map.items()]

    # Attrition Risk
    risk_chart = [
        {"risk": "Low", "count": len([e for e in emps if e.attrition_risk == "Low"])},
        {"risk": "Medium", "count": len([e for e in emps if e.attrition_risk == "Medium"])},
        {"risk": "High", "count": len([e for e in emps if e.attrition_risk == "High"])},
    ]

    return {
        "has_data": True,
        "metrics": {
            "total_employees": total,
            "active_employees": active,
            "attrition_rate": attrition_rate,
            "avg_attendance": avg_att,
            "avg_performance": avg_perf,
        },
        "charts": {
            "by_department": dept_chart,
            "by_region": region_chart,
            "attrition_risk": risk_chart,
        }
    }


@router.get("/records/{department}")
def get_department_records(
    department: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Data Explorer endpoint returning paginated records for any department."""
    offset = (page - 1) * limit

    model_map = {
        "Sales": SalesTransaction,
        "Customers": Customer,
        "Products": Product,
        "Inventory": InventoryItem,
        "Finance": FinanceTransaction,
        "Marketing": MarketingCampaign,
        "HR": Employee,
    }

    model = model_map.get(department)
    if not model:
        raise HTTPException(status_code=400, detail=f"Invalid department '{department}'.")

    query = db.query(model)
    total_count = query.count()
    rows = query.offset(offset).limit(limit).all()

    # Convert records to dict
    records = []
    for r in rows:
        d = {}
        for col in r.__table__.columns:
            val = getattr(r, col.name)
            if hasattr(val, "isoformat"):
                val = val.isoformat()
            d[col.name] = val
        records.append(d)

    return {
        "department": department,
        "total_records": total_count,
        "page": page,
        "limit": limit,
        "records": records,
    }
