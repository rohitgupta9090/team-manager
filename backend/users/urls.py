from django.urls import path

from users.views import (
    AdminCreateUserView,
    DashboardView,
    LoginView,
    MeView,
    MemberListView,
    SignupView,
)

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("members/", MemberListView.as_view(), name="members"),
    path("admin/users/", AdminCreateUserView.as_view(), name="admin-create-user"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]
