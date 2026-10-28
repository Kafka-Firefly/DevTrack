"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path
from django.conf import settings
from django.views.generic import TemplateView
from .views import health
from .auth_views import csrf_token, current_user, login_view, logout_view, register_view

urlpatterns = [
    path("api/health/", health, name="health"),
    path("api/auth/csrf/", csrf_token, name="csrf-token"),
    path("api/auth/me/", current_user, name="current-user"),
    path("api/auth/register/", register_view, name="register"),
    path("api/auth/login/", login_view, name="login"),
    path("api/auth/logout/", logout_view, name="logout"),
    path("api/", include("projects.urls")),
    path("api/", include("tasks.urls")),
]

if (settings.VITE_BUILD_DIR / "index.html").exists():
    urlpatterns.append(path("", TemplateView.as_view(template_name="index.html"), name="frontend"))
