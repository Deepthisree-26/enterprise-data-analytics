from typing import Dict, List, Any

DEPARTMENT_CONFIGS: Dict[str, Dict[str, Any]] = {
    "Sales": {
        "dataset_types": ["Sales Transactions"],
        "table": "sales_transactions",
        "description": "Sales orders, volume, prices, costs, and profit margins",
        "required_columns": [
            "Date", "Region", "Product", "Product ID", "Customer ID", 
            "Units Sold", "Unit Price", "Revenue", "Cost", "Profit Margin"
        ],
        "column_types": {
            "Date": "date",
            "Region": "string",
            "Product": "string",
            "Product ID": "string",
            "Customer ID": "string",
            "Units Sold": "integer",
            "Unit Price": "float",
            "Revenue": "float",
            "Cost": "float",
            "Profit Margin": "float",
        }
    },
    "Customers": {
        "dataset_types": ["Customer Master"],
        "table": "customers",
        "description": "Customer profiles, demographic segmentation, orders, and spend telemetry",
        "required_columns": [
            "Customer ID", "Customer Name", "Gender", "Age", "Region", 
            "Segment", "Signup Date", "Total Orders", "Total Spend", 
            "Last Purchase Date", "Customer Status"
        ],
        "column_types": {
            "Customer ID": "string",
            "Customer Name": "string",
            "Gender": "string",
            "Age": "integer",
            "Region": "string",
            "Segment": "string",
            "Signup Date": "date",
            "Total Orders": "integer",
            "Total Spend": "float",
            "Last Purchase Date": "date",
            "Customer Status": "string",
        }
    },
    "Products": {
        "dataset_types": ["Product Master"],
        "table": "products",
        "description": "Enterprise product catalog, standard costs, pricing, and reorder levels",
        "required_columns": [
            "Product ID", "Product Name", "Category", "Region", 
            "Unit Cost", "Unit Price", "Supplier", "Reorder Level"
        ],
        "column_types": {
            "Product ID": "string",
            "Product Name": "string",
            "Category": "string",
            "Region": "string",
            "Unit Cost": "float",
            "Unit Price": "float",
            "Supplier": "string",
            "Reorder Level": "integer",
        }
    },
    "Inventory": {
        "dataset_types": ["Inventory Stock"],
        "table": "inventory",
        "description": "Warehouse stock levels, SKU tracking, reorder thresholds, and valuation",
        "required_columns": [
            "Product ID", "Product Name", "Category", "Warehouse", 
            "Stock Quantity", "Reorder Level", "Unit Cost", "Stock Status", "Last Updated"
        ],
        "column_types": {
            "Product ID": "string",
            "Product Name": "string",
            "Category": "string",
            "Warehouse": "string",
            "Stock Quantity": "integer",
            "Reorder Level": "integer",
            "Unit Cost": "float",
            "Stock Status": "string",
            "Last Updated": "date",
        }
    },
    "Finance": {
        "dataset_types": ["Financial Transactions"],
        "table": "finance_transactions",
        "description": "General ledger line items, OPEX/CAPEX budgets, actuals, and variance",
        "required_columns": [
            "Date", "Transaction Type", "Category", "Department", 
            "Description", "Amount", "Budget", "Actual Amount", "Region"
        ],
        "column_types": {
            "Date": "date",
            "Transaction Type": "string",
            "Category": "string",
            "Department": "string",
            "Description": "string",
            "Amount": "float",
            "Budget": "float",
            "Actual Amount": "float",
            "Region": "string",
        }
    },
    "Marketing": {
        "dataset_types": ["Marketing Campaigns"],
        "table": "marketing_campaigns",
        "description": "Omnichannel campaign metrics, acquisition funnels, spend, and calculated ROI",
        "required_columns": [
            "Campaign ID", "Campaign Name", "Channel", "Start Date", "End Date", 
            "Region", "Target Customers", "Leads", "Conversions", "Marketing Spend", "Revenue Generated"
        ],
        "column_types": {
            "Campaign ID": "string",
            "Campaign Name": "string",
            "Channel": "string",
            "Start Date": "date",
            "End Date": "date",
            "Region": "string",
            "Target Customers": "integer",
            "Leads": "integer",
            "Conversions": "integer",
            "Marketing Spend": "float",
            "Revenue Generated": "float",
        }
    },
    "HR": {
        "dataset_types": ["Employee Data"],
        "table": "employees",
        "description": "Workforce headcount, compensation, performance appraisals, and attrition risk",
        "required_columns": [
            "Employee ID", "Employee Name", "Department", "Designation", "Region", 
            "Joining Date", "Salary", "Employment Status", "Performance Score", 
            "Attendance Percentage", "Attrition Risk"
        ],
        "column_types": {
            "Employee ID": "string",
            "Employee Name": "string",
            "Department": "string",
            "Designation": "string",
            "Region": "string",
            "Joining Date": "date",
            "Salary": "float",
            "Employment Status": "string",
            "Performance Score": "float",
            "Attendance Percentage": "float",
            "Attrition Risk": "string",
        }
    },
}
