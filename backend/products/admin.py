from django.contrib import admin
from .models import Category, Product, ProductVariant, Banner, CompanyConfig, Coupon, Finishing, Kit, ExitPopupConfig

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
    list_display = ('name', 'category', 'is_on_sale', 'discount_percent', 'is_active') 
    list_filter = ('category', 'is_on_sale', 'is_active')
    list_editable = ('is_on_sale', 'discount_percent', 'is_active')
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

@admin.register(Kit)
class KitAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'is_active', 'created_at')
    search_fields = ('name',)
    filter_horizontal = ('products',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(ExitPopupConfig)
class ExitPopupConfigAdmin(admin.ModelAdmin):
    list_display = ('name', 'coupon_code', 'is_active', 'minimum_cart_value', 'timer_minutes')
    list_editable = ('is_active',)