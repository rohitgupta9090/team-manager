from django.urls import path

from tasks.views import TaskDetailUpdateView, TaskListCreateView

urlpatterns = [
    path("tasks/", TaskListCreateView.as_view(), name="task-list-create"),
    path("tasks/<int:pk>/", TaskDetailUpdateView.as_view(), name="task-detail-update"),
]
