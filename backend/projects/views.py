from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from .models import Project
from .serializers import ProjectSerializer


class ProjectListCreateView(ListCreateAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)
