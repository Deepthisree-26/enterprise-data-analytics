from sqlalchemy.orm import Session

from . import models, schemas


def create_data_record(db: Session, record: schemas.DataRecordCreate):
    db_record = models.DataRecord(
        order_id=record.order_id,
        date=record.date,
        region=record.region,
        category=record.category,
        product=record.product,
        units_sold=record.units_sold,
        revenue=record.revenue,
        profit_margin=record.profit_margin,
        customer_role=record.customer_role,
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


def get_all_records(db: Session):
    return db.query(models.DataRecord).all()


def get_record_by_id(db: Session, order_id: str):
    return db.query(models.DataRecord).filter(models.DataRecord.order_id == order_id).first()
