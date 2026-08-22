import datetime
from django.http import JsonResponse

def health_check(request):
    """Simple health check endpoint returning service status."""
    return JsonResponse({
        'status': 'UP',
        'service': 'identity-service',
        'framework': 'Django 5',
        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }, status=200)
