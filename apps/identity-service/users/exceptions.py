from rest_framework.views import exception_handler
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler providing consistent, safe error formats.
    """
    response = exception_handler(exc, context)

    if response is None:
        # Unhandled exception
        return Response(
            {"detail": "An unexpected server error occurred."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # 400 Validation Errors
    if response.status_code == status.HTTP_400_BAD_REQUEST:
        if isinstance(response.data, dict) and 'detail' not in response.data:
            response.data = {
                "detail": "Validation failed",
                "errors": response.data
            }

    # 401 Authentication Failures
    elif response.status_code == status.HTTP_401_UNAUTHORIZED:
        # Standardize JWT and authentication error messages
        detail = response.data.get('detail', '')
        if 'No active account found' in str(detail) or 'credentials' in str(detail).lower():
            response.data = {"detail": "Invalid credentials."}
        elif isinstance(response.data, dict) and 'detail' not in response.data:
            response.data = {"detail": "Authentication credentials were not provided."}

    # 403 Authorization Failures
    elif response.status_code == status.HTTP_403_FORBIDDEN:
        response.data = {"detail": "You do not have permission to perform this action."}

    return response
