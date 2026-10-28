from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    due_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

# Create your models here.
