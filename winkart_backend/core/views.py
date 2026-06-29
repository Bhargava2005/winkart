import os
from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from bson import ObjectId
from winkart_backend.database import categories_col, products_col, users_col, banners_col
from core.serializers import (
    CategorySerializer,
    ProductSerializer,
    ShopSerializer,
    BannerSerializer
)


# ─────────────────────────────────────────────
#  SELLER-AUTHENTICATED CATEGORY MANAGEMENT
# ─────────────────────────────────────────────

class CategoryListCreateView(APIView):
    """Category list and create endpoints (Seller manages categories)."""
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        """List all categories — public, used by seller management and customer interface."""
        categories = list(categories_col.find({}))

        result = []
        for cat in categories:
            cat_id = str(cat['_id'])
            prod_count = products_col.count_documents({'category_id': cat_id, 'is_active': True})
            result.append({
                'id': cat_id,
                'name': cat['name'],
                'slug': cat['slug'],
                'parent_id': cat.get('parent_id'),
                'image_url': cat.get('image_url'),
                'product_count': prod_count
            })

        return Response(result, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CategorySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        if categories_col.find_one({'slug': data['slug']}):
            return Response({'error': 'Category slug already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        cat_doc = {
            'name': data['name'],
            'slug': data['slug'],
            'parent_id': data.get('parent_id') or None,
            'image_url': data.get('image_url', '')
        }

        res = categories_col.insert_one(cat_doc)
        cat_doc['id'] = str(res.inserted_id)
        cat_doc.pop('_id', None)

        return Response(cat_doc, status=status.HTTP_201_CREATED)


class CategoryDetailView(APIView):
    """Category detail, update, and delete (Seller manages)."""
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, category_id):
        try:
            cat_obj_id = ObjectId(category_id)
        except Exception:
            return Response({'error': 'Invalid category ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        cat = categories_col.find_one({'_id': cat_obj_id})
        if not cat:
            return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)

        prod_count = products_col.count_documents({'category_id': category_id, 'is_active': True})

        data = {
            'id': str(cat['_id']),
            'name': cat['name'],
            'slug': cat['slug'],
            'parent_id': cat.get('parent_id'),
            'image_url': cat.get('image_url'),
            'product_count': prod_count
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, category_id):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            cat_obj_id = ObjectId(category_id)
        except Exception:
            return Response({'error': 'Invalid category ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CategorySerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        slug = data.get('slug')
        if slug:
            conflict = categories_col.find_one({'slug': slug, '_id': {'$ne': cat_obj_id}})
            if conflict:
                return Response({'error': 'Category slug is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        categories_col.update_one({'_id': cat_obj_id}, {'$set': data})
        return Response({'message': 'Category updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, category_id):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            cat_obj_id = ObjectId(category_id)
        except Exception:
            return Response({'error': 'Invalid category ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        if products_col.find_one({'category_id': category_id}):
            return Response(
                {'error': 'Cannot delete category containing active products. Reassign products first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        categories_col.delete_one({'_id': cat_obj_id})
        return Response({'message': 'Category deleted successfully.'}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
#  SELLER-AUTHENTICATED PRODUCT MANAGEMENT
# ─────────────────────────────────────────────

class ProductListCreateView(APIView):
    """Seller: list their own products or create a new product."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List the authenticated seller's own products."""
        category_id = request.query_params.get('category_id')
        search_query = request.query_params.get('search')
        sort_by = request.query_params.get('sort_by', 'newest')
        is_active = request.query_params.get('is_active')  # 'true' / 'false' / all

        query = {'shop_id': request.user.id}

        if category_id:
            query['category_id'] = category_id

        if is_active == 'true':
            query['is_active'] = True
        elif is_active == 'false':
            query['is_active'] = False

        if search_query:
            query['$text'] = {'$search': search_query}

        cursor = products_col.find(query)

        if sort_by == 'price_asc':
            cursor = cursor.sort('price', 1)
        elif sort_by == 'price_desc':
            cursor = cursor.sort('price', -1)
        else:
            cursor = cursor.sort('_id', -1)

        products = list(cursor)

        result = []
        for prod in products:
            cat_name = ''
            try:
                cat = categories_col.find_one({'_id': ObjectId(prod['category_id'])})
                if cat:
                    cat_name = cat['name']
            except Exception:
                pass

            result.append({
                'id': str(prod['_id']),
                'name': prod['name'],
                'description': prod.get('description', ''),
                'price': prod['price'],
                'discount_price': prod.get('discount_price'),
                'category_id': prod['category_id'],
                'category_name': cat_name,
                'stock_quantity': prod.get('stock_quantity', 0),
                'images': prod.get('images', []),
                'attributes': prod.get('attributes', {}),
                'is_active': prod.get('is_active', True),
            })

        return Response(result, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        try:
            cat = categories_col.find_one({'_id': ObjectId(data['category_id'])})
            if not cat:
                return Response({'error': 'Category does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Invalid category ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        prod_doc = {
            'name': data['name'],
            'description': data.get('description', ''),
            'price': data['price'],
            'discount_price': data.get('discount_price'),
            'category_id': data['category_id'],
            'stock_quantity': data.get('stock_quantity', 0),
            'images': data.get('images', []),
            'attributes': data.get('attributes', {}),
            'is_active': data.get('is_active', True),
            'shop_id': request.user.id,
            'upsell_ids': [],
            'cross_sell_ids': []
        }

        res = products_col.insert_one(prod_doc)
        prod_doc['id'] = str(res.inserted_id)
        prod_doc.pop('_id', None)

        return Response(prod_doc, status=status.HTTP_201_CREATED)


class ProductDetailView(APIView):
    """Seller: view, update, or delete a specific product."""
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        try:
            prod_obj_id = ObjectId(product_id)
        except Exception:
            return Response({'error': 'Invalid product ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        prod = products_col.find_one({'_id': prod_obj_id})
        if not prod:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Sellers can only access their own products
        if prod['shop_id'] != request.user.id:
            return Response({'error': 'Access denied. You do not own this product.'}, status=status.HTTP_403_FORBIDDEN)

        cat_name = ''
        try:
            cat = categories_col.find_one({'_id': ObjectId(prod['category_id'])})
            if cat:
                cat_name = cat['name']
        except Exception:
            pass

        data = {
            'id': str(prod['_id']),
            'name': prod['name'],
            'description': prod.get('description', ''),
            'price': prod['price'],
            'discount_price': prod.get('discount_price'),
            'category_id': prod['category_id'],
            'category_name': cat_name,
            'stock_quantity': prod.get('stock_quantity', 0),
            'images': prod.get('images', []),
            'attributes': prod.get('attributes', {}),
            'is_active': prod.get('is_active', True),
            'shop_id': prod['shop_id'],
            'upsell_ids': prod.get('upsell_ids', []),
            'cross_sell_ids': prod.get('cross_sell_ids', [])
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, product_id):
        try:
            prod_obj_id = ObjectId(product_id)
        except Exception:
            return Response({'error': 'Invalid product ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        prod = products_col.find_one({'_id': prod_obj_id})
        if not prod:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'seller' or prod['shop_id'] != request.user.id:
            return Response({'error': 'Access denied. You do not own this product.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        if 'category_id' in data:
            try:
                cat = categories_col.find_one({'_id': ObjectId(data['category_id'])})
                if not cat:
                    return Response({'error': 'Category does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception:
                return Response({'error': 'Invalid category ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        products_col.update_one({'_id': prod_obj_id}, {'$set': data})
        return Response({'message': 'Product updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, product_id):
        try:
            prod_obj_id = ObjectId(product_id)
        except Exception:
            return Response({'error': 'Invalid product ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        prod = products_col.find_one({'_id': prod_obj_id})
        if not prod:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'seller' or prod['shop_id'] != request.user.id:
            return Response({'error': 'Access denied. You do not own this product.'}, status=status.HTTP_403_FORBIDDEN)

        products_col.delete_one({'_id': prod_obj_id})
        return Response({'message': 'Product deleted successfully.'}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
#  SELLER-AUTHENTICATED BANNER MANAGEMENT
# ─────────────────────────────────────────────

class BannerListCreateView(APIView):
    """Seller: manage their own banners."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all banners for the authenticated seller."""
        media_type = request.query_params.get('media_type')
        query = {'shop_id': request.user.id}

        if media_type:
            query['media_type'] = media_type

        banners = list(banners_col.find(query))

        result = []
        for b in banners:
            result.append({
                'id': str(b['_id']),
                'title': b['title'],
                'media_type': b['media_type'],
                'file_url': b['file_url'],
                'start_date': b['start_date'],
                'end_date': b['end_date'],
                'is_active': b.get('is_active', True),
                'target_link': b.get('target_link'),
                'target_product_id': b.get('target_product_id'),
                'shop_id': b.get('shop_id')
            })

        return Response(result, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Access denied. Sellers only.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BannerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        if data['start_date'] >= data['end_date']:
            return Response({'error': 'Start date must be before end date.'}, status=status.HTTP_400_BAD_REQUEST)

        banner_doc = {
            'title': data['title'],
            'media_type': data['media_type'],
            'file_url': data['file_url'],
            'start_date': data['start_date'],
            'end_date': data['end_date'],
            'is_active': data.get('is_active', True),
            'target_link': data.get('target_link'),
            'target_product_id': data.get('target_product_id'),
            'shop_id': request.user.id
        }

        res = banners_col.insert_one(banner_doc)
        banner_doc['id'] = str(res.inserted_id)
        banner_doc.pop('_id', None)

        return Response(banner_doc, status=status.HTTP_201_CREATED)


class BannerDetailView(APIView):
    """Seller: view, update, or delete a specific banner."""
    permission_classes = [IsAuthenticated]

    def get(self, request, banner_id):
        try:
            b_obj_id = ObjectId(banner_id)
        except Exception:
            return Response({'error': 'Invalid banner ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        banner = banners_col.find_one({'_id': b_obj_id})
        if not banner:
            return Response({'error': 'Banner not found.'}, status=status.HTTP_404_NOT_FOUND)

        if banner.get('shop_id') != request.user.id:
            return Response({'error': 'Access denied. You do not own this banner.'}, status=status.HTTP_403_FORBIDDEN)

        data = {
            'id': str(banner['_id']),
            'title': banner['title'],
            'media_type': banner['media_type'],
            'file_url': banner['file_url'],
            'start_date': banner['start_date'],
            'end_date': banner['end_date'],
            'is_active': banner.get('is_active', True),
            'target_link': banner.get('target_link'),
            'target_product_id': banner.get('target_product_id'),
            'shop_id': banner.get('shop_id')
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, banner_id):
        try:
            b_obj_id = ObjectId(banner_id)
        except Exception:
            return Response({'error': 'Invalid banner ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        banner = banners_col.find_one({'_id': b_obj_id})
        if not banner:
            return Response({'error': 'Banner not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'seller' or banner.get('shop_id') != request.user.id:
            return Response({'error': 'Access denied. You do not own this banner.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BannerSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        start_date = data.get('start_date', banner['start_date'])
        end_date = data.get('end_date', banner['end_date'])
        if start_date >= end_date:
            return Response({'error': 'Start date must be before end date.'}, status=status.HTTP_400_BAD_REQUEST)

        banners_col.update_one({'_id': b_obj_id}, {'$set': data})
        return Response({'message': 'Banner updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, banner_id):
        try:
            b_obj_id = ObjectId(banner_id)
        except Exception:
            return Response({'error': 'Invalid banner ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        banner = banners_col.find_one({'_id': b_obj_id})
        if not banner:
            return Response({'error': 'Banner not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'seller' or banner.get('shop_id') != request.user.id:
            return Response({'error': 'Access denied. You do not own this banner.'}, status=status.HTTP_403_FORBIDDEN)

        banners_col.delete_one({'_id': b_obj_id})
        return Response({'message': 'Banner deleted successfully.'}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
#  PUBLIC CUSTOMER INTERFACE VIEWS
#  No authentication required — scoped to seller_id
#  The seller enables "Customer Interface" mode on their device.
#  The app locks the view to this seller's shop only.
# ─────────────────────────────────────────────

class CustomerShopHomeView(APIView):
    """
    PUBLIC — Customer Interface home screen.
    Returns the seller's shop info, active banners, and categories
    available in this shop. No authentication needed.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request, seller_id):
        try:
            seller_obj_id = ObjectId(seller_id)
        except Exception:
            return Response({'error': 'Invalid seller ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        shop = users_col.find_one({'_id': seller_obj_id, 'role': 'seller'})
        if not shop:
            return Response({'error': 'Shop not found.'}, status=status.HTTP_404_NOT_FOUND)

        coords = shop.get('location', {}).get('coordinates', [0.0, 0.0])

        # Find categories available in this shop based on active products
        prod_category_ids = products_col.distinct('category_id', {'shop_id': seller_id, 'is_active': True})

        categories = []
        if prod_category_ids:
            cat_obj_ids = []
            for cid in prod_category_ids:
                try:
                    cat_obj_ids.append(ObjectId(cid))
                except Exception:
                    pass
            cats_db = list(categories_col.find({'_id': {'$in': cat_obj_ids}}))
            for c in cats_db:
                categories.append({
                    'id': str(c['_id']),
                    'name': c['name'],
                    'slug': c['slug'],
                    'parent_id': c.get('parent_id'),
                    'image_url': c.get('image_url')
                })

        # Currently active & scheduled banners for this shop
        now = datetime.now(timezone.utc)
        banners_db = list(banners_col.find({
            'shop_id': seller_id,
            'is_active': True,
            'start_date': {'$lte': now},
            'end_date': {'$gte': now}
        }))
        banners = []
        for b in banners_db:
            banners.append({
                'id': str(b['_id']),
                'title': b['title'],
                'media_type': b['media_type'],
                'file_url': b['file_url'],
                'target_link': b.get('target_link'),
                'target_product_id': b.get('target_product_id')
            })

        return Response({
            'shop': {
                'id': str(shop['_id']),
                'shop_name': shop['shop_name'],
                'shop_description': shop.get('shop_description', ''),
                'shop_address': shop['shop_address'],
                'profile_image': shop.get('profile_image'),
                'location': {
                    'longitude': coords[0],
                    'latitude': coords[1]
                },
                'business_hours': shop.get('business_hours')
            },
            'banners': banners,
            'categories': categories
        }, status=status.HTTP_200_OK)


class CustomerProductsView(APIView):
    """
    PUBLIC — Customer Interface product browsing.
    Lists only active products from the specified seller's shop.
    Supports search, category filter, and sorting.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request, seller_id):
        category_id = request.query_params.get('category_id')
        search_query = request.query_params.get('search')
        sort_by = request.query_params.get('sort_by', 'newest')

        query = {
            'shop_id': seller_id,
            'is_active': True
        }

        if category_id:
            query['category_id'] = category_id

        if search_query:
            query['$text'] = {'$search': search_query}

        cursor = products_col.find(query)

        if sort_by == 'price_asc':
            cursor = cursor.sort('price', 1)
        elif sort_by == 'price_desc':
            cursor = cursor.sort('price', -1)
        else:
            cursor = cursor.sort('_id', -1)

        products = list(cursor)

        result = []
        for prod in products:
            cat_name = ''
            try:
                cat = categories_col.find_one({'_id': ObjectId(prod['category_id'])})
                if cat:
                    cat_name = cat['name']
            except Exception:
                pass

            result.append({
                'id': str(prod['_id']),
                'name': prod['name'],
                'description': prod.get('description', ''),
                'price': prod['price'],
                'discount_price': prod.get('discount_price'),
                'category_id': prod['category_id'],
                'category_name': cat_name,
                'stock_quantity': prod.get('stock_quantity', 0),
                'images': prod.get('images', []),
                'attributes': prod.get('attributes', {})
            })

        return Response(result, status=status.HTTP_200_OK)


class CustomerProductDetailView(APIView):
    """
    PUBLIC — Customer Interface single product screen.
    Returns full product details + upsell/cross-sell product suggestions.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request, seller_id, product_id):
        try:
            prod_obj_id = ObjectId(product_id)
        except Exception:
            return Response({'error': 'Invalid product ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        prod = products_col.find_one({
            '_id': prod_obj_id,
            'shop_id': seller_id,
            'is_active': True
        })
        if not prod:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        cat_name = ''
        try:
            cat = categories_col.find_one({'_id': ObjectId(prod['category_id'])})
            if cat:
                cat_name = cat['name']
        except Exception:
            pass

        def get_linked_products(id_list):
            linked = []
            for pid in id_list:
                try:
                    p = products_col.find_one({'_id': ObjectId(pid), 'is_active': True})
                    if p:
                        linked.append({
                            'id': str(p['_id']),
                            'name': p['name'],
                            'price': p['price'],
                            'discount_price': p.get('discount_price'),
                            'images': p.get('images', []),
                            'stock_quantity': p.get('stock_quantity', 0)
                        })
                except Exception:
                    pass
            return linked

        return Response({
            'id': str(prod['_id']),
            'name': prod['name'],
            'description': prod.get('description', ''),
            'price': prod['price'],
            'discount_price': prod.get('discount_price'),
            'category_id': prod['category_id'],
            'category_name': cat_name,
            'stock_quantity': prod.get('stock_quantity', 0),
            'images': prod.get('images', []),
            'attributes': prod.get('attributes', {}),
            'upsell_products': get_linked_products(prod.get('upsell_ids', [])),
            'cross_sell_products': get_linked_products(prod.get('cross_sell_ids', []))
        }, status=status.HTTP_200_OK)
