from rest_framework import serializers

from projects.models import Project
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["project"].queryset = Project.objects.filter(owner=request.user)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "project",
            "project_name",
            "status",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "project_name", "created_at", "updated_at"]

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Enter a task name.")
        return value
