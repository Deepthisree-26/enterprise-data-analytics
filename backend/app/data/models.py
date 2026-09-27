from sqlalchemy import Column, String, Integer, Float, Date, DateTime
from sqlalchemy.sql import func

from app.database import Base

class DataRecord(Base):
    __tablename__ = "data_records"

    order_id = Column(String, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    region = Column(String, nullable=False)
    category = Column(String, nullable=False)
    product = Column(String, nullable=False)
    units_sold = Column(Integer, nullable=False)
    revenue = Column(Float, nullable=False)
    profit_margin = Column(Float, nullable=False)
    customer_role = Column(String, nullable=False)
    # Timestamp for when the record was inserted
    created_at = Column(DateTime(timezone=True), server_default=func.now())
