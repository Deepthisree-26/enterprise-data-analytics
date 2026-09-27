from app.database import SessionLocal
from app.auth.models import User
from app.auth.security import get_password_hash

def seed_database():
    """Seed required user accounts if missing. Does NOT seed demo data records."""
    db = SessionLocal()
    try:
        # Seed users if missing
        seed_users = [
            {"username": "analyst_user", "email": "analyst@enterprise.com", "password": "password123", "role": "Analyst"},
            {"username": "admin_user", "email": "admin@enterprise.com", "password": "password123", "role": "Admin"},
            {"username": "manager_user", "email": "manager@enterprise.com", "password": "password123", "role": "Manager"},
        ]

        for u in seed_users:
            exists = db.query(User).filter(User.username == u["username"]).first()
            if not exists:
                new_user = User(
                    username=u["username"],
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                )
                db.add(new_user)
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
    print("Database initial users verified successfully (no demo data preloaded).")

