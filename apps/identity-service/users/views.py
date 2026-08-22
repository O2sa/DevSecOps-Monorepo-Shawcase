from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .exceptions import custom_exception_handler
from .models import Role
from .permissions import IsAdminRole
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserReadSerializer,
    UserRegistrationSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register
    Public endpoint for registering a new user account.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        read_serializer = UserReadSerializer(user)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login
    Public endpoint for authenticating credentials and issuing JWTs.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class CustomTokenRefreshView(TokenRefreshView):
    """
    POST /api/auth/refresh
    Public endpoint for exchanging a valid refresh token for a new access token.
    """
    permission_classes = [AllowAny]


class CurrentUserView(APIView):
    """
    GET /api/users/me
    Protected endpoint returning profile information for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserReadSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserListView(APIView):
    """
    GET /api/users
    Protected endpoint restricted to administrators listing all users.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, *args, **kwargs):
        users = User.objects.all().order_by('id')
        serializer = UserReadSerializer(users, many=True)
        return Response({"results": serializer.data}, status=status.HTTP_200_OK)
