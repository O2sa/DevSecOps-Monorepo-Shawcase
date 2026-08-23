from django.urls import re_path
from .views import (
    CurrentUserView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    RegisterView,
    UserListView,
)

urlpatterns = [
    # Auth endpoints (Supports both trailing and non-trailing slash)
    re_path(r'^auth/register/?$', RegisterView.as_view(), name='register'),
    re_path(r'^auth/login/?$', CustomTokenObtainPairView.as_view(), name='login'),
    re_path(r'^auth/refresh/?$', CustomTokenRefreshView.as_view(), name='token_refresh'),

    # User management endpoints
    re_path(r'^users/me/?$', CurrentUserView.as_view(), name='current_user'),
    re_path(r'^users/?$', UserListView.as_view(), name='user_list'),
]
