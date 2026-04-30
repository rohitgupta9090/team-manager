from rest_framework.permissions import BasePermission

from users.models import User


class IsAdminRole(BasePermission):
    """Project/task creation: admin role only."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == User.Role.ADMIN
        )


class IsTaskAssignee(BasePermission):
    """PATCH task: assigned member or admin."""

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if getattr(request.user, "role", None) == User.Role.ADMIN:
            return True
        return obj.assigned_to_id == request.user.id
