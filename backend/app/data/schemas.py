from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime
from typing import Optional, Union

class DataRecordBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_id: str = Field(..., description="Unique identifier for the order")
    date: date
    region: str
    category: str
    product: str
    units_sold: int
    revenue: float
    profit_margin: float
    customer_role: str

class DataRecordCreate(DataRecordBase):
    pass

class DataRecordResponse(DataRecordBase):
    created_at: Optional[Union[datetime, str]] = None
