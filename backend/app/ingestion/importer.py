import pandas as pd
from datetime import datetime, date
from typing import Dict, Any, List
from sqlalchemy.orm import Session
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
from app.ml import model as ml_model


def parse_date(val: Any) -> date:
    if pd.isna(val) or val is None or str(val).strip() == "":
        return date.today()
    if isinstance(val, (datetime, pd.Timestamp)):
        return val.date()
    if isinstance(val, date):
        return val
    try:
        return pd.to_datetime(val).date()
    except Exception:
        return date.today()


def clean_num(val: Any, default: float = 0.0) -> float:
    if pd.isna(val) or val is None:
        return default
    try:
        clean_str = str(val).replace("$", "").replace("%", "").replace(",", "").strip()
        return float(clean_str)
    except Exception:
        return default


def clean_int(val: Any, default: int = 0) -> int:
    return int(clean_num(val, float(default)))


def import_department_data(
    df: pd.DataFrame,
    department: str,
    dataset_type: str,
    filename: str,
    username: str,
    db: Session,
) -> Dict[str, Any]:
    """
    Inserts clean records into the designated department database table,
    updates upload history metadata, and recalculates dependent metrics.
    """
    total_rows = len(df)
    imported_count = 0

    if department == "Sales":
        # Delete or append? Usually in analytics imports, we append or update.
        # Let's batch insert into SalesTransaction
        sales_records = []
        data_records_legacy = []

        for idx, row in df.iterrows():
            d = parse_date(row.get("Date"))
            reg = str(row.get("Region", "Global")).strip()
            prod_name = str(row.get("Product", "Item")).strip()
            prod_id = str(row.get("Product ID", f"PROD-{idx+1:04d}")).strip()
            cust_id = str(row.get("Customer ID", f"CUST-{idx+1:04d}")).strip()
            units = clean_int(row.get("Units Sold", 1))
            unit_price = clean_num(row.get("Unit Price", 0.0))
            rev = clean_num(row.get("Revenue", units * unit_price))
            cost = clean_num(row.get("Cost", rev * 0.7))
            profit = clean_num(row.get("Profit", rev - cost))
            margin = clean_num(row.get("Profit Margin", (profit / rev) if rev > 0 else 0.0))

            sales_obj = SalesTransaction(
                date=d,
                region=reg,
                product=prod_name,
                product_id=prod_id,
                customer_id=cust_id,
                units_sold=units,
                unit_price=unit_price,
                revenue=rev,
                cost=cost,
                profit=profit,
                profit_margin=margin,
            )
            sales_records.append(sales_obj)

            # Legacy DataRecord sync
            legacy_obj = DataRecord(
                order_id=f"ORD-S{idx+1:04d}-{cust_id}",
                date=d,
                region=reg,
                category="Sales",
                product=prod_name,
                units_sold=units,
                revenue=rev,
                profit_margin=margin,
                customer_role="Enterprise",
            )
            data_records_legacy.append(legacy_obj)

        db.bulk_save_objects(sales_records)
        # Also sync to DataRecord so legacy sales endpoints and ML remain 100% active
        for lrec in data_records_legacy:
            existing = db.query(DataRecord).filter(DataRecord.order_id == lrec.order_id).first()
            if not existing:
                db.add(lrec)
        db.commit()
        imported_count = len(sales_records)

        # Trigger ML model training for sales
        try:
            if imported_count >= 2:
                train_df = pd.DataFrame([
                    {
                        "units_sold": r.units_sold,
                        "profit_margin": r.profit_margin,
                        "revenue": r.revenue,
                    }
                    for r in sales_records[:1500]
                ])
                ml_model.train_model(train_df)
        except Exception:
            pass

    elif department == "Customers":
        cust_records = []
        for idx, row in df.iterrows():
            cid = str(row.get("Customer ID", f"CUST-{idx+1:04d}")).strip()
            name = str(row.get("Customer Name", "Customer")).strip()
            gender = str(row.get("Gender", "Other")).strip()
            age = clean_int(row.get("Age", 35))
            reg = str(row.get("Region", "Global")).strip()
            seg = str(row.get("Segment", "Enterprise")).strip()
            s_date = parse_date(row.get("Signup Date"))
            orders = clean_int(row.get("Total Orders", 1))
            spend = clean_num(row.get("Total Spend", 1000.0))
            last_p = parse_date(row.get("Last Purchase Date"))
            status = str(row.get("Customer Status", "Active")).strip()
            
            # Simple churn heuristic if not explicitly supplied
            churn_prob = 0.1 if status == "Active" else (0.8 if status == "Churned" else 0.4)

            # Check if customer already exists to update
            existing = db.query(Customer).filter(Customer.customer_id == cid).first()
            if existing:
                existing.customer_name = name
                existing.gender = gender
                existing.age = age
                existing.region = reg
                existing.segment = seg
                existing.signup_date = s_date
                existing.total_orders = orders
                existing.total_spend = spend
                existing.last_purchase_date = last_p
                existing.customer_status = status
                existing.churn_probability = churn_prob
            else:
                cust_obj = Customer(
                    customer_id=cid,
                    customer_name=name,
                    gender=gender,
                    age=age,
                    region=reg,
                    segment=seg,
                    signup_date=s_date,
                    total_orders=orders,
                    total_spend=spend,
                    last_purchase_date=last_p,
                    customer_status=status,
                    churn_probability=churn_prob,
                )
                db.add(cust_obj)
            imported_count += 1
        db.commit()

    elif department == "Products":
        for idx, row in df.iterrows():
            pid = str(row.get("Product ID", f"PROD-{idx+1:04d}")).strip()
            name = str(row.get("Product Name", "Product")).strip()
            cat = str(row.get("Category", "Standard")).strip()
            reg = str(row.get("Region", "Global")).strip()
            cost = clean_num(row.get("Unit Cost", 50.0))
            price = clean_num(row.get("Unit Price", 100.0))
            supp = str(row.get("Supplier", "Direct Supplier")).strip()
            reorder = clean_int(row.get("Reorder Level", 10))

            existing = db.query(Product).filter(Product.product_id == pid).first()
            if existing:
                existing.product_name = name
                existing.category = cat
                existing.region = reg
                existing.unit_cost = cost
                existing.unit_price = price
                existing.supplier = supp
                existing.reorder_level = reorder
            else:
                prod_obj = Product(
                    product_id=pid,
                    product_name=name,
                    category=cat,
                    region=reg,
                    unit_cost=cost,
                    unit_price=price,
                    supplier=supp,
                    reorder_level=reorder,
                )
                db.add(prod_obj)
            imported_count += 1
        db.commit()

    elif department == "Inventory":
        inv_records = []
        for idx, row in df.iterrows():
            pid = str(row.get("Product ID", f"PROD-{idx+1:04d}")).strip()
            name = str(row.get("Product Name", "Item")).strip()
            cat = str(row.get("Category", "General")).strip()
            wh = str(row.get("Warehouse", "Central")).strip()
            qty = clean_int(row.get("Stock Quantity", 0))
            reorder = clean_int(row.get("Reorder Level", 15))
            cost = clean_num(row.get("Unit Cost", 50.0))
            val = qty * cost

            # Determine stock status
            if qty == 0:
                stock_status = "Out of Stock"
            elif qty <= (reorder // 2):
                stock_status = "Critical"
            elif qty <= reorder:
                stock_status = "Low Stock"
            else:
                stock_status = "In Stock"

            last_up = parse_date(row.get("Last Updated"))

            inv_obj = InventoryItem(
                product_id=pid,
                product_name=name,
                category=cat,
                warehouse=wh,
                stock_quantity=qty,
                reorder_level=reorder,
                unit_cost=cost,
                inventory_value=val,
                stock_status=stock_status,
                last_updated=last_up,
            )
            inv_records.append(inv_obj)
        db.bulk_save_objects(inv_records)
        db.commit()
        imported_count = len(inv_records)

    elif department == "Finance":
        fin_records = []
        for idx, row in df.iterrows():
            d = parse_date(row.get("Date"))
            ttype = str(row.get("Transaction Type", "Expense")).strip()
            cat = str(row.get("Category", "Operations")).strip()
            dept = str(row.get("Department", "General")).strip()
            desc = str(row.get("Description", "Business expense")).strip()
            amount = clean_num(row.get("Amount", 0.0))
            budget = clean_num(row.get("Budget", amount))
            actual = clean_num(row.get("Actual Amount", amount))
            variance = budget - actual
            reg = str(row.get("Region", "Global")).strip()

            fin_obj = FinanceTransaction(
                date=d,
                transaction_type=ttype,
                category=cat,
                department=dept,
                description=desc,
                amount=amount,
                budget=budget,
                actual_amount=actual,
                variance=variance,
                region=reg,
            )
            fin_records.append(fin_obj)
        db.bulk_save_objects(fin_records)
        db.commit()
        imported_count = len(fin_records)

    elif department == "Marketing":
        for idx, row in df.iterrows():
            cid = str(row.get("Campaign ID", f"CMP-{idx+1:04d}")).strip()
            name = str(row.get("Campaign Name", "Omnichannel Launch")).strip()
            ch = str(row.get("Channel", "Search")).strip()
            s_date = parse_date(row.get("Start Date"))
            e_date = parse_date(row.get("End Date"))
            reg = str(row.get("Region", "Global")).strip()
            targets = clean_int(row.get("Target Customers", 1000))
            leads = clean_int(row.get("Leads", 100))
            conv = clean_int(row.get("Conversions", 10))
            spend = clean_num(row.get("Marketing Spend", 1000.0))
            rev = clean_num(row.get("Revenue Generated", 2500.0))

            conv_rate = (conv / leads * 100.0) if leads > 0 else 0.0
            roi = ((rev - spend) / spend * 100.0) if spend > 0 else 0.0

            existing = db.query(MarketingCampaign).filter(MarketingCampaign.campaign_id == cid).first()
            if existing:
                existing.campaign_name = name
                existing.channel = ch
                existing.start_date = s_date
                existing.end_date = e_date
                existing.region = reg
                existing.target_customers = targets
                existing.leads = leads
                existing.conversions = conv
                existing.marketing_spend = spend
                existing.revenue_generated = rev
                existing.conversion_rate = conv_rate
                existing.roi = roi
            else:
                mkt_obj = MarketingCampaign(
                    campaign_id=cid,
                    campaign_name=name,
                    channel=ch,
                    start_date=s_date,
                    end_date=e_date,
                    region=reg,
                    target_customers=targets,
                    leads=leads,
                    conversions=conv,
                    marketing_spend=spend,
                    revenue_generated=rev,
                    conversion_rate=conv_rate,
                    roi=roi,
                )
                db.add(mkt_obj)
            imported_count += 1
        db.commit()

    elif department == "HR":
        for idx, row in df.iterrows():
            eid = str(row.get("Employee ID", f"EMP-{idx+1:04d}")).strip()
            name = str(row.get("Employee Name", "Employee")).strip()
            dept = str(row.get("Department", "Engineering")).strip()
            desig = str(row.get("Designation", "Specialist")).strip()
            reg = str(row.get("Region", "Global")).strip()
            j_date = parse_date(row.get("Joining Date"))
            salary = clean_num(row.get("Salary", 75000.0))
            status = str(row.get("Employment Status", "Active")).strip()
            perf = clean_num(row.get("Performance Score", 3.5))
            att = clean_num(row.get("Attendance Percentage", 96.0))
            attr_risk = str(row.get("Attrition Risk", "Low")).strip()

            existing = db.query(Employee).filter(Employee.employee_id == eid).first()
            if existing:
                existing.employee_name = name
                existing.department = dept
                existing.designation = desig
                existing.region = reg
                existing.joining_date = j_date
                existing.salary = salary
                existing.employment_status = status
                existing.performance_score = perf
                existing.attendance_percentage = att
                existing.attrition_risk = attr_risk
            else:
                emp_obj = Employee(
                    employee_id=eid,
                    employee_name=name,
                    department=dept,
                    designation=desig,
                    region=reg,
                    joining_date=j_date,
                    salary=salary,
                    employment_status=status,
                    performance_score=perf,
                    attendance_percentage=att,
                    attrition_risk=attr_risk,
                )
                db.add(emp_obj)
            imported_count += 1
        db.commit()

    # Record into UploadHistory
    history_entry = UploadHistory(
        file_name=filename,
        department=department,
        dataset_type=dataset_type,
        uploaded_by=username,
        total_rows=total_rows,
        valid_rows=imported_count,
        invalid_rows=total_rows - imported_count,
        warnings_count=0,
        status="Success",
    )
    db.add(history_entry)
    db.commit()

    return {
        "success": True,
        "department": department,
        "dataset_type": dataset_type,
        "imported_rows": imported_count,
        "message": f"Successfully imported {imported_count} records into {department} ({dataset_type}).",
    }
