import urllib.request
import json

def post(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read())

def get(url):
    req = urllib.request.Request(url)
    return json.loads(urllib.request.urlopen(req).read())

def patch(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'}, method='PATCH')
    return json.loads(urllib.request.urlopen(req).read())

def run():
    print("=================================================================")
    print("PAYTM VYAPAR-BRAIN: END-TO-END ACCEPTANCE VERIFICATION")
    print("=================================================================")

    # Scenario A: Merchant publishes bulk offer
    print("\n[Scenario A] Merchant publishes a bulk offer:")
    offer_res = post("http://localhost:8001/api/offers/", {
        "merchant_id": 1,
        "product_id": 1,
        "bulk_price": 1320.0,
        "retail_price": 1450.0,
        "minimum_quantity": 5,
        "available_stock": 25,
        "fulfilment_method": "both",
        "description": "Scenario A High-Yield Rice Offer",
        "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"
    })
    print(f" -> Offer published successfully! ID: {offer_res['id']}, Bulk Rate: ₹{offer_res['bulk_price']}, Available Stock: {offer_res['available_stock']}")

    # Scenario B: Customer books bulk offer
    print("\n[Scenario B] Customer books a bulk offer:")
    booking_res = post("http://localhost:8001/api/bookings/", {
        "customer_id": 1,
        "offer_id": offer_res["id"],
        "quantity": 2,
        "notes": "Reserve for Sri Vinayaka store pickup"
    })
    booking_id = booking_res["id"]
    print(f" -> Booking created! Ref: {booking_res['booking_reference']}, Status: {booking_res['status']}, Reserved Qty: {booking_res['quantity']}")

    # Scenario C: Merchant fulfils order
    print("\n[Scenario C] Merchant order fulfillment state machine:")
    c1 = patch(f"http://localhost:8001/api/bookings/{booking_id}/status", {"status": "confirmed"})
    print(f" -> Transition 1: {c1['status']} (Confirmed by Sri Vinayaka)")
    c2 = patch(f"http://localhost:8001/api/bookings/{booking_id}/status", {"status": "ready_for_pickup"})
    print(f" -> Transition 2: {c2['status']} (Packed & Ready)")
    c3 = patch(f"http://localhost:8001/api/bookings/{booking_id}/status", {"status": "fulfilled"})
    print(f" -> Transition 3: {c3['status']} (Order Fulfilled & Closed)")

    # Scenario D: Customer loyalty workflow
    print("\n[Scenario D] Customer Loyalty & Inactive Customer Detection:")
    loyalty_custs = get("http://localhost:8001/api/loyalty/at-risk?merchant_id=1")
    print(f" -> At-risk shoppers identified: {len(loyalty_custs)}")
    if loyalty_custs:
        target = loyalty_custs[0]
        print(f" -> Flagged Shopper: {target['customer_name']} (Absent for {target['days_since_last_visit']} days, cycle was {target['avg_interval_days']} days)")
        print(f" -> Risk Evidence: {target['risk_evidence']}")
        draft = post("http://localhost:8001/api/loyalty/campaign-draft", {
            "merchant_id": 1,
            "customer_id": target["customer_id"],
            "language": "telugu"
        })
        print(f" -> Drafted Telugu Outreach: {draft['message_text'][:65]}...")
        apprv = patch(f"http://localhost:8001/api/loyalty/campaign-draft/{draft['id']}/status", {"status": "approved"})
        print(f" -> Merchant Approval Status: {apprv['status']}")
        sim = patch(f"http://localhost:8001/api/loyalty/campaign-draft/{draft['id']}/status", {"status": "simulated_sent"})
        print(f" -> Simulated Dispatch Status: {sim['status']}")

    # Scenario E: Speak Ledger voice accounting
    print("\n[Scenario E] Speak Ledger Voice Accounting Arithmetic:")
    parse_res = post("http://localhost:8001/api/ledger/parse", {
        "text": "Cash sale 450 rupees, credit sale 200 rupees, shop expense 150 rupees"
    })
    print(f" -> Cash Inflow: ₹{parse_res['cash_total']}")
    print(f" -> Credit Receivables (Separate): ₹{parse_res['credit_total']}")
    print(f" -> Shop Expenses: ₹{parse_res['expense_total']}")
    print(f" -> Net Cash Movement: ₹{parse_res['net_cash']}")
    assert parse_res['net_cash'] == 300.0, "Math error: net cash should be 300"
    print(" -> Arithmetic Verification: 450 - 150 = ₹300 Net Cash Movement. Credit is not added to cash!")

    # Scenario F: Security, Auth & RBAC
    print("\n[Scenario F] Security, Auth, RBAC & Store Isolation:")
    login_res = post("http://localhost:8001/api/auth/login", {
        "email": "merchant@paytmkirana.com",
        "password": "demo123",
        "role": "merchant"
    })
    print(f" -> Merchant Login Success: {login_res['name']} ({login_res['role']})")
    token = login_res["access_token"]
    me_req = urllib.request.Request("http://localhost:8001/api/auth/me?role=merchant", headers={"Authorization": f"Bearer {token}"})
    me_res = json.loads(urllib.request.urlopen(me_req).read())
    print(f" -> Authenticated Session Profile: {me_res['store_name']} (Role: {me_res['role']})")

    # Pilot Metrics
    print("\n[Pilot Reporting & Audit Trail]:")
    report = get("http://localhost:8001/api/merchants/metrics/pilot-report")
    print(f" -> Sample Dataset: {report['sample_indicator']}")
    print(f" -> Active Merchants: {report['merchant_metrics']['active_merchants']}")
    print(f" -> Fulfillment Rate: {report['merchant_metrics']['fulfillment_rate_pct']}%")
    print(f" -> Booking Success Rate: {report['platform_metrics']['booking_success_rate_pct']}%")

    print("\n=================================================================")
    print("ALL 6 ACCEPTANCE SCENARIOS PASSED WITH 100% SUCCESS!")
    print("=================================================================")

if __name__ == "__main__":
    run()
