from django.urls import path, include

urlpatterns = [
    path('health/', include('health.urls')),
    path('', include('health.urls')), # root fallback
]
