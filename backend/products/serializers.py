from rest_framework import serializers
import json
from .models import Category, Product, ProductVariant, Banner, CompanyConfig, Coupon, Finishing
from django.conf import settings

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
    # Forçamos a imagem a ser um SerializerMethodField para controlar a URL
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'image', 
            'production_time', 'category', 'category_name', 
            'variants', 'finishings', 'is_featured',
            'views_count', 'category_slug'
        ]

    def get_image(self, obj):
        # Retorna o caminho absoluto da URL (ex: /media/products/img.jpg)
        if obj.image:
            return f"{settings.MEDIA_URL}{obj.image}"
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        variants_data = request.data.get('variants_json')
        finishings_data = request.data.get('finishings_json')
        
        product = Product.objects.create(**validated_data)
        
        if variants_data:
            try:
                variants_list = json.loads(variants_data)
                for variant in variants_list:
                    ProductVariant.objects.create(
                        product=product, name=variant.get('name'), price=variant.get('price')
                    )
            except: pass

        if finishings_data:
            try:
                finishings_ids = json.loads(finishings_data)
                product.finishings.set(finishings_ids)
            except Exception as e:
                print(f"Erro acabamentos: {e}")
                
        return product

    def update(self, instance, validated_data):
        request = self.context.get('request')
        variants_data = request.data.get('variants_json')
        finishings_data = request.data.get('finishings_json')

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if variants_data:
            try:
                variants_list = json.loads(variants_data)
                instance.variants.all().delete()
                for v in variants_list:
                    ProductVariant.objects.create(
                        product=instance, name=v.get('name'), price=v.get('price')
                    )
            except: pass
            
        if finishings_data:
            try:
                finishings_ids = json.loads(finishings_data)
                instance.finishings.set(finishings_ids)
            except: pass

        return instance

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'products_count']
        extra_kwargs = {'slug': {'required': False}}

    def create(self, validated_data):
        if 'slug' not in validated_data:
            from django.utils.text import slugify
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class BannerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'image', 'image_mobile', 'link', 'is_active', 'order']

    def get_image(self, obj):
        if obj.image:
            return f"{settings.MEDIA_URL}{obj.image}"
        return None

class CompanyConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyConfig
        fields = ['name', 'whatsapp', 'instagram', 'address', 'map_iframe', 'facebook_pixel_id', 'google_analytics_id']


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['code', 'discount_percentage', 'is_active']