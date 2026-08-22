from django.urls import path
from .views import (
    CurrentUserView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    RegisterView,
    UserListView,
)

urlpatterns = [
    # Auth endpoints
    path('auth/register', RegisterView.as_view(), name='register'),
    path('auth/register/', RegisterView.as_view(), name='register_slash'),
    path('auth/login', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login_slash'),
    path('auth/refresh', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh_slash'),

    # User management endpoints
    path('users/me', CurrentUserView.as_view(), name='current_user'),
    path('users/me/', CurrentUserView.as_view(), name='current_user_slash'),
    path('users', UserListView.as_view(), name='user_list'),
    path('users/', UserListView.as_view(), name='user_list_slash'),
]
