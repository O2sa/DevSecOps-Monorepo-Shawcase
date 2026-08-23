#!/bin/sh
# ==============================================================================
# Identity Service - Docker Entrypoint Script
# Applies pending database migrations and initializes default admin if needed.
# ==============================================================================
set -e

echo "[Identity Service] Checking and applying database migrations..."
python manage.py migrate --noinput

echo "[Identity Service] Ensuring default superadmin account exists..."
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

admin_username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
admin_email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@devsecops.local')
admin_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'AdminPassword123!')

if not User.objects.filter(username=admin_username).exists():
    user = User.objects.create(
        username=admin_username,
        email=admin_email,
        role='admin',
        is_staff=True,
        is_superuser=True
    )
    user.set_password(admin_password)
    user.save()
    print(f'[Identity Service] Initialized superadmin account: {admin_username}')
else:
    print(f'[Identity Service] Superadmin account already exists: {admin_username}')
" || true

echo "[Identity Service] Starting server..."
exec "$@"
