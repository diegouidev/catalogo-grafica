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
    finishings = FinishingSerializer(many=True, read_only=True) # Leitura (objetos completos)
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'image', 
            'production_time', 'category', 'category_name', 
            'variants', 'finishings', 'is_featured', # Adicione finishings aqui
            'views_count', 'category_slug'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        variants_data = request.data.get('variants_json')
        finishings_data = request.data.get('finishings_json') # Captura o JSON de IDs
        
        product = Product.objects.create(**validated_data)
        
        # Salva Variantes
        if variants_data:
            try:
                variants_list = json.loads(variants_data)
                for variant in variants_list:
                    ProductVariant.objects.create(
                        product=product, name=variant.get('name'), price=variant.get('price')
                    )
            except: pass

        # Salva Acabamentos
        if finishings_data:
            try:
                finishings_ids = json.loads(finishings_data) # Espera uma lista de IDs [1, 2, 5]
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

        # Atualiza Variantes
        if variants_data:
            try:
                variants_list = json.loads(variants_data)
                instance.variants.all().delete()
                for v in variants_list:
                    ProductVariant.objects.create(
                        product=instance, name=v.get('name'), price=v.get('price')
                    )
            except: pass
            
        # Atualiza Acabamentos
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