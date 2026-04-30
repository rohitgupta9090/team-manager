from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from users.permissions import IsAdminRole
from users.serializers import (
    AdminCreateUserSerializer,
    CustomTokenObtainPairSerializer,
    SignupSerializer,
    UserBriefSerializer,
)

User = get_user_model()


class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = (permissions.AllowAny,)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = (permissions.AllowAny,)


class MeView(APIView):
    def get(self, request):
        return Response(UserBriefSerializer(request.user).data)


class MemberListView(generics.ListAPIView):
    """Admin: list users for task assignment UI."""

    permission_classes = (IsAdminRole,)
    serializer_class = UserBriefSerializer
    queryset = User.objects.all().order_by("username")


class AdminCreateUserView(generics.CreateAPIView):
    """Admin: create a user as admin or member (same accounts as signup; they log in with email + password)."""

    permission_classes = (IsAdminRole,)
    serializer_class = AdminCreateUserSerializer
    queryset = User.objects.all()


class DashboardView(APIView):
    """
    Stats: admin sees all tasks; member sees only tasks assigned to them.
    completed = status done; pending = todo + in_progress
    overdue = due_date before today and not done
    """

    def get(self, request):
        from django.utils import timezone

        from tasks.models import Task

        today = timezone.now().date()
        qs = Task.objects.all()
        if request.user.role != User.Role.ADMIN:
            qs = qs.filter(assigned_to=request.user)

        total = qs.count()
        completed = qs.filter(status=Task.Status.DONE).count()
        pending = qs.exclude(status=Task.Status.DONE).count()

        overdue_qs = qs.filter(due_date__isnull=False, due_date__lt=today).exclude(
            status=Task.Status.DONE
        )
        overdue_count = overdue_qs.count()
        overdue_items = [
            {
                "id": t.id,
                "title": t.title,
                "due_date": str(t.due_date) if t.due_date else None,
                "project_id": t.project_id,
                "project_name": t.project.name,
            }
            for t in overdue_qs.select_related("project").order_by("due_date")[:20]
        ]

        return Response(
            {
                "total_tasks": total,
                "completed_tasks": completed,
                "pending_tasks": pending,
                "overdue_count": overdue_count,
                "overdue_items": overdue_items,
            }
        )
