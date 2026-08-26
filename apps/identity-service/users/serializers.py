from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Role

User = get_user_model()


class UserReadSerializer(serializers.ModelSerializer):
    """
    Serializer for public/safe user profiles. Never exposes password or internal hashes.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['id', 'username', 'email', 'role']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for registering a new user.
    Enforces Django's configured password validation, input validation, and unique fields.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']
        read_only_fields = ['id', 'role']

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("This field is required.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("This field is required.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value.lower()

    def validate(self, attrs):
        password = attrs.get('password')
        username = attrs.get('username')
        email = attrs.get('email')

        # Use Django's standard password validation with full user context
        if password:
            temp_user = User(username=username, email=email)
            try:
                validate_password(password, user=temp_user)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({"password": list(exc.messages)})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        try:
            with transaction.atomic():
                user = User(
                    username=validated_data['username'],
                    email=validated_data['email'],
                    role=Role.USER
                )
                user.set_password(password)
                user.save()
                return user
        except IntegrityError as exc:
            # Handle potential race conditions where uniqueness check passed but concurrent insert collided
            err_msg = str(exc).lower()
            if 'username' in err_msg:
                raise serializers.ValidationError(
                    {"username": ["A user with that username already exists."]}
                )
            elif 'email' in err_msg:
                raise serializers.ValidationError(
                    {"email": ["A user with that email already exists."]}
                )
            else:
                raise serializers.ValidationError(
                    {"username": ["A user with that username or email already exists."]}
                )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer adding role and profile claims into the generated token payload.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Custom claims for microservice authorization
        token['user_id'] = user.id
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['is_admin'] = user.is_admin_role

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Return only access and refresh tokens
        return data
