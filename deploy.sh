#!/bin/bash
# Production deployment script for Inventory Management System

echo "🚀 Starting Production Deployment..."

# Set production environment
export DJANGO_SETTINGS_MODULE=inventory_system.production_settings

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Collect static files
echo "🗃️ Collecting static files..."
cd backend
python manage.py collectstatic --noinput

# Run migrations
echo "🔄 Running migrations..."
python manage.py migrate

# Create superuser if needed (optional)
echo "👤 Creating superuser (if needed)..."
python manage.py shell -c "
from apps.authentication.models import User
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

echo "✅ Deployment complete!"
echo "🌐 Your application is ready to serve!"