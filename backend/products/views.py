from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product, Banner, CompanyConfig, Coupon, Finishing, Kit, ExitPopupConfig
from .serializers import CategorySerializer, ProductSerializer, BannerSerializer, CompanyConfigSerializer, CouponSerializer, FinishingSerializer, KitSerializer, ExitPopupConfigSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return []

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['views_count', 'id']
    filterset_fields = ['category__slug', 'is_featured']
    search_fields = ['name', 'description']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Endpoint para contar visualização: POST /api/products/{id}/increment_view/"""
        product = self.get_object()
        product.views_count += 1
        product.save()
        return Response({'status': 'visualização computada', 'total': product.views_count})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1  # Lógica de visualização
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Filtros existentes
        category_slug = self.request.query_params.get('category')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
    
        slug = self.request.query_params.get('slug')
        if slug:
            queryset = queryset.filter(slug=slug)

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        if min_price:
            queryset = queryset.filter(variants__price__gte=min_price).distinct()
            
        if max_price:
            queryset = queryset.filter(variants__price__lte=max_price).distinct()

        return queryset


class BannerViewSet(viewsets.ModelViewSet): 
    queryset = Banner.objects.filter(is_active=True)
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return []

class CompanyConfigViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CompanyConfig.objects.all()
    serializer_class = CompanyConfigSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated] # Apenas logados veem os dados

    def get(self, request):
        total_views = Product.objects.aggregate(Sum('views_count'))['views_count__sum'] or 0
        top_products = Product.objects.order_by('-views_count')[:10]
        
        serializer = ProductSerializer(top_products, many=True)
        
        return Response({
            "total_catalog_views": total_views,
            "ranking": serializer.data
        })

class CouponViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Coupon.objects.filter(is_active=True)
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'])
    def validate(self, request):
        code = request.query_params.get('code')
        try:
            coupon = Coupon.objects.get(code__iexact=code, is_active=True)
            return Response({
                'code': coupon.code,
                'discount_percentage': coupon.discount_percentage
            })
        except Coupon.DoesNotExist:
            return Response({'error': 'Cupom inválido'}, status=status.HTTP_404_NOT_FOUND)


class FinishingViewSet(viewsets.ModelViewSet):
    queryset = Finishing.objects.all()
    serializer_class = FinishingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return []


class KitViewSet(viewsets.ModelViewSet):
    serializer_class = KitSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'price']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Se for cliente acessando, mostra só os ativos.
        # No painel admin (onde usamos token), vamos buscar todos no frontend
        queryset = Kit.objects.all().order_by('-created_at')
        
        slug = self.request.query_params.get('slug')
        is_active = self.request.query_params.get('is_active')

        if slug:
            queryset = queryset.filter(slug=slug)
            
        if is_active == 'true':
            queryset = queryset.filter(is_active=True)

        return queryset

class ExitPopupConfigViewSet(viewsets.ModelViewSet):
    queryset = ExitPopupConfig.objects.all()
    serializer_class = ExitPopupConfigSerializer
    permission_classes = [permissions.AllowAny] # Público

    def get_queryset(self):
        # Retorna apenas o ativo mais recente (ou o primeiro da lista)
        return ExitPopupConfig.objects.filter(is_active=True).order_by('-created_at')[:1]