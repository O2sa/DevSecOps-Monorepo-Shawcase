from django.urls import include, path
from health.views import health_check

urlpatterns = [
    # Health check endpoint (No trailing slash)
    path('health', health_check, name='health_check'),

    # REST API endpoints
    path('api/', include('users.urls')),

    # Root fallback
    path('', health_check, name='root_health_check'),
]
