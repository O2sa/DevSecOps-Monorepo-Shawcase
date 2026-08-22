from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken
from users.models import Role

User = get_user_model()


class AuthenticationTests(APITestCase):
    """
    Tests for Authentication (POST /api/auth/login, POST /api/auth/refresh).
    """

    def setUp(self):
        self.login_url = '/api/auth/login'
        self.refresh_url = '/api/auth/refresh'
        self.me_url = '/api/users/me'
        self.password = 'SecurePassword123!'
        self.user = User.objects.create_user(
            username='john',
            email='john@example.com',
            password=self.password,
            role=Role.USER
        )
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password=self.password,
            role=Role.ADMIN
        )

    def test_successful_login(self):
        """Verify valid credentials return JWT access and refresh tokens."""
        payload = {
            'username': 'john',
            'password': self.password
        }
        response = self.client.post(self.login_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_returns_custom_jwt_claims_for_regular_user(self):
        """Verify the login endpoint generates an access token containing all expected custom claims."""
        payload = {
            'username': 'john',
            'password': self.password
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        access_token_str = response.data['access']
        token = AccessToken(access_token_str)

        self.assertEqual(token['user_id'], self.user.id)
        self.assertEqual(token['username'], 'john')
        self.assertEqual(token['email'], 'john@example.com')
        self.assertEqual(token['role'], 'user')
        self.assertEqual(token['is_admin'], False)

    def test_login_returns_custom_jwt_claims_for_admin_user(self):
        """Verify admin login generates token with admin role and is_admin claim."""
        payload = {
            'username': 'admin',
            'password': self.password
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        access_token_str = response.data['access']
        token = AccessToken(access_token_str)

        self.assertEqual(token['user_id'], self.admin_user.id)
        self.assertEqual(token['username'], 'admin')
        self.assertEqual(token['email'], 'admin@example.com')
        self.assertEqual(token['role'], 'admin')
        self.assertEqual(token['is_admin'], True)

    def test_login_invalid_password(self):
        """Verify invalid password returns 401 Unauthorized without leaking sensitive info."""
        payload = {
            'username': 'john',
            'password': 'WrongPassword123!'
        }
        response = self.client.post(self.login_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], 'Invalid credentials.')

    def test_login_nonexistent_user(self):
        """Verify nonexistent username returns 401 Unauthorized."""
        payload = {
            'username': 'nonexistent',
            'password': self.password
        }
        response = self.client.post(self.login_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], 'Invalid credentials.')

    def test_access_token_usage(self):
        """Verify issued access token authorizes access to protected endpoint."""
        login_response = self.client.post(
            self.login_url,
            {'username': 'john', 'password': self.password},
            format='json'
        )
        access_token = login_response.data['access']

        # Request protected /api/users/me endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'john')
        self.assertEqual(response.data['email'], 'john@example.com')

    def test_refresh_token(self):
        """Verify refresh token exchanges for a new valid access token."""
        login_response = self.client.post(
            self.login_url,
            {'username': 'john', 'password': self.password},
            format='json'
        )
        refresh_token = login_response.data['refresh']

        refresh_response = self.client.post(
            self.refresh_url,
            {'refresh': refresh_token},
            format='json'
        )

        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

        # Test that the new access token is functional
        new_access_token = refresh_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_access_token}')
        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
