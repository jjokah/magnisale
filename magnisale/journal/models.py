from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()


class Journal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="journals")
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    mood = models.CharField(max_length=50, blank=True)
    tags = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.created_at.strftime('%Y-%m-%d')}"
