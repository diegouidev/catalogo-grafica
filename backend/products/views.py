from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product, Banner, CompanyConfig
from .serializers import CategorySerializer, ProductSerializer, BannerSerializer, CompanyConfigSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return []

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['views_count', 'id']

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
        category_slug = self.request.query_params.get('category')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

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

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return []

class CompanyConfigViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CompanyConfig.objects.all()
    serializer_class = CompanyConfigSerializer

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