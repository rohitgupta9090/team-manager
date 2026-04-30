from rest_framework import serializers

from tasks.models import Task


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source="assigned_to.username", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "status",
            "assigned_to",
            "assigned_to_username",
            "project",
            "project_name",
            "due_date",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate_title(self, value):
        title = (value or "").strip()
        if not title:
            raise serializers.ValidationError("Title is required.")
        if len(title) > 255:
            raise serializers.ValidationError("Title must be 255 characters or fewer.")
        return title

    def validate_description(self, value):
        if value is None:
            return ""
        return value.strip() if isinstance(value, str) else value


class TaskUpdateSerializer(serializers.ModelSerializer):
    """Assignee updates status (other fields optional read-only on PATCH)."""

    class Meta:
        model = Task
        fields = ("status",)
