import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Tuple
from sqlalchemy.orm import Session
from app.ingestion.schemas import DEPARTMENT_CONFIGS
from app.data.department_models import Customer, Product

def normalize_column_name(col: str) -> str:
    """Normalize column header for robust matching."""
    return str(col).strip().replace("_", " ").lower()

GLOBAL_ALIAS_MAP = {
    # Date aliases
    "sale date": "Date",
    "sale_date": "Date",
    "order date": "Date",
    "order_date": "Date",
    "transaction date": "Date",
    "transaction_date": "Date",
    "timestamp": "Date",
    "datetime": "Date",
    "ship date": "Date",
    "ship_date": "Date",
    # Revenue / Sales Amount aliases
    "sales amount": "Revenue",
    "sales_amount": "Revenue",
    "sales": "Revenue",
    "total revenue": "Revenue",
    "total_revenue": "Revenue",
    "total sales": "Revenue",
    "total_sales": "Revenue",
    "total amount": "Revenue",
    "total_amount": "Revenue",
    "amount": "Revenue",
    # Units / Quantity aliases
    "quantity sold": "Units Sold",
    "quantity_sold": "Units Sold",
    "quantity": "Units Sold",
    "qty": "Units Sold",
    "units": "Units Sold",
    "volume": "Units Sold",
    # Product / Category aliases
    "product category": "Product",
    "product_category": "Product",
    "product name": "Product",
    "product_name": "Product",
    "item": "Product",
    "item name": "Product",
    "item type": "Product",
    "item_type": "Product",
    "category": "Product",
    # Product ID aliases
    "item id": "Product ID",
    "sku": "Product ID",
    "product code": "Product ID",
    "order id": "Product ID",
    "order_id": "Product ID",
    # Customer / Sales Rep aliases
    "customer": "Customer ID",
    "customer name": "Customer ID",
    "client id": "Customer ID",
    "client": "Customer ID",
    "account id": "Customer ID",
    "sales rep": "Customer ID",
    "sales_rep": "Customer ID",
    "salesperson": "Customer ID",
    # Region / Country
    "country": "Region",
    "market": "Region",
    "territory": "Region",
    # Price
    "price": "Unit Price",
    "unit price": "Unit Price",
    # Cost
    "unit cost": "Cost",
    "cogs": "Cost",
    "total cost": "Cost",
    # Margin
    "margin": "Profit Margin",
    "profit": "Profit Margin",
    "profit_margin": "Profit Margin",
    "gross margin": "Profit Margin",
}

def make_records_json_safe(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Convert pandas/numpy values (NaN, NaT, Inf, int64, Timestamps) to JSON-compliant primitives."""
    safe_records = []
    for r in records:
        clean_row = {}
        for k, v in r.items():
            if pd.isna(v) or v is None:
                clean_row[str(k)] = ""
            elif isinstance(v, (float, np.floating)):
                if np.isnan(v) or np.isinf(v):
                    clean_row[str(k)] = 0.0
                else:
                    clean_row[str(k)] = round(float(v), 4)
            elif isinstance(v, (int, np.integer)):
                clean_row[str(k)] = int(v)
            elif isinstance(v, (datetime, pd.Timestamp)):
                clean_row[str(k)] = v.strftime("%Y-%m-%d")
            else:
                clean_row[str(k)] = str(v)
        safe_records.append(clean_row)
    return safe_records

def validate_dataset(
    df: pd.DataFrame,
    department: str,
    db: Session,
    flexible_mode: bool = False,
) -> Tuple[Dict[str, Any], pd.DataFrame]:
    """
    Validates the dataset against department schema rules, data types, missing values,
    duplicates, value ranges, and relational foreign references.
    If flexible_mode is True, missing columns are automatically populated with intelligent defaults.
    """
    config = DEPARTMENT_CONFIGS.get(department)
    if not config:
        raise ValueError(f"Unknown department: {department}")

    required_cols = config["required_columns"]
    col_types = config["column_types"]

    errors: List[Dict[str, Any]] = []
    warnings: List[Dict[str, Any]] = []

    # 0. Clean completely blank or whitespace-only rows
    initial_row_count = len(df)
    df = df.dropna(how="all").copy()
    if not df.empty:
        non_blank_mask = df.astype(str).apply(
            lambda row: any(val.strip() not in ["", "nan", "none", "null"] for val in row),
            axis=1,
        )
        df = df[non_blank_mask].copy()

    if df.empty:
        return {
            "total_rows": initial_row_count,
            "valid_rows": 0,
            "invalid_rows": initial_row_count,
            "warnings_count": 0,
            "status": "Validation Failed: File Contains No Data",
            "can_import": False,
            "errors": [{
                "row": 0,
                "column": "File Content",
                "error": f"The uploaded file has {initial_row_count} rows, but all data rows are completely blank. Please populate data rows before ingesting.",
                "severity": "Critical",
            }],
            "preview": [],
        }, df

    # 1. Map columns case-insensitively and through alias mapping
    actual_cols = list(df.columns)
    col_mapping = {}
    normalized_actual = {normalize_column_name(c): c for c in actual_cols}

    for req in required_cols:
        norm_req = normalize_column_name(req)
        if norm_req in normalized_actual:
            col_mapping[normalized_actual[norm_req]] = req
        elif norm_req.replace(" ", "") in [normalize_column_name(c).replace(" ", "") for c in actual_cols]:
            for c in actual_cols:
                if normalize_column_name(c).replace(" ", "") == norm_req.replace(" ", ""):
                    col_mapping[c] = req
                    break

    # Apply alias mapping for unmatched actual columns
    for actual_c in actual_cols:
        if actual_c not in col_mapping:
            norm_actual = normalize_column_name(actual_c)
            if norm_actual in GLOBAL_ALIAS_MAP:
                target_req = GLOBAL_ALIAS_MAP[norm_actual]
                if target_req in required_cols and target_req not in col_mapping.values():
                    col_mapping[actual_c] = target_req
                    warnings.append({
                        "row": 0,
                        "column": actual_c,
                        "error": f"Auto-mapped column '{actual_c}' to required schema column '{target_req}'.",
                        "severity": "Warning",
                    })

    # Rename matched columns to canonical schema names
    df = df.rename(columns=col_mapping).copy()

    # If flexible mode is active, automatically synthesize missing columns for any department
    if flexible_mode:
        for req in required_cols:
            if req not in df.columns:
                expected_t = col_types.get(req, "string")
                if req == "Revenue":
                    if "Units Sold" in df.columns and "Unit Price" in df.columns:
                        df["Revenue"] = pd.to_numeric(df["Units Sold"], errors="coerce").fillna(1) * pd.to_numeric(df["Unit Price"], errors="coerce").fillna(100.0)
                    else:
                        df["Revenue"] = 100.0
                elif req == "Cost":
                    rev = df["Revenue"] if "Revenue" in df.columns else 100.0
                    df["Cost"] = pd.to_numeric(rev, errors="coerce").fillna(100.0) * 0.70
                elif req == "Profit Margin":
                    df["Profit Margin"] = 0.30
                elif req == "Date":
                    df["Date"] = datetime.now().strftime("%Y-%m-%d")
                elif req == "Region":
                    df["Region"] = df["Country"] if "Country" in df.columns else "North America"
                elif req in ["Product ID", "Item ID"]:
                    df[req] = [f"PROD-{i+1:04d}" for i in range(len(df))]
                elif req in ["Customer ID", "Client ID"]:
                    df[req] = [f"CUST-{i+1:04d}" for i in range(len(df))]
                elif req == "Employee ID":
                    df[req] = [f"EMP-{i+1:04d}" for i in range(len(df))]
                elif req == "Campaign ID":
                    df[req] = [f"CMP-{i+1:04d}" for i in range(len(df))]
                elif expected_t == "integer":
                    df[req] = 1
                elif expected_t == "float":
                    df[req] = 100.0
                elif expected_t == "date":
                    df[req] = datetime.now().strftime("%Y-%m-%d")
                else:
                    df[req] = f"Standard {req}"

                warnings.append({
                    "row": 0,
                    "column": req,
                    "error": f"Flexible schema adaptation: Auto-generated missing column '{req}' with intelligent defaults.",
                    "severity": "Warning",
                })

    # Auto-derive missing optional columns for Sales if primary fields exist
    if department == "Sales":
        if "Revenue" in df.columns:
            if "Units Sold" not in df.columns:
                df["Units Sold"] = 1
                warnings.append({
                    "row": 0,
                    "column": "Units Sold",
                    "error": "Defaulted missing 'Units Sold' to 1 per transaction.",
                    "severity": "Warning",
                })
            if "Unit Price" not in df.columns:
                df["Unit Price"] = pd.to_numeric(df["Revenue"], errors="coerce").fillna(0) / pd.to_numeric(df["Units Sold"], errors="coerce").replace(0, 1)
                warnings.append({
                    "row": 0,
                    "column": "Unit Price",
                    "error": "Auto-calculated missing 'Unit Price' from Revenue / Units Sold.",
                    "severity": "Warning",
                })
            if "Cost" not in df.columns:
                df["Cost"] = pd.to_numeric(df["Revenue"], errors="coerce").fillna(0) * 0.70
                warnings.append({
                    "row": 0,
                    "column": "Cost",
                    "error": "Auto-estimated missing 'Cost' as 70% of Revenue.",
                    "severity": "Warning",
                })
            if "Profit Margin" not in df.columns:
                df["Profit Margin"] = 0.30
                warnings.append({
                    "row": 0,
                    "column": "Profit Margin",
                    "error": "Auto-estimated missing 'Profit Margin' as 30%.",
                    "severity": "Warning",
                })

        if "Region" not in df.columns:
            if "Country" in df.columns:
                df["Region"] = df["Country"]
                warnings.append({
                    "row": 0,
                    "column": "Region",
                    "error": "Mapped missing 'Region' from 'Country'.",
                    "severity": "Warning",
                })
            else:
                df["Region"] = "North America"
                warnings.append({
                    "row": 0,
                    "column": "Region",
                    "error": "Defaulted missing 'Region' to 'North America'.",
                    "severity": "Warning",
                })

        if "Product" not in df.columns:
            df["Product"] = "Enterprise Standard Product"
            warnings.append({
                "row": 0,
                "column": "Product",
                "error": "Defaulted missing 'Product' to 'Enterprise Standard Product'.",
                "severity": "Warning",
            })

        if "Product ID" not in df.columns:
            df["Product ID"] = [f"PROD-{i+1:04d}" for i in range(len(df))]
            warnings.append({
                "row": 0,
                "column": "Product ID",
                "error": "Generated sequential IDs for missing 'Product ID'.",
                "severity": "Warning",
            })

        if "Customer ID" not in df.columns:
            df["Customer ID"] = [f"CUST-{i+1:04d}" for i in range(len(df))]
            warnings.append({
                "row": 0,
                "column": "Customer ID",
                "error": "Generated sequential IDs for missing 'Customer ID'.",
                "severity": "Warning",
            })

        if "Date" not in df.columns:
            df["Date"] = datetime.now().strftime("%Y-%m-%d")
            warnings.append({
                "row": 0,
                "column": "Date",
                "error": "Defaulted missing 'Date' to today's date.",
                "severity": "Warning",
            })

    # Check for missing required columns
    missing_cols = [c for c in required_cols if c not in df.columns]
    for mc in missing_cols:
        errors.append({
            "row": 0,
            "column": mc,
            "error": f"Required column '{mc}' is missing from the dataset.",
            "severity": "Critical",
        })

    # Check for unexpected extra columns (Warning)
    extra_cols = [c for c in df.columns if c not in required_cols]
    if extra_cols:
        warnings.append({
            "row": 0,
            "column": ", ".join(extra_cols[:5]),
            "error": f"Unexpected columns found: {', '.join(extra_cols[:5])}{'...' if len(extra_cols) > 5 else ''}. They will be omitted during import.",
            "severity": "Warning",
        })

    # If critical column errors occur, return early with 0 valid rows
    if missing_cols:
        return {
            "total_rows": len(df),
            "valid_rows": 0,
            "invalid_rows": len(df),
            "warnings_count": len(warnings),
            "status": "Validation Failed: Missing Schema Columns",
            "can_import": False,
            "errors": errors + warnings,
            "preview": make_records_json_safe(df.head(30).to_dict(orient="records")),
        }, df

    total_rows = len(df)
    invalid_row_indices = set()

    # 2. Check Duplicate IDs
    id_col_map = {
        "Customers": "Customer ID",
        "Products": "Product ID",
        "Marketing": "Campaign ID",
        "HR": "Employee ID",
    }
    target_id_col = id_col_map.get(department)
    if target_id_col and target_id_col in df.columns:
        dupes = df[df.duplicated(subset=[target_id_col], keep=False)]
        for idx, row in dupes.iterrows():
            row_num = int(idx) + 1
            invalid_row_indices.add(row_num)
            errors.append({
                "row": row_num,
                "column": target_id_col,
                "error": f"Duplicate primary key '{row[target_id_col]}' detected.",
                "severity": "Critical",
            })

    # 3. Relational Foreign Key Integrity Checks
    # For Sales: Customer ID must exist in Customers table (if Customers table has data)
    #            Product ID must exist in Products table (if Products table has data)
    if department == "Sales":
        cust_count = db.query(Customer).count()
        if cust_count > 0:
            existing_cust_ids = set(r[0] for r in db.query(Customer.customer_id).all())
            for idx, val in df["Customer ID"].items():
                if str(val).strip() not in existing_cust_ids:
                    row_num = int(idx) + 1
                    invalid_row_indices.add(row_num)
                    errors.append({
                        "row": row_num,
                        "column": "Customer ID",
                        "error": f"Customer ID '{val}' does not exist in Customer Master table.",
                        "severity": "Critical",
                    })
        else:
            warnings.append({
                "row": 0,
                "column": "Customer ID",
                "error": "Customer Master table is currently empty. Foreign key verification for Customer ID was skipped.",
                "severity": "Warning",
            })

        prod_count = db.query(Product).count()
        if prod_count > 0:
            existing_prod_ids = set(r[0] for r in db.query(Product.product_id).all())
            for idx, val in df["Product ID"].items():
                if str(val).strip() not in existing_prod_ids:
                    row_num = int(idx) + 1
                    invalid_row_indices.add(row_num)
                    errors.append({
                        "row": row_num,
                        "column": "Product ID",
                        "error": f"Product ID '{val}' does not exist in Product Master table.",
                        "severity": "Critical",
                    })
        else:
            warnings.append({
                "row": 0,
                "column": "Product ID",
                "error": "Product Master table is currently empty. Foreign key verification for Product ID was skipped.",
                "severity": "Warning",
            })

    # For Inventory: Product ID must exist in Products table (if Products table has data)
    if department == "Inventory":
        prod_count = db.query(Product).count()
        if prod_count > 0:
            existing_prod_ids = set(r[0] for r in db.query(Product.product_id).all())
            for idx, val in df["Product ID"].items():
                if str(val).strip() not in existing_prod_ids:
                    row_num = int(idx) + 1
                    invalid_row_indices.add(row_num)
                    errors.append({
                        "row": row_num,
                        "column": "Product ID",
                        "error": f"Product ID '{val}' does not exist in Product Master table.",
                        "severity": "Critical",
                    })
        else:
            warnings.append({
                "row": 0,
                "column": "Product ID",
                "error": "Product Master table is currently empty. Foreign key verification for Product ID was skipped.",
                "severity": "Warning",
            })

    # 4. Check row-by-row data types, missing values, and value ranges
    for idx, row in df.iterrows():
        row_num = int(idx) + 1

        for col, expected_type in col_types.items():
            if col not in row or pd.isna(row[col]) or str(row[col]).strip() == "":
                # Certain columns cannot be missing
                if col in ["Date", "Customer ID", "Product ID", "Employee ID", "Campaign ID", "Revenue", "Amount", "Salary", "Stock Quantity"]:
                    invalid_row_indices.add(row_num)
                    errors.append({
                        "row": row_num,
                        "column": col,
                        "error": f"Missing mandatory field '{col}'.",
                        "severity": "Critical",
                    })
                continue

            val = row[col]

            # Validate date types
            if expected_type == "date":
                try:
                    pd.to_datetime(val)
                except Exception:
                    invalid_row_indices.add(row_num)
                    errors.append({
                        "row": row_num,
                        "column": col,
                        "error": f"Invalid date format: '{val}'. Expected YYYY-MM-DD or standard date format.",
                        "severity": "Critical",
                    })

            # Validate integers
            elif expected_type == "integer":
                try:
                    num_val = int(float(val))
                    if col in ["Units Sold", "Stock Quantity", "Total Orders", "Target Customers", "Leads", "Conversions", "Age", "Reorder Level"]:
                        if num_val < 0:
                            invalid_row_indices.add(row_num)
                            errors.append({
                                "row": row_num,
                                "column": col,
                                "error": f"Value cannot be negative: {num_val}.",
                                "severity": "Critical",
                            })
                except Exception:
                    invalid_row_indices.add(row_num)
                    errors.append({
                        "row": row_num,
                        "column": col,
                        "error": f"Invalid integer value: '{val}'.",
                        "severity": "Critical",
                    })

            # Validate floats
            elif expected_type == "float":
                try:
                    num_val = float(str(val).replace("$", "").replace("%", "").replace(",", "").strip())
                    if col in ["Unit Price", "Unit Cost", "Salary", "Marketing Spend"]:
                        if num_val < 0:
                            invalid_row_indices.add(row_num)
                            errors.append({
                                "row": row_num,
                                "column": col,
                                "error": f"Monetary value cannot be negative: {num_val}.",
                                "severity": "Critical",
                            })
                    if col == "Attendance Percentage":
                        if num_val < 0 or num_val > 100:
                            warnings.append({
                                "row": row_num,
                                "column": col,
                                "error": f"Attendance percentage should typically be between 0 and 100%: {num_val}.",
                                "severity": "Warning",
                            })
                except Exception:
                    invalid_row_indices.add(row_num)
                    errors.append({
                        "row": row_num,
                        "column": col,
                        "error": f"Invalid numeric value: '{val}'.",
                        "severity": "Critical",
                    })

    critical_count = len([e for e in errors if e["severity"] == "Critical"])
    warnings_count = len(warnings)
    invalid_rows = len(invalid_row_indices)
    valid_rows = max(0, total_rows - invalid_rows)

    if critical_count > 0:
        status_text = "Validation completed with errors"
        can_import = False
    elif warnings_count > 0:
        status_text = "Validation completed with warnings"
        can_import = True
    else:
        status_text = "Validation Successful (100% Valid)"
        can_import = True

    # Limit error output to 100 to prevent payload bloat
    all_issues = (errors + warnings)[:100]

    return {
        "total_rows": total_rows,
        "valid_rows": valid_rows,
        "invalid_rows": invalid_rows,
        "warnings_count": warnings_count,
        "status": status_text,
        "can_import": can_import,
        "errors": all_issues,
        "preview": make_records_json_safe(df.head(30).to_dict(orient="records")),
    }, df
