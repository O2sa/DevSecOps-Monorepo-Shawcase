from rest_framework.permissions import BasePermission
from .models import Role


class IsAdminRole(BasePermission):
    """
    Custom permission to only allow users with the 'admin' role (or superusers/staff).
    """
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (getattr(request.user, 'role', None) == Role.ADMIN or getattr(request.user, 'is_admin_role', False))
        )
