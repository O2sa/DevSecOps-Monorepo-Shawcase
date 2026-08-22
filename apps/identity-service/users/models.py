from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    USER = 'user', 'User'
    ADMIN = 'admin', 'Admin'


class User(AbstractUser):
    """
    Custom User model for Identity Service.
    Enforces unique email, role-based attributes, and audit timestamps.
    """
    email = models.EmailField(unique=True, null=False, blank=False)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ['email']

    class Meta:
        ordering = ['id']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_admin_role(self):
        return self.role == Role.ADMIN or self.is_superuser or self.is_staff
