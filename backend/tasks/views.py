from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from .models import Task
from .serializers import TaskSerializer


class TaskListCreateView(ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.select_related("project").filter(project__owner=self.request.user)
        project_id = self.request.query_params.get("project")
        status = self.request.query_params.get("status")
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if status in Task.Status.values:
            queryset = queryset.filter(status=status)
        return queryset


class TaskDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.select_related("project").filter(project__owner=self.request.user)
