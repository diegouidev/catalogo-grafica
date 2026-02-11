from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.ImageField(upload_to='categories/', null=True, blank=True)

    def __str__(self):
        return self.name

class Finishing(models.Model):
    """Ex: Frente e Verso, Só Frente, Verniz Localizado, etc."""
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='products/')
    production_time = models.CharField(max_length=50, help_text="Ex: 2 dias úteis, 5 horas") # Novo campo
    is_active = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False, verbose_name="Destaque")
    finishings = models.ManyToManyField(Finishing, blank=True, verbose_name="Acabamentos")
    
    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    """Aqui gerenciamos as variações como 100un, 500un, 3cm, 5cm etc."""
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    name = models.CharField(max_length=100) # Ex: "500 unidades" ou "Tamanho 3x3cm"
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"


class Banner(models.Model):
    title = models.CharField(max_length=200, blank=True)
    subtitle = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='banners/')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

class CompanyConfig(models.Model):
    name = models.CharField(max_length=100, default="Cloud Design")
    whatsapp = models.CharField(max_length=20)
    instagram = models.CharField(max_length=100)
    address = models.TextField(null=True, blank=True)
    facebook_pixel_id = models.CharField(max_length=50, blank=True, null=True, help_text="Ex: 1234567890")
    google_analytics_id = models.CharField(max_length=50, blank=True, null=True, help_text="Ex: G-XXXXXXXXXX")
    map_iframe = models.TextField(null=True, blank=True, help_text="Cole aqui o iframe do Google Maps")

    def __str__(self):
        return self.name

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percentage = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}%)"