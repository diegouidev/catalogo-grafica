from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, BannerViewSet, CompanyConfigViewSet, DashboardStatsView, CouponViewSet, FinishingViewSet, KitViewSet, ExitPopupConfigViewSet

# O router cria rotas como /api/products/ e /api/products/1/ automaticamente
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'banners', BannerViewSet, basename='banner')
router.register(r'company-config', CompanyConfigViewSet, basename='company-config')
router.register(r'finishings', FinishingViewSet, basename='finishing')
router.register(r'coupons', CouponViewSet)
router.register(r'kits', KitViewSet, basename='kit')
router.register(r'popup-config', ExitPopupConfigViewSet, basename='popup-config')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]