from rest_framework import serializers

from projects.models import Project


class ProjectSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Project
        fields = ("id", "name", "created_by", "created_by_username", "created_at")
        read_only_fields = ("id", "created_by", "created_at")

    def validate_name(self, value):
        name = (value or "").strip()
        if not name:
            raise serializers.ValidationError("Project name is required.")
        if len(name) > 255:
            raise serializers.ValidationError("Name must be 255 characters or fewer.")
        return name
