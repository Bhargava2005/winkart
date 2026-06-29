from django.urls import path
from core.views import (
    # Seller-authenticated management
    CategoryListCreateView,
    CategoryDetailView,
    ProductListCreateView,
    ProductDetailView,
    BannerListCreateView,
    BannerDetailView,
    # Public customer interface
    CustomerShopHomeView,
    CustomerProductsView,
    CustomerProductDetailView,
)

urlpatterns = [
    # ── Seller: Category Management ──────────────────────────────
    path('categories/', CategoryListCreateView.as_view(), name='categories-list'),
    path('categories/<str:category_id>/', CategoryDetailView.as_view(), name='categories-detail'),

    # ── Seller: Product Management ───────────────────────────────
    path('products/', ProductListCreateView.as_view(), name='products-list'),
    path('products/<str:product_id>/', ProductDetailView.as_view(), name='products-detail'),

    # ── Seller: Banner Management ────────────────────────────────
    path('banners/', BannerListCreateView.as_view(), name='banners-list'),
    path('banners/<str:banner_id>/', BannerDetailView.as_view(), name='banners-detail'),

    # ── PUBLIC: Customer Interface (no auth, scoped to seller_id) ─
    # Flutter app opens these when seller enables Customer Interface mode
    path('customer/<str:seller_id>/shop/', CustomerShopHomeView.as_view(), name='customer-shop-home'),
    path('customer/<str:seller_id>/products/', CustomerProductsView.as_view(), name='customer-products'),
    path('customer/<str:seller_id>/products/<str:product_id>/', CustomerProductDetailView.as_view(), name='customer-product-detail'),
]
