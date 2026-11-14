import sqlite3
import os

def run_migrations(db_path: str = "vyapar_brain.db"):
    if not os.path.exists(db_path):
        return
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    def add_col_if_missing(table, col, col_type):
        cols = [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]
        if col not in cols:
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
            print(f"Added {col} to {table}")

    try:
        add_col_if_missing("products", "image_url", "VARCHAR(500)")
        add_col_if_missing("bulk_offers", "image_url", "VARCHAR(500)")
        add_col_if_missing("customers", "email", "VARCHAR(100) DEFAULT 'customer@paytmshopper.com'")
        add_col_if_missing("customers", "password_hash", "VARCHAR(200) DEFAULT 'demo123'")
        add_col_if_missing("customers", "role", "VARCHAR(20) DEFAULT 'customer'")
        add_col_if_missing("customers", "allow_promotions", "BOOLEAN DEFAULT 1")
        add_col_if_missing("customers", "preferred_language", "VARCHAR(10) DEFAULT 'en'")
        add_col_if_missing("merchants", "email", "VARCHAR(100) DEFAULT 'merchant@paytmkirana.com'")
        add_col_if_missing("merchants", "password_hash", "VARCHAR(200) DEFAULT 'demo123'")
        add_col_if_missing("merchants", "role", "VARCHAR(20) DEFAULT 'merchant'")
        add_col_if_missing("notifications", "customer_id", "INTEGER")
        con.commit()
    except Exception as e:
        print("Migration error:", e)
    finally:
        con.close()

if __name__ == "__main__":
    run_migrations()
