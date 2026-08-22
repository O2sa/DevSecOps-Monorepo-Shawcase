from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Role

User = get_user_model()


class AuthorizationTests(APITestCase):
    """
    Tests for Authorization and Role-Based Permissions (No trailing slash convention).
    """

    def setUp(self):
        self.login_url = '/api/auth/login'
        self.me_url = '/api/users/me'
        self.users_url = '/api/users'
        self.password = 'SecurePassword123!'

        # Regular user
        self.regular_user = User.objects.create_user(
            username='regularuser',
            email='regular@example.com',
            password=self.password,
            role=Role.USER
        )

        # Admin user
        self.admin_user = User.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password=self.password,
            role=Role.ADMIN
        )

    def _get_token_via_login(self, username):
        response = self.client.post(
            self.login_url,
            {'username': username, 'password': self.password},
            format='json'
        )
        return response.data['access']

    def test_unauthenticated_access_to_me_endpoint_rejected(self):
        """Verify unauthenticated requests to /api/users/me are rejected with 401."""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_access_to_users_endpoint_rejected(self):
        """Verify unauthenticated requests to /api/users are rejected with 401."""
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_access_to_me_endpoint_allowed(self):
        """Verify authenticated user receives their own user profile."""
        token = self._get_token_via_login('regularuser')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.regular_user.id)
        self.assertEqual(response.data['username'], 'regularuser')
        self.assertEqual(response.data['email'], 'regular@example.com')
        self.assertEqual(response.data['role'], 'user')
        self.assertNotIn('password', response.data)

    def test_regular_user_denied_access_to_admin_users_list(self):
        """Verify standard user is forbidden (403) from listing all users."""
        token = self._get_token_via_login('regularuser')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('detail', response.data)
        self.assertEqual(
            response.data['detail'],
            'You do not have permission to perform this action.'
        )

    def test_admin_user_allowed_access_to_users_list(self):
        """Verify admin user can list all registered users."""
        token = self._get_token_via_login('adminuser')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 2)

        # Ensure safe response schema
        first_user = response.data['results'][0]
        self.assertIn('id', first_user)
        self.assertIn('username', first_user)
        self.assertIn('email', first_user)
        self.assertIn('role', first_user)
        self.assertNotIn('password', first_user)
