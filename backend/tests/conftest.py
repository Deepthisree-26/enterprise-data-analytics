import pytest
from app.database import Base, engine

@pytest.fixture(autouse=True)
def clean_tables():
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up after test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
