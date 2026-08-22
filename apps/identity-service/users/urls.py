from django.urls import path
from .views import (
    CurrentUserView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    RegisterView,
    UserListView,
)

urlpatterns = [
    # Auth endpoints (No trailing slash)
    path('auth/register', RegisterView.as_view(), name='register'),
    path('auth/login', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh', CustomTokenRefreshView.as_view(), name='token_refresh'),

    # User management endpoints (No trailing slash)
    path('users/me', CurrentUserView.as_view(), name='current_user'),
    path('users', UserListView.as_view(), name='user_list'),
]
