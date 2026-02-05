from django.contrib import admin
from .models import Category, Product, ProductVariant, Banner, CompanyConfig, Coupon, Finishing

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    # O prepopulated_fields faz o slug ser preenchido sozinho enquanto você digita o nome
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

class VariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1 # Quantidade de linhas em branco para novas variantes

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Adicionando 'production_time' na listagem para facilitar o controle
    list_display = ('name', 'category', 'production_time', 'views_count', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')
    inlines = [VariantInline]
    readonly_fields = ('views_count',)
    filter_horizontal = ('finishings',)

admin.site.register(Banner)
admin.site.register(CompanyConfig)

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percentage', 'is_active')
    search_fields = ('code',)
    list_filter = ('is_active',)


@admin.register(Finishing)
class FinishingAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
