"""
Seed the database with realistic demo data.
Checks for existing data before inserting — safe to call multiple times.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import (
    Merchant, Customer, Product, BulkOffer,
    Booking, Transaction, LoyaltyActivity, Notification
)


def seed_database():
    db: Session = SessionLocal()
    try:
        # Guard — only seed once
        if db.query(Merchant).count() > 0:
            return

        today = datetime.utcnow()

        # ── Merchants ────────────────────────────────────────────────────────
        m1 = Merchant(name="Sri Vinayaka Kirana Store", location="Ameerpet, Hyderabad",
                      neighborhood="Ameerpet", category="Kirana",
                      phone="9876543210", description="Trusted kirana store in Ameerpet", is_demo=True)
        m2 = Merchant(name="Kumar Kirana", location="SR Nagar, Hyderabad",
                      neighborhood="SR Nagar", category="Kirana",
                      phone="9876543211", description="Your neighbourhood kirana in SR Nagar", is_demo=True)
        m3 = Merchant(name="Sri Lakshmi Stores", location="Madhapur, Hyderabad",
                      neighborhood="Madhapur", category="Kirana",
                      phone="9876543212", description="Premium kirana store in Madhapur", is_demo=True)
        db.add_all([m1, m2, m3])
        db.flush()

        # ── Products ─────────────────────────────────────────────────────────
        p_rice = Product(name="Sona Masoori Rice", category="Grains", brand="Generic",
                         variety="Sona Masoori", unit="kg", pack_size="25kg bag",
                         description="Premium quality Sona Masoori rice", is_demo=True)
        p_dal = Product(name="Toor Dal", category="Pulses", brand="Generic",
                        variety="Toor", unit="kg", pack_size="10kg bag",
                        description="Protein-rich toor dal", is_demo=True)
        p_oil = Product(name="Sunflower Oil", category="Oils", brand="Generic",
                        variety="Refined", unit="L", pack_size="15L tin",
                        description="Refined sunflower oil for daily cooking", is_demo=True)
        p_sugar = Product(name="Sugar", category="Sweeteners", brand="Generic",
                          variety="White Crystal", unit="kg", pack_size="50kg bag",
                          description="Pure white crystal sugar", is_demo=True)
        p_atta = Product(name="Wheat Flour / Atta", category="Grains", brand="Generic",
                         variety="Whole Wheat", unit="kg", pack_size="50kg bag",
                         description="Fine whole-wheat atta", is_demo=True)
        p_groundnut = Product(name="Groundnut Oil", category="Oils", brand="Generic",
                              variety="Cold Pressed", unit="L", pack_size="15L tin",
                              description="Cold-pressed groundnut oil", is_demo=True)
        db.add_all([p_rice, p_dal, p_oil, p_sugar, p_atta, p_groundnut])
        db.flush()

        # ── Bulk Offers ───────────────────────────────────────────────────────
        validity_end = today + timedelta(days=14)

        # Ramesh offers
        o_r_rice = BulkOffer(merchant_id=m1.id, product_id=p_rice.id,
                             bulk_price=1350, retail_price=1450,
                             minimum_quantity=10, available_stock=23, booked_quantity=7,
                             fulfilment_method="both", status="active",
                             validity_start=today, validity_end=validity_end,
                             description="Bulk Sona Masoori Rice 25kg bags")
        o_r_dal = BulkOffer(merchant_id=m1.id, product_id=p_dal.id,
                            bulk_price=850, retail_price=950,
                            minimum_quantity=5, available_stock=18, booked_quantity=2,
                            fulfilment_method="pickup", status="active",
                            validity_start=today, validity_end=validity_end,
                            description="Bulk Toor Dal 10kg bags")
        o_r_oil = BulkOffer(merchant_id=m1.id, product_id=p_oil.id,
                            bulk_price=1800, retail_price=2000,
                            minimum_quantity=3, available_stock=9, booked_quantity=1,
                            fulfilment_method="pickup", status="active",
                            validity_start=today, validity_end=validity_end,
                            description="Bulk Sunflower Oil 15L tins")
        # Kumar offers
        o_k_rice = BulkOffer(merchant_id=m2.id, product_id=p_rice.id,
                             bulk_price=1380, retail_price=1480,
                             minimum_quantity=8, available_stock=21, booked_quantity=4,
                             fulfilment_method="delivery", status="active",
                             validity_start=today, validity_end=validity_end,
                             description="Bulk Sona Masoori Rice 25kg bags")
        o_k_sugar = BulkOffer(merchant_id=m2.id, product_id=p_sugar.id,
                              bulk_price=1900, retail_price=2100,
                              minimum_quantity=5, available_stock=14, booked_quantity=0,
                              fulfilment_method="pickup", status="active",
                              validity_start=today, validity_end=validity_end,
                              description="Bulk Sugar 50kg bags")
        o_k_atta = BulkOffer(merchant_id=m2.id, product_id=p_atta.id,
                             bulk_price=1450, retail_price=1600,
                             minimum_quantity=4, available_stock=11, booked_quantity=0,
                             fulfilment_method="both", status="active",
                             validity_start=today, validity_end=validity_end,
                             description="Bulk Wheat Flour / Atta 50kg bags")
        # Sri Lakshmi offers
        o_sl_rice = BulkOffer(merchant_id=m3.id, product_id=p_rice.id,
                              bulk_price=1400, retail_price=1500,
                              minimum_quantity=5, available_stock=17, booked_quantity=0,
                              fulfilment_method="pickup", status="active",
                              validity_start=today, validity_end=validity_end,
                              description="Bulk Sona Masoori Rice 25kg bags")
        o_sl_groundnut = BulkOffer(merchant_id=m3.id, product_id=p_groundnut.id,
                                   bulk_price=2800, retail_price=3000,
                                   minimum_quantity=2, available_stock=7, booked_quantity=0,
                                   fulfilment_method="pickup", status="active",
                                   validity_start=today, validity_end=validity_end,
                                   description="Bulk Groundnut Oil 15L tins")
        o_sl_dal = BulkOffer(merchant_id=m3.id, product_id=p_dal.id,
                             bulk_price=870, retail_price=960,
                             minimum_quantity=4, available_stock=14, booked_quantity=0,
                             fulfilment_method="delivery", status="active",
                             validity_start=today, validity_end=validity_end,
                             description="Bulk Toor Dal 10kg bags")
        db.add_all([o_r_rice, o_r_dal, o_r_oil, o_k_rice, o_k_sugar,
                    o_k_atta, o_sl_rice, o_sl_groundnut, o_sl_dal])
        db.flush()

        # ── Customers ─────────────────────────────────────────────────────────
        c1 = Customer(name="Rahul Kumar", phone="9000000001", neighborhood="Ameerpet",
                      location="Ameerpet, Hyderabad", is_demo=True)
        c2 = Customer(name="Priya Sharma", phone="9000000002", neighborhood="SR Nagar",
                      location="SR Nagar, Hyderabad", is_demo=True)
        c3 = Customer(name="Suresh Reddy", phone="9000000003", neighborhood="Madhapur",
                      location="Madhapur, Hyderabad", is_demo=True)
        c4 = Customer(name="Anitha Rao", phone="9000000004", neighborhood="Ameerpet",
                      location="Ameerpet, Hyderabad", is_demo=True)
        c5 = Customer(name="Ravi Patel", phone="9000000005", neighborhood="Kukatpally",
                      location="Kukatpally, Hyderabad", is_demo=True)
        db.add_all([c1, c2, c3, c4, c5])
        db.flush()

        # ── Bookings ──────────────────────────────────────────────────────────
        import random, string

        def booking_ref():
            yr = datetime.utcnow().year
            digits = ''.join(random.choices(string.digits, k=4))
            return f"BK-{yr}-{digits}"

        b1 = Booking(booking_reference=booking_ref(), customer_id=c1.id,
                     merchant_id=m1.id, offer_id=o_r_rice.id,
                     quantity=2, unit_price_at_booking=1350, total_amount=2700,
                     status="confirmed", created_at=today - timedelta(days=2))
        b2 = Booking(booking_reference=booking_ref(), customer_id=c2.id,
                     merchant_id=m1.id, offer_id=o_r_rice.id,
                     quantity=3, unit_price_at_booking=1350, total_amount=4050,
                     status="pending", created_at=today - timedelta(days=1))
        b3 = Booking(booking_reference=booking_ref(), customer_id=c3.id,
                     merchant_id=m1.id, offer_id=o_r_oil.id,
                     quantity=1, unit_price_at_booking=1800, total_amount=1800,
                     status="ready_for_pickup", created_at=today - timedelta(days=3))
        b4 = Booking(booking_reference=booking_ref(), customer_id=c4.id,
                     merchant_id=m2.id, offer_id=o_k_rice.id,
                     quantity=4, unit_price_at_booking=1380, total_amount=5520,
                     status="confirmed", created_at=today - timedelta(days=1))
        b5 = Booking(booking_reference=booking_ref(), customer_id=c5.id,
                     merchant_id=m1.id, offer_id=o_r_dal.id,
                     quantity=2, unit_price_at_booking=850, total_amount=1700,
                     status="fulfilled", created_at=today - timedelta(days=5))
        db.add_all([b1, b2, b3, b4, b5])
        db.flush()

        # ── Transactions for Ramesh ───────────────────────────────────────────
        txns = [
            Transaction(merchant_id=m1.id, transaction_type="cash_sale", amount=350,
                        description="Daily cash sale", entry_date=(today - timedelta(days=0)).date(),
                        source="manual"),
            Transaction(merchant_id=m1.id, transaction_type="cash_sale", amount=620,
                        description="Bulk rice payment", entry_date=(today - timedelta(days=1)).date(),
                        source="voice"),
            Transaction(merchant_id=m1.id, transaction_type="cash_sale", amount=210,
                        description="Misc items sale", entry_date=(today - timedelta(days=2)).date(),
                        source="manual"),
            Transaction(merchant_id=m1.id, transaction_type="cash_sale", amount=780,
                        description="Festival season sale", entry_date=(today - timedelta(days=3)).date(),
                        source="manual"),
            Transaction(merchant_id=m1.id, transaction_type="cash_sale", amount=450,
                        description="Regular sale", entry_date=(today - timedelta(days=4)).date(),
                        source="manual"),
            Transaction(merchant_id=m1.id, transaction_type="credit_sale", amount=500,
                        description="Credit to Priya", entry_date=(today - timedelta(days=1)).date(),
                        source="manual"),
            Transaction(merchant_id=m1.id, transaction_type="credit_sale", amount=950,
                        description="Credit to Suresh", entry_date=(today - timedelta(days=3)).date(),
                        source="manual"),
            Transaction(merchant_id=m1.id, transaction_type="expense", amount=200,
                        description="Shop electricity bill", entry_date=(today - timedelta(days=0)).date(),
                        source="manual"),
            Transaction(merchant_id=m1.id, transaction_type="expense", amount=350,
                        description="Supplier transport", entry_date=(today - timedelta(days=2)).date(),
                        source="manual"),
            Transaction(merchant_id=m1.id, transaction_type="expense", amount=120,
                        description="Packaging material", entry_date=(today - timedelta(days=4)).date(),
                        source="manual"),
        ]
        db.add_all(txns)

        # ── Loyalty Activity ──────────────────────────────────────────────────
        loyalty = [
            # Rahul — active (~3d avg, last 2d ago)
            LoyaltyActivity(customer_id=c1.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=2), purchase_amount=450),
            LoyaltyActivity(customer_id=c1.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=5), purchase_amount=380),
            LoyaltyActivity(customer_id=c1.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=8), purchase_amount=520),
            # Priya — active (~3d avg, last 1d ago)
            LoyaltyActivity(customer_id=c2.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=1), purchase_amount=300),
            LoyaltyActivity(customer_id=c2.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=4), purchase_amount=410),
            LoyaltyActivity(customer_id=c2.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=7), purchase_amount=290),
            # Anitha — AT RISK (avg 3d, last visit 16d ago)
            LoyaltyActivity(customer_id=c4.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=16), purchase_amount=600),
            LoyaltyActivity(customer_id=c4.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=19), purchase_amount=480),
            LoyaltyActivity(customer_id=c4.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=22), purchase_amount=350),
            # Suresh — active (~4d avg, last 3d ago)
            LoyaltyActivity(customer_id=c3.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=3), purchase_amount=700),
            LoyaltyActivity(customer_id=c3.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=7), purchase_amount=560),
            # Ravi — borderline (~8d avg, last 10d ago)
            LoyaltyActivity(customer_id=c5.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=10), purchase_amount=420),
            LoyaltyActivity(customer_id=c5.id, merchant_id=m1.id,
                            visit_date=today - timedelta(days=18), purchase_amount=380),
        ]
        db.add_all(loyalty)

        # ── Seed notifications ─────────────────────────────────────────────────
        notifs = [
            Notification(merchant_id=m1.id, type="new_booking",
                         title="New booking received",
                         message=f"New booking from Rahul Kumar for Sona Masoori Rice",
                         is_read=False, related_id=b1.id),
            Notification(merchant_id=m1.id, type="new_booking",
                         title="New booking received",
                         message=f"New booking from Priya Sharma for Sona Masoori Rice",
                         is_read=False, related_id=b2.id),
            Notification(merchant_id=m1.id, type="min_qty_reached",
                         title="Minimum quantity reached!",
                         message="Minimum quantity reached for Sona Masoori Rice offer!",
                         is_read=False, related_id=o_r_rice.id),
        ]
        db.add_all(notifs)

        db.commit()
        print("✅ Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"❌ Seed error: {e}")
        raise
    finally:
        db.close()
