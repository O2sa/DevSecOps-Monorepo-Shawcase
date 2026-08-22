from django.urls import include, path

urlpatterns = [
    # Health check endpoint
    path('health/', include('health.urls')),
    path('health', include('health.urls')),

    # REST API endpoints
    path('api/', include('users.urls')),

    # Root fallback
    path('', include('health.urls')),
]
