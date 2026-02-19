from django.db import models
from django.utils.text import slugify

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
    slug = models.SlugField(unique=True, blank=True, max_length=250, help_text="URL amigável para SEO")
    is_featured = models.BooleanField(default=False, verbose_name="Destaque")
    finishings = models.ManyToManyField(Finishing, blank=True, verbose_name="Acabamentos")

    upsell_products = models.ManyToManyField(
        'self', 
        blank=True, 
        symmetrical=False, 
        help_text="Selecione produtos para a seção 'Compre Junto'"
    )

    is_meter_price = models.BooleanField(
        default=False,
        verbose_name="Vendido por M²",
        help_text="Marque se este produto usa calculadora de largura x altura (ex: Lonas, Adesivos)"
    )

    # (Opcional) Se você quiser flexibilidade no futuro para mudar o limite de 0.5m²
    # min_meter_area = models.DecimalField(
    #     max_digits=5, decimal_places=2, default=0.50,
    #     verbose_name="Área Mínima Cobrada (m²)"
    # )
    
    def save(self, *args, **kwargs):
        if not self.slug:
            # Cria o slug baseado no nome (Ex: "Cartão de Visita" -> "cartao-de-visita")
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            # Garante que seja único se já existir outro igual
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

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
    image_mobile = models.ImageField(
        upload_to='banners/', 
        verbose_name="Imagem Mobile (Vertical)", 
        blank=True, 
        null=True,
        help_text="Formato recomendado: 800x1000px (Retrato)"
    )
    link = models.URLField(max_length=500, blank=True, verbose_name="Link de Destino")
    is_active = models.BooleanField(default=True, verbose_name="Ativo?")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True) # <--- O CAMPO QUE FALTAVA

    class Meta:
        verbose_name = "Banner"
        verbose_name_plural = "Banners"
        ordering = ['-created_at']

    def __str__(self):
        return self.title

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


class Kit(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True, max_length=250, help_text="URL amigável")
    description = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='kits/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Preço promocional do combo")
    
    # É aqui que a mágica acontece: vinculamos os produtos ao Kit
    products = models.ManyToManyField(Product, related_name='kits', blank=True, help_text="Produtos que compõem este kit")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            # Cria o slug baseado no nome do kit (Ex: "Kit Empreendedor" -> "kit-empreendedor")
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Kit.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ExitPopupConfig(models.Model):
    name = models.CharField(max_length=100, help_text="Nome interno para identificação")
    image = models.ImageField(upload_to='popups/', help_text="Banner que aparecerá (Ex: 600x400px)")
    coupon_code = models.CharField(max_length=50, default="BEMVINDO", help_text="Código do cupom que será copiado (Ex: PRIMEIRACOMPRA)")
    
    # Regras de Exibição
    is_active = models.BooleanField(default=False, verbose_name="Ativar Pop-up?")
    minimum_cart_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Mostrar apenas se o carrinho for maior que...")
    timer_minutes = models.IntegerField(default=5, help_text="Tempo do contador regressivo (em minutos)")
    
    # Controle
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Configuração do Pop-up"
        verbose_name_plural = "Configurações do Pop-up"

    def __str__(self):
        return f"{self.name} - {'Ativo' if self.is_active else 'Inativo'}"