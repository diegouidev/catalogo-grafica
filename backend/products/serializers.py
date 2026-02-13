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

# --- NOVO: SERIALIZER DO COMPRE JUNTO ---
class UpsellProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    starting_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'image', 'starting_price']

    def get_image(self, obj):
        if obj.image:
            return f"{settings.MEDIA_URL}{obj.image}"
        return None

    def get_starting_price(self, obj):
        first_variant = obj.variants.first()
        return first_variant.price if first_variant else 0
# -----------------------------------------

class ProductSerializer(serializers.ModelSerializer):
    variants = VariantSerializer(many=True, read_only=True)
    finishings = FinishingSerializer(many=True, read_only=True)
    upsell_products = UpsellProductSerializer(many=True, read_only=True) # <--- NOVO
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'image',
            'production_time', 'category', 'category_name', 
            'variants', 'finishings', 'is_featured',
            'views_count', 'category_slug', 'upsell_products'
        ]

    def get_image(self, obj):
        if obj.image:
            return f"{settings.MEDIA_URL}{obj.image}"
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        variants_data = request.data.get('variants_json')
        finishings_data = request.data.get('finishings_json')
        upsells_data = request.data.get('upsells_json') # <--- NOVO
        
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
            except: pass

        if upsells_data: # <--- NOVO
            try:
                upsell_ids = json.loads(upsells_data)
                product.upsell_products.set(upsell_ids)
            except: pass
                
        return product

    def update(self, instance, validated_data):
        request = self.context.get('request')
        variants_data = request.data.get('variants_json')
        finishings_data = request.data.get('finishings_json')
        upsells_data = request.data.get('upsells_json') # <--- NOVO

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

        if upsells_data: # <--- NOVO
            try:
                upsell_ids = json.loads(upsells_data)
                instance.upsell_products.set(upsell_ids)
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