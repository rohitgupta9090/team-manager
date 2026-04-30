from django.contrib.auth import get_user_model
from rest_framework import generics, permissions

from users.permissions import IsAdminRole, IsTaskAssignee

from .models import Task
from .serializers import TaskSerializer, TaskUpdateSerializer

User = get_user_model()


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Task.objects.select_related("project", "assigned_to").all()
        project_id = self.request.query_params.get("project_id")
        if project_id:
            qs = qs.filter(project_id=project_id)

        if self.request.user.role == User.Role.ADMIN:
            return qs.order_by("-created_at")
        return qs.filter(assigned_to=self.request.user).order_by("-created_at")


class TaskDetailUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Task.objects.select_related("project", "assigned_to").all()
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT"):
            return [IsTaskAssignee()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return TaskUpdateSerializer
        return TaskSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.select_related("project", "assigned_to").all()
        if user.role == User.Role.ADMIN:
            return qs
        return qs.filter(assigned_to=user)
