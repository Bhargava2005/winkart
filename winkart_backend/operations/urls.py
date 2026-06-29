from django.urls import path
from operations.views import (
    CartView,
    CheckoutView,
    SellerBillsListView,
    BillDetailView,
    DownloadInvoiceView,
    BulkImportProductsView,
    BulkExportDataView,
    ImportHistoryLogView
)

urlpatterns = [
    # ── Cart (PUBLIC, seller_id scoped) ──────────────────────────
    # Seller enables Customer Interface → Flutter passes seller_id in URL
    path('cart/<str:seller_id>/', CartView.as_view(), name='cart'),

    # ── Checkout (SELLER authenticated) ──────────────────────────
    # Seller presses "Generate Bill" after customer finishes selection
    path('checkout/<str:seller_id>/', CheckoutView.as_view(), name='checkout'),

    # ── Bills (SELLER authenticated) ─────────────────────────────
    path('bills/', SellerBillsListView.as_view(), name='seller-bills'),
    path('bills/<str:bill_id>/', BillDetailView.as_view(), name='bill-detail'),
    path('bills/<str:bill_id>/download/', DownloadInvoiceView.as_view(), name='download-invoice'),

    # ── Import / Export (SELLER authenticated) ───────────────────
    path('products/import/', BulkImportProductsView.as_view(), name='products-import'),
    path('products/import/history/', ImportHistoryLogView.as_view(), name='import-history'),
    path('products/export/', BulkExportDataView.as_view(), name='products-export'),
]
