from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class UserRegistrationTests(APITestCase):
    """
    Tests for User Registration (POST /api/auth/register).
    """

    def setUp(self):
        self.register_url = '/api/auth/register'
        self.valid_payload = {
            'username': 'john',
            'email': 'john@example.com',
            'password': 'SecurePassword123!'
        }

    def test_successful_registration(self):
        """Verify new user can register successfully with valid credentials."""
        response = self.client.post(self.register_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['username'], 'john')
        self.assertEqual(response.data['email'], 'john@example.com')
        self.assertEqual(response.data['role'], 'user')
        self.assertNotIn('password', response.data)

        # Verify database record and password hashing
        user = User.objects.get(username='john')
        self.assertTrue(user.check_password('SecurePassword123!'))
        self.assertNotEqual(user.password, 'SecurePassword123!')

    def test_duplicate_username_registration_fails(self):
        """Verify registration fails when username already exists."""
        User.objects.create_user(
            username='john',
            email='other@example.com',
            password='Password123!'
        )

        response = self.client.post(self.register_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)
        self.assertIn('username', response.data['errors'])

    def test_duplicate_email_registration_fails(self):
        """Verify registration fails when email already exists."""
        User.objects.create_user(
            username='otheruser',
            email='john@example.com',
            password='Password123!'
        )

        response = self.client.post(self.register_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)
        self.assertIn('email', response.data['errors'])

    def test_registration_missing_fields_fails(self):
        """Verify validation errors when required fields are missing."""
        response = self.client.post(self.register_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)
        self.assertIn('username', response.data['errors'])
        self.assertIn('email', response.data['errors'])
        self.assertIn('password', response.data['errors'])

    def test_registration_short_password_fails(self):
        """Verify password validation rejects passwords under 8 characters."""
        payload = {
            'username': 'john',
            'email': 'john@example.com',
            'password': 'short'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)
        self.assertIn('password', response.data['errors'])
