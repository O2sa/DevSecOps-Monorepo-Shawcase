from django.http import JsonResponse


def health_check(request):
    """Lightweight, unauthenticated health check endpoint."""
    return JsonResponse({"status": "ok"}, status=200)
