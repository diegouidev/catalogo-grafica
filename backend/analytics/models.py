from django.db import models

# Create your models here.
class SiteMetric(models.Model):
    total_catalog_views = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Total Views: {self.total_catalog_views}"   