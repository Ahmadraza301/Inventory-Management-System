web: cd backend && gunicorn inventory_system.wsgi:application --bind 0.0.0.0:$PORT
release: cd backend && python manage.py migrate