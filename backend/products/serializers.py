from rest_framework import serializers
import json
from .models import Category, Product, ProductVariant, Banner, CompanyConfig, Coupon, Finishing

class VariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'price']

class FinishingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finishing
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    variants = VariantSerializer(many=True, read_only=True)
    finishings = FinishingSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'image', 
            'production_time', 'category', 'category_name', 
            'variants', 'views_count', 'category_slug', 
            'is_featured', 'finishings',
        ]

    def create(self, validated_data):
        # 1. Captura o JSON das variantes
        request = self.context.get('request')
        variants_data = request.data.get('variants_json')
        
        # 2. Cria o produto primeiro
        product = Product.objects.create(**validated_data)
        
        # 3. Processa e cria as variantes vinculadas (ProductVariant)
        if variants_data:
            try:
                variants_list = json.loads(variants_data)
                for variant in variants_list:
                    # Corrigido para ProductVariant
                    ProductVariant.objects.create(
                        product=product,
                        name=variant.get('name'),
                        price=variant.get('price')
                    )
            except Exception as e:
                print(f"Erro ao processar variantes: {e}")
                
        return product


    def update(self, instance, validated_data):
        # 1. Captura o JSON das variantes do request
        request = self.context.get('request')
        variants_data = request.data.get('variants_json')
        
        # 2. Atualiza os campos básicos do produto (nome, descrição, etc)
        # O Django Rest Framework cuida para não sobrescrever a imagem se ela não for enviada (PATCH)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 3. Atualiza as variantes vinculadas
        if variants_data:
            try:
                variants_list = json.loads(variants_data)
                # Lógica simples: removemos as variantes antigas e criamos as novas enviadas
                instance.variants.all().delete()
                for variant in variants_list:
                    ProductVariant.objects.create(
                        product=instance,
                        name=variant.get('name'),
                        price=variant.get('price')
                    )
            except Exception as e:
                print(f"Erro ao atualizar variantes: {e}")
                
        return instance

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'products_count']
        # Torna o slug opcional no envio, pois vamos gerá-lo aqui
        extra_kwargs = {'slug': {'required': False}}

    def create(self, validated_data):
        if 'slug' not in validated_data:
            from django.utils.text import slugify
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'image', 'order']

class CompanyConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyConfig
        fields = ['name', 'whatsapp', 'instagram', 'address', 'map_iframe']


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['code', 'discount_percentage', 'is_active']