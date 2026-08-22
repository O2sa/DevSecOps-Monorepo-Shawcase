from django.test import TestCase, Client

class CorsIntegrationTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_preflight_options_for_allowed_origin(self):
        response = self.client.options(
            '/api/auth/login',
            HTTP_ORIGIN='http://localhost:3000',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='authorization, content-type',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get('Access-Control-Allow-Origin'), 'http://localhost:3000')
        self.assertIn('authorization', response.headers.get('Access-Control-Allow-Headers', '').lower())
        self.assertIn('content-type', response.headers.get('Access-Control-Allow-Headers', '').lower())

    def test_preflight_options_for_register(self):
        response = self.client.options(
            '/api/auth/register',
            HTTP_ORIGIN='http://localhost:3000',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get('Access-Control-Allow-Origin'), 'http://localhost:3000')

    def test_cors_header_present_on_post_request(self):
        response = self.client.post(
            '/api/auth/login',
            data={'username': 'test', 'password': 'Password123!'},
            content_type='application/json',
            HTTP_ORIGIN='http://localhost:3000',
        )
        self.assertEqual(response.headers.get('Access-Control-Allow-Origin'), 'http://localhost:3000')

    def test_disallowed_origin_rejected(self):
        response = self.client.options(
            '/api/auth/login',
            HTTP_ORIGIN='http://malicious-site.com',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='authorization, content-type',
        )
        self.assertIsNone(response.headers.get('Access-Control-Allow-Origin'))
