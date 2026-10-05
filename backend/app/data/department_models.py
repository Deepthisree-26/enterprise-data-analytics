from sqlalchemy import Column, String, Integer, Float, Date, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base

class SalesTransaction(Base):
    __tablename__ = "sales_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    region = Column(String, nullable=False, index=True)
    product = Column(String, nullable=False)
    product_id = Column(String, nullable=False, index=True)
    customer_id = Column(String, nullable=False, index=True)
    units_sold = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    revenue = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    profit_margin = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(String, unique=True, nullable=False, index=True)
    customer_name = Column(String, nullable=False)
    gender = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    region = Column(String, nullable=False, index=True)
    segment = Column(String, nullable=False)  # Enterprise, SMB, Consumer
    signup_date = Column(Date, nullable=True)
    total_orders = Column(Integer, default=0)
    total_spend = Column(Float, default=0.0)
    last_purchase_date = Column(Date, nullable=True)
    customer_status = Column(String, default="Active")  # Active, Inactive, Churned
    churn_probability = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, unique=True, nullable=False, index=True)
    product_name = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)
    region = Column(String, nullable=True)
    unit_cost = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    supplier = Column(String, nullable=True)
    reorder_level = Column(Integer, default=10)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, nullable=False, index=True)
    product_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    warehouse = Column(String, nullable=False, index=True)
    stock_quantity = Column(Integer, nullable=False)
    reorder_level = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=False)
    inventory_value = Column(Float, nullable=False)  # stock_quantity * unit_cost
    stock_status = Column(String, nullable=False)  # In Stock, Low Stock, Critical, Out of Stock
    last_updated = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FinanceTransaction(Base):
    __tablename__ = "finance_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    transaction_type = Column(String, nullable=False)  # Revenue, Expense, Investment, Payroll
    category = Column(String, nullable=False)
    department = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    budget = Column(Float, nullable=False)
    actual_amount = Column(Float, nullable=False)
    variance = Column(Float, nullable=False)  # budget - actual_amount
    region = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MarketingCampaign(Base):
    __tablename__ = "marketing_campaigns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    campaign_id = Column(String, unique=True, nullable=False, index=True)
    campaign_name = Column(String, nullable=False)
    channel = Column(String, nullable=False, index=True)  # Social, Email, Search, Display, Event
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    region = Column(String, nullable=True)
    target_customers = Column(Integer, default=0)
    leads = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    marketing_spend = Column(Float, nullable=False)
    revenue_generated = Column(Float, nullable=False)
    conversion_rate = Column(Float, default=0.0)  # conversions / leads * 100
    roi = Column(Float, default=0.0)  # (revenue_generated - spend) / spend * 100
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String, unique=True, nullable=False, index=True)
    employee_name = Column(String, nullable=False)
    department = Column(String, nullable=False, index=True)
    designation = Column(String, nullable=False)
    region = Column(String, nullable=True)
    joining_date = Column(Date, nullable=True)
    salary = Column(Float, nullable=False)
    employment_status = Column(String, default="Active")  # Active, Resigned, On Leave, Terminated
    performance_score = Column(Float, default=3.0)  # 1.0 - 5.0
    attendance_percentage = Column(Float, default=95.0)  # 0.0 - 100.0%
    attrition_risk = Column(String, default="Low")  # Low, Medium, High
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UploadHistory(Base):
    __tablename__ = "upload_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_name = Column(String, nullable=False)
    department = Column(String, nullable=False, index=True)
    dataset_type = Column(String, nullable=False)
    uploaded_by = Column(String, nullable=False)
    upload_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    total_rows = Column(Integer, default=0)
    valid_rows = Column(Integer, default=0)
    invalid_rows = Column(Integer, default=0)
    warnings_count = Column(Integer, default=0)
    status = Column(String, default="Success")  # Success, Failed, Validation Error, Processing
