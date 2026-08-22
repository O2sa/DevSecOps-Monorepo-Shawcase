from rest_framework import status
from rest_framework.test import APITestCase


class HealthEndpointTests(APITestCase):
    """
    Tests for Health Endpoint (GET /health).
    """

    def test_health_endpoint_returns_ok(self):
        """Verify unauthenticated GET /health returns 200 OK with status ok."""
        response = self.client.get('/health')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_root_fallback_health_returns_ok(self):
        """Verify unauthenticated GET / returns 200 OK with status ok."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok"})
