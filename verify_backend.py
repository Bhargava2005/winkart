"""
verify_backend.py — End-to-end API test for the updated Winkart backend.

New Architecture:
- NO customer accounts / registration
- Seller logs in and manages their shop
- Seller enables Customer Interface mode → customer browses on seller's device
- Cart is public and scoped by seller_id
- Seller finalises checkout (generates bill)
"""

import requests
import json
import io
import pandas as pd
from pymongo import MongoClient

BASE_URL = 'http://127.0.0.1:8000/api'


def cleanup_mongodb():
    """Remove all test data before and after tests."""
    client = MongoClient('mongodb://localhost:27017/')
    db = client['winkart_db']
    db['users'].delete_many({'email': 'test_seller@winkart.com'})
    db['categories'].delete_many({'slug': {'$in': ['test-electronics', 'test-smartphones']}})

    seller = db['users'].find_one({'email': 'test_seller@winkart.com'})
    if seller:
        sid = str(seller['_id'])
        db['products'].delete_many({'shop_id': sid})
        db['banners'].delete_many({'shop_id': sid})
        db['bills'].delete_many({'shop_id': sid})
        db['carts'].delete_many({'seller_id': sid})
        db['import_logs'].delete_many({'seller_id': sid})

    print("Database cleaned up.\n")


def run_tests():
    cleanup_mongodb()

    sess = requests.Session()

    # ─────────────────────────────────────────────
    # 1. SELLER REGISTRATION & LOGIN
    # ─────────────────────────────────────────────
    print("=== 1. Seller Registration & Login ===")

    r = sess.post(f"{BASE_URL}/auth/register/", json={
        "name": "Test Seller",
        "email": "test_seller@winkart.com",
        "phone": "8888899999",
        "password": "securepassword123",
        "shop_name": "Test Supermart",
        "shop_address": "456 Tech Park, Bengaluru, Karnataka"
    })
    print("Seller Register:", r.status_code, r.json().get('message'))
    assert r.status_code == 201

    r = sess.post(f"{BASE_URL}/auth/login/", json={
        "email": "test_seller@winkart.com",
        "password": "securepassword123"
    })
    print("Seller Login:", r.status_code)
    assert r.status_code == 200
    tokens = r.json()['tokens']
    seller_id = r.json()['user']['id']
    seller_headers = {'Authorization': f"Bearer {tokens['access']}"}
    print(f"Seller ID: {seller_id}\n")

    # ─────────────────────────────────────────────
    # 2. SELLER PROFILE & SETTINGS
    # ─────────────────────────────────────────────
    print("=== 2. Seller Profile & Settings ===")

    r = sess.get(f"{BASE_URL}/auth/profile/", headers=seller_headers)
    print("Get Profile:", r.status_code, r.json().get('name'))
    assert r.status_code == 200

    r = sess.put(f"{BASE_URL}/auth/seller/settings/", json={
        "shop_description": "All your tech gadgets in one place.",
        "location": {"latitude": 12.9716, "longitude": 77.5946},
        "business_hours": {
            "monday": {"is_open": True, "open_time": "08:00", "close_time": "22:00"}
        }
    }, headers=seller_headers)
    print("Update Settings:", r.status_code, r.json().get('message'))
    assert r.status_code == 200
    print()

    # ─────────────────────────────────────────────
    # 3. CATEGORY MANAGEMENT
    # ─────────────────────────────────────────────
    print("=== 3. Category Management ===")

    r = sess.post(f"{BASE_URL}/core/categories/", json={
        "name": "Electronics",
        "slug": "test-electronics"
    }, headers=seller_headers)
    print("Create L1 Category:", r.status_code, r.json().get('name'))
    assert r.status_code == 201
    l1_id = r.json()['id']

    r = sess.post(f"{BASE_URL}/core/categories/", json={
        "name": "Smartphones",
        "slug": "test-smartphones",
        "parent_id": l1_id
    }, headers=seller_headers)
    print("Create L2 Category:", r.status_code, r.json().get('name'))
    assert r.status_code == 201
    l2_id = r.json()['id']

    r = sess.get(f"{BASE_URL}/core/categories/", headers=seller_headers)
    print("List Categories:", r.status_code, "Count:", len(r.json()))
    assert r.status_code == 200
    print()

    # ─────────────────────────────────────────────
    # 4. PRODUCT MANAGEMENT
    # ─────────────────────────────────────────────
    print("=== 4. Product Management ===")

    r = sess.post(f"{BASE_URL}/core/products/", json={
        "name": "Phone Max Pro 14",
        "description": "High end premium phone",
        "price": 79999.00,
        "discount_price": 74999.00,
        "category_id": l2_id,
        "stock_quantity": 50,
        "attributes": {"brand": "Apple", "color": "Deep Purple"}
    }, headers=seller_headers)
    print("Create Product 1:", r.status_code, r.json().get('name'))
    assert r.status_code == 201
    prod1_id = r.json()['id']

    r = sess.post(f"{BASE_URL}/core/products/", json={
        "name": "Phone Charger Fast 30W",
        "description": "30W fast charging adaptor",
        "price": 1999.00,
        "discount_price": 1499.00,
        "category_id": l2_id,
        "stock_quantity": 200,
        "attributes": {"brand": "Apple", "type": "USB-C"}
    }, headers=seller_headers)
    print("Create Product 2:", r.status_code, r.json().get('name'))
    assert r.status_code == 201
    prod2_id = r.json()['id']

    r = sess.get(f"{BASE_URL}/core/products/", headers=seller_headers)
    print("List Seller Products:", r.status_code, "Count:", len(r.json()))
    assert r.status_code == 200
    print()

    # ─────────────────────────────────────────────
    # 5. UPSELL / CROSS-SELL CONFIGURATION
    # ─────────────────────────────────────────────
    print("=== 5. Recommendations Configuration ===")

    r = sess.post(f"{BASE_URL}/marketing/recommendations/configure/", json={
        "product_id": prod1_id,
        "type": "cross_sell",
        "linked_product_ids": [prod2_id]
    }, headers=seller_headers)
    print("Configure Cross-sell:", r.status_code, r.json().get('message'))
    assert r.status_code == 200

    r = sess.get(f"{BASE_URL}/marketing/recommendations/{prod1_id}/")
    print("Fetch Recommendations:", r.status_code,
          "Cross-sell count:", len(r.json()['cross_sell_recommendations']))
    assert r.status_code == 200
    assert len(r.json()['cross_sell_recommendations']) == 1
    print()

    # ─────────────────────────────────────────────
    # 6. CUSTOMER INTERFACE — PUBLIC BROWSING
    #    (No auth — seller hands device to customer)
    # ─────────────────────────────────────────────
    print("=== 6. Customer Interface (Public) ===")

    # Shop home — shows shop info, banners, categories
    r = sess.get(f"{BASE_URL}/core/customer/{seller_id}/shop/")
    print("Customer Shop Home:", r.status_code,
          "Shop:", r.json()['shop']['shop_name'],
          "| Categories:", len(r.json()['categories']))
    assert r.status_code == 200
    assert r.json()['shop']['shop_name'] == "Test Supermart"
    assert len(r.json()['categories']) > 0

    # Browse products
    r = sess.get(f"{BASE_URL}/core/customer/{seller_id}/products/")
    print("Customer Browse Products:", r.status_code, "Count:", len(r.json()))
    assert r.status_code == 200
    assert len(r.json()) == 2

    # Search products
    r = sess.get(f"{BASE_URL}/core/customer/{seller_id}/products/?search=Phone+Max")
    print("Customer Product Search:", r.status_code, "Found:", len(r.json()))
    assert r.status_code == 200

    # Single product with recommendations
    r = sess.get(f"{BASE_URL}/core/customer/{seller_id}/products/{prod1_id}/")
    print("Customer Product Detail:", r.status_code, r.json()['name'],
          "| Cross-sell:", len(r.json()['cross_sell_products']))
    assert r.status_code == 200
    assert len(r.json()['cross_sell_products']) == 1
    print()

    # ─────────────────────────────────────────────
    # 7. CART — PUBLIC, seller_id scoped
    # ─────────────────────────────────────────────
    print("=== 7. Cart (Public, Seller-scoped) ===")

    r = sess.post(f"{BASE_URL}/operations/cart/{seller_id}/", json={
        "items": [
            {"product_id": prod1_id, "quantity": 1},
            {"product_id": prod2_id, "quantity": 2}
        ]
    })
    print("Update Cart:", r.status_code, r.json().get('message'))
    assert r.status_code == 200

    r = sess.get(f"{BASE_URL}/operations/cart/{seller_id}/")
    print("Get Cart:", r.status_code,
          "Items:", r.json()['total_items'],
          "| Subtotal: Rs.", r.json()['subtotal'])
    assert r.status_code == 200
    assert r.json()['total_items'] == 3
    print()

    # ─────────────────────────────────────────────
    # 8. CHECKOUT — Seller authenticates and generates bill
    # ─────────────────────────────────────────────
    print("=== 8. Checkout & Billing ===")

    r = sess.post(f"{BASE_URL}/operations/checkout/{seller_id}/", json={
        "customer_name": "Walk-in Customer",
        "customer_phone": "9999988888"
    }, headers=seller_headers)
    print("Checkout (Generate Bill):", r.status_code, "Bill:", r.json().get('bill_number'))
    assert r.status_code == 201
    bill_id = r.json()['bill_id']

    r = sess.get(f"{BASE_URL}/operations/bills/", headers=seller_headers)
    print("Seller Bills List:", r.status_code, "Count:", len(r.json()))
    assert r.status_code == 200
    assert len(r.json()) > 0

    r = sess.put(f"{BASE_URL}/operations/bills/{bill_id}/",
                 json={"status": "Paid"}, headers=seller_headers)
    print("Mark Bill as Paid:", r.status_code, r.json().get('message'))
    assert r.status_code == 200
    print()

    # ─────────────────────────────────────────────
    # 9. PDF INVOICE DOWNLOAD
    # ─────────────────────────────────────────────
    print("=== 9. PDF Invoice Download ===")

    r = sess.get(f"{BASE_URL}/operations/bills/{bill_id}/download/")
    print("Download Invoice PDF:", r.status_code, "Bytes:", len(r.content))
    assert r.status_code == 200
    assert r.headers['Content-Type'] == 'application/pdf'
    print()

    # ─────────────────────────────────────────────
    # 10. EXCEL IMPORT / EXPORT
    # ─────────────────────────────────────────────
    print("=== 10. Excel Import / Export ===")

    # Build sample excel
    df = pd.DataFrame([{
        "name": "Wireless Earbuds Pro",
        "price": 2999.00,
        "category_slug": "test-smartphones",
        "description": "Premium wireless earbuds",
        "discount_price": 2499.00,
        "stock_quantity": 100,
        "attributes": "brand:Apple,type:Wireless"
    }])
    xlsx_buffer = io.BytesIO()
    with pd.ExcelWriter(xlsx_buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    xlsx_buffer.seek(0)

    files = {'file': ('import_test.xlsx', xlsx_buffer.getvalue(),
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
    r = sess.post(f"{BASE_URL}/operations/products/import/", files=files, headers=seller_headers)
    print("Excel Import:", r.status_code, "Success:", r.json().get('success_count'))
    assert r.status_code == 200
    assert r.json().get('success_count') == 1

    r = sess.get(f"{BASE_URL}/operations/products/import/history/", headers=seller_headers)
    print("Import History:", r.status_code, "Logs:", len(r.json()))
    assert r.status_code == 200

    r = sess.get(f"{BASE_URL}/operations/products/export/?type=bills&export_format=excel",
                 headers=seller_headers)
    print("Export Bills Excel:", r.status_code, "Bytes:", len(r.content))
    assert r.status_code == 200
    assert 'spreadsheet' in r.headers['Content-Type'] or 'excel' in r.headers['Content-Type']
    print()

    cleanup_mongodb()
    print("ALL BACKEND API TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_tests()
