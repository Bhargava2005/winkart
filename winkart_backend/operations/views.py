import os
import random
from datetime import datetime, timezone
from io import BytesIO
import pandas as pd
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from bson import ObjectId

from winkart_backend.database import (
    db,
    products_col,
    categories_col,
    users_col,
    bills_col,
    import_logs_col
)
from operations.serializers import (
    CartSerializer,
    CheckoutSerializer,
    BillStatusUpdateSerializer
)
from operations.pdf_generator import generate_invoice_pdf


# ─────────────────────────────────────────────
#  PUBLIC CART — No authentication required.
#  Cart is scoped to seller_id (the seller's own shop).
#  When seller enables Customer Interface mode, the Flutter app
#  passes seller_id so all cart operations are tied to that shop.
# ─────────────────────────────────────────────

class CartView(APIView):
    """
    Cart management — PUBLIC, seller_id scoped.
    The cart is stored as a session-like document keyed by seller_id.
    This supports the customer interface where the seller's device is
    handed to the customer; no customer login is required.
    """
    authentication_classes = []
    permission_classes = []

    def _get_cart_key(self, seller_id):
        return {'seller_id': seller_id}

    def get(self, request, seller_id):
        cart = db['carts'].find_one(self._get_cart_key(seller_id))
        if not cart or not cart.get('items'):
            return Response({
                'seller_id': seller_id,
                'shop_name': '',
                'items': [],
                'total_items': 0,
                'subtotal': 0.0
            }, status=status.HTTP_200_OK)

        # Verify shop exists
        try:
            shop = users_col.find_one({'_id': ObjectId(seller_id), 'role': 'seller'})
        except Exception:
            shop = None

        shop_name = shop['shop_name'] if shop else ''

        populated_items = []
        for item in cart['items']:
            prod_id = item['product_id']
            try:
                prod = products_col.find_one({'_id': ObjectId(prod_id), 'is_active': True})
                if prod:
                    effective_price = prod.get('discount_price') or prod['price']
                    populated_items.append({
                        'product_id': prod_id,
                        'name': prod['name'],
                        'price': prod['price'],
                        'discount_price': prod.get('discount_price'),
                        'image': prod.get('images', [None])[0] if prod.get('images') else None,
                        'quantity': item['quantity'],
                        'total_price': effective_price * item['quantity']
                    })
            except Exception:
                pass

        subtotal = sum(i['total_price'] for i in populated_items)

        return Response({
            'seller_id': seller_id,
            'shop_name': shop_name,
            'items': populated_items,
            'total_items': sum(i['quantity'] for i in populated_items),
            'subtotal': subtotal
        }, status=status.HTTP_200_OK)

    def post(self, request, seller_id):
        """Add or replace cart items. Called from Customer Interface."""
        serializer = CartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # Verify the seller/shop exists
        try:
            shop = users_col.find_one({'_id': ObjectId(seller_id), 'role': 'seller'})
            if not shop:
                return Response({'error': 'Shop not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response({'error': 'Invalid seller ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_doc = {
            'seller_id': seller_id,
            'items': [
                {'product_id': it['product_id'], 'quantity': it['quantity']}
                for it in data['items']
            ],
            'updated_at': datetime.now(timezone.utc)
        }

        db['carts'].update_one(
            self._get_cart_key(seller_id),
            {'$set': cart_doc},
            upsert=True
        )
        return Response({'message': 'Cart updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, seller_id):
        """Clear the cart for this seller's customer interface session."""
        db['carts'].delete_one(self._get_cart_key(seller_id))
        return Response({'message': 'Cart cleared successfully.'}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
#  CHECKOUT — Seller-authenticated.
#  The SELLER (logged in) presses "Generate Bill" after the customer
#  finishes selecting products on the Customer Interface.
# ─────────────────────────────────────────────

class CheckoutView(APIView):
    """
    Checkout — SELLER authenticated.
    The seller reviews the customer's cart and finalises it to generate a bill.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, seller_id):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        # Seller can only checkout for their own shop
        if request.user.id != seller_id:
            return Response(
                {'error': 'You can only generate bills for your own shop.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        checkout_data = serializer.validated_data

        # Fetch cart for this seller session
        cart = db['carts'].find_one({'seller_id': seller_id})
        if not cart or not cart.get('items'):
            return Response({'error': 'Cart is empty. Nothing to checkout.'}, status=status.HTTP_400_BAD_REQUEST)

        shop = users_col.find_one({'_id': ObjectId(seller_id)})
        if not shop:
            return Response({'error': 'Associated shop not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Resolve cart items and compute pricing
        bill_items = []
        subtotal = 0.0
        discount_total = 0.0

        for item in cart['items']:
            prod_id = item['product_id']
            qty = item['quantity']

            prod = products_col.find_one({'_id': ObjectId(prod_id), 'shop_id': seller_id})
            if not prod or not prod.get('is_active', True):
                return Response(
                    {'error': f"Product {prod_id} is no longer available in this shop."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            price = prod['price']
            disc_price = prod.get('discount_price')

            item_subtotal = price * qty
            if disc_price and disc_price < price:
                item_total = disc_price * qty
                discount_total += (price - disc_price) * qty
            else:
                item_total = price * qty

            subtotal += item_subtotal

            bill_items.append({
                'product_id': prod_id,
                'name': prod['name'],
                'price': price,
                'discount_price': disc_price,
                'quantity': qty,
                'total_price': item_total
            })

        # Compute GST (flat 5%)
        tax = (subtotal - discount_total) * 0.05
        total_amount = (subtotal - discount_total) + tax

        # Generate bill number
        date_str = datetime.now(timezone.utc).strftime('%Y%m%d')
        rand_num = random.randint(1000, 9999)
        bill_number = f"WIN-{date_str}-{rand_num}"

        # Create bill document
        bill_doc = {
            'bill_number': bill_number,
            'customer_name': checkout_data['customer_name'],
            'customer_phone': checkout_data['customer_phone'],
            'shop_id': seller_id,
            'shop_name': shop['shop_name'],
            'shop_address': shop.get('shop_address', ''),
            'items': bill_items,
            'subtotal': subtotal,
            'discount': discount_total,
            'tax': tax,
            'total_amount': total_amount,
            'status': 'Billed',   # Pending payment at counter
            'created_at': datetime.now(timezone.utc)
        }

        res = bills_col.insert_one(bill_doc)

        # Clear cart after successful bill generation
        db['carts'].delete_one({'seller_id': seller_id})

        return Response({
            'message': 'Bill generated successfully.',
            'bill_id': str(res.inserted_id),
            'bill_number': bill_number,
            'total_amount': total_amount
        }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────
#  BILLS — Seller-only access
# ─────────────────────────────────────────────

class SellerBillsListView(APIView):
    """Seller: list all bills for their shop with optional status filter."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        status_filter = request.query_params.get('status')
        query = {'shop_id': request.user.id}

        if status_filter:
            query['status'] = status_filter

        bills = list(bills_col.find(query).sort('created_at', -1))

        result = []
        for b in bills:
            result.append({
                'id': str(b['_id']),
                'bill_number': b['bill_number'],
                'customer_name': b['customer_name'],
                'customer_phone': b['customer_phone'],
                'total_amount': b['total_amount'],
                'status': b['status'],
                'created_at': b['created_at']
            })

        return Response(result, status=status.HTTP_200_OK)


class BillDetailView(APIView):
    """Seller: view details of a single bill or update its status."""
    permission_classes = [IsAuthenticated]

    def get(self, request, bill_id):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            bill_obj_id = ObjectId(bill_id)
        except Exception:
            return Response({'error': 'Invalid bill ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        bill = bills_col.find_one({'_id': bill_obj_id, 'shop_id': request.user.id})
        if not bill:
            return Response({'error': 'Bill not found or does not belong to your shop.'}, status=status.HTTP_404_NOT_FOUND)

        bill['id'] = str(bill['_id'])
        bill.pop('_id')
        return Response(bill, status=status.HTTP_200_OK)

    def put(self, request, bill_id):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            bill_obj_id = ObjectId(bill_id)
        except Exception:
            return Response({'error': 'Invalid bill ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        bill = bills_col.find_one({'_id': bill_obj_id, 'shop_id': request.user.id})
        if not bill:
            return Response({'error': 'Bill not found or does not belong to your shop.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = BillStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data['status']
        bills_col.update_one({'_id': bill_obj_id}, {'$set': {'status': new_status}})

        return Response({'message': f'Bill status updated to {new_status} successfully.'}, status=status.HTTP_200_OK)


class DownloadInvoiceView(APIView):
    """
    PUBLIC — PDF invoice download.
    Anyone with the bill_id can download the invoice PDF.
    Seller shares it with the customer after checkout.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request, bill_id):
        try:
            bill_obj_id = ObjectId(bill_id)
        except Exception:
            return Response({'error': 'Invalid bill ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        bill = bills_col.find_one({'_id': bill_obj_id})
        if not bill:
            return Response({'error': 'Bill not found.'}, status=status.HTTP_404_NOT_FOUND)

        pdf_bytes = generate_invoice_pdf(bill)

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{bill["bill_number"]}.pdf"'
        return response


# ─────────────────────────────────────────────
#  EXCEL BULK IMPORT / EXPORT
#  Seller-authenticated only
# ─────────────────────────────────────────────

class BulkImportProductsView(APIView):
    """Seller: bulk upload products via Excel (.xlsx) file."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        excel_file = request.FILES['file']
        if not excel_file.name.endswith('.xlsx'):
            return Response({'error': 'File format must be Excel (.xlsx).'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(excel_file)
            required_cols = ['name', 'price', 'category_slug']
            for col in required_cols:
                if col not in df.columns:
                    return Response({'error': f"Missing required column: {col}"}, status=status.HTTP_400_BAD_REQUEST)

            success_count = 0
            failed_count = 0
            errors = []

            for idx, row in df.iterrows():
                try:
                    name = str(row['name']).strip()
                    price = float(row['price'])
                    cat_slug = str(row['category_slug']).strip()

                    if not name:
                        raise ValueError("Name cannot be empty.")

                    cat = categories_col.find_one({'slug': cat_slug})
                    if not cat:
                        raise ValueError(f"Category slug '{cat_slug}' not found. Please create it first.")

                    desc = str(row.get('description', '')) if pd.notna(row.get('description')) else ''
                    disc_price = float(row['discount_price']) if pd.notna(row.get('discount_price')) else None
                    stock = int(row['stock_quantity']) if pd.notna(row.get('stock_quantity')) else 0

                    # Parse attributes string e.g. "brand:Apple, color:Red"
                    attrs = {}
                    raw_attrs = row.get('attributes')
                    if pd.notna(raw_attrs):
                        parts = str(raw_attrs).split(',')
                        for p in parts:
                            if ':' in p:
                                k, v = p.split(':', 1)
                                attrs[k.strip()] = v.strip()

                    prod_doc = {
                        'name': name,
                        'description': desc,
                        'price': price,
                        'discount_price': disc_price,
                        'category_id': str(cat['_id']),
                        'stock_quantity': stock,
                        'images': [],
                        'attributes': attrs,
                        'is_active': True,
                        'shop_id': request.user.id,
                        'upsell_ids': [],
                        'cross_sell_ids': []
                    }
                    products_col.insert_one(prod_doc)
                    success_count += 1
                except Exception as e:
                    failed_count += 1
                    errors.append({'row': idx + 2, 'error': str(e)})

            # Save import log
            log_doc = {
                'seller_id': request.user.id,
                'filename': excel_file.name,
                'total_records': len(df),
                'success_count': success_count,
                'failed_count': failed_count,
                'errors': errors,
                'created_at': datetime.now(timezone.utc)
            }
            import_logs_col.insert_one(log_doc)

            return Response({
                'message': 'Bulk import finished.',
                'total_records': len(df),
                'success_count': success_count,
                'failed_count': failed_count,
                'errors': errors
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"Failed to process file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BulkExportDataView(APIView):
    """Seller: export products or bills as Excel or CSV."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        export_type = request.query_params.get('type')          # 'products' or 'bills'
        export_format = request.query_params.get('export_format', 'excel')  # 'excel' or 'csv'
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        query = {'shop_id': request.user.id}

        if start_date and end_date:
            try:
                s_dt = datetime.fromisoformat(start_date)
                e_dt = datetime.fromisoformat(end_date)
                query['created_at'] = {'$gte': s_dt, '$lte': e_dt}
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use ISO format (YYYY-MM-DD).'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if export_type == 'products':
            query.pop('created_at', None)
            cursor = products_col.find(query)
            data = []
            for p in cursor:
                attr_str = ", ".join(f"{k}:{v}" for k, v in p.get('attributes', {}).items())
                data.append({
                    'Product Name': p['name'],
                    'Description': p.get('description', ''),
                    'Price': p['price'],
                    'Discount Price': p.get('discount_price'),
                    'Stock Quantity': p.get('stock_quantity', 0),
                    'Attributes': attr_str,
                    'Status': 'Active' if p.get('is_active', True) else 'Inactive'
                })
        elif export_type == 'bills':
            cursor = bills_col.find(query).sort('created_at', -1)
            data = []
            for b in cursor:
                data.append({
                    'Bill Number': b['bill_number'],
                    'Customer Name': b['customer_name'],
                    'Customer Phone': b['customer_phone'],
                    'Subtotal': b['subtotal'],
                    'Discount': b['discount'],
                    'Taxes (5%)': b['tax'],
                    'Total Amount': b['total_amount'],
                    'Status': b['status'],
                    'Date': b['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                })
        else:
            return Response(
                {'error': "Invalid export type. Must be 'products' or 'bills'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not data:
            return Response(
                {'error': 'No data found for the selected export settings.'},
                status=status.HTTP_404_NOT_FOUND
            )

        df = pd.DataFrame(data)
        out_stream = BytesIO()

        if export_format == 'csv':
            df.to_csv(out_stream, index=False)
            out_stream.seek(0)
            response = HttpResponse(out_stream.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="export_{export_type}.csv"'
            return response
        else:
            with pd.ExcelWriter(out_stream, engine='openpyxl') as writer:
                df.to_excel(writer, index=False)
            out_stream.seek(0)
            response = HttpResponse(
                out_stream.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="export_{export_type}.xlsx"'
            return response


class ImportHistoryLogView(APIView):
    """Seller: view the history of previous Excel import operations."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        logs = list(import_logs_col.find({'seller_id': request.user.id}).sort('created_at', -1))

        result = []
        for log in logs:
            result.append({
                'id': str(log['_id']),
                'filename': log['filename'],
                'total_records': log['total_records'],
                'success_count': log['success_count'],
                'failed_count': log['failed_count'],
                'errors': log.get('errors', []),
                'created_at': log['created_at']
            })

        return Response(result, status=status.HTTP_200_OK)
