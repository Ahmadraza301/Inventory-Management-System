#!/usr/bin/env python3
"""
Automated Deployment Script for Render.com
Prepares the project for deployment and provides deployment instructions
"""

import os
import json
import subprocess
import sys
from pathlib import Path

class RenderDeployment:
    def __init__(self):
        self.project_root = Path.cwd()
        self.backend_dir = self.project_root / "backend"
        self.frontend_dir = self.project_root / "frontend"
        
    def check_prerequisites(self):
        """Check if all required files and directories exist"""
        print("🔍 Checking prerequisites...")
        
        required_files = [
            "requirements.txt",
            "runtime.txt", 
            "Procfile",
            "render.yaml",
            "build.sh",
            "backend/manage.py",
            "backend/inventory_system/production_settings.py",
            "frontend/package.json",
            "frontend/src/App.js"
        ]
        
        missing_files = []
        for file_path in required_files:
            if not (self.project_root / file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            print(f"❌ Missing required files: {', '.join(missing_files)}")
            return False
        
        print("✅ All required files present")
        return True
    
    def update_frontend_config(self):
        """Update frontend configuration for production"""
        print("🔧 Updating frontend configuration...")
        
        # Update package.json with production build settings
        package_json_path = self.frontend_dir / "package.json"
        if package_json_path.exists():
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Add homepage for production
            package_data["homepage"] = "."
            
            # Ensure build script exists
            if "scripts" not in package_data:
                package_data["scripts"] = {}
            
            package_data["scripts"]["build"] = "react-scripts build"
            
            with open(package_json_path, 'w') as f:
                json.dump(package_data, f, indent=2)
            
            print("✅ Frontend package.json updated")
        
        # Create production environment file
        env_prod_path = self.frontend_dir / ".env.production"
        env_content = """REACT_APP_API_URL=https://inventory-backend.onrender.com
GENERATE_SOURCEMAP=false
"""
        with open(env_prod_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("✅ Frontend .env.production created")
    
    def create_render_config(self):
        """Create or update render.yaml configuration"""
        print("📝 Creating Render configuration...")
        
        render_config = """services:
  # Backend Django API
  - type: web
    name: inventory-backend
    env: python
    buildCommand: |
      pip install -r requirements.txt
      cd backend
      python manage.py collectstatic --noinput
      python manage.py migrate
    startCommand: |
      cd backend
      gunicorn inventory_system.wsgi:application --bind 0.0.0.0:$PORT
    envVars:
      - key: DJANGO_SETTINGS_MODULE
        value: inventory_system.production_settings
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: "False"
      - key: ALLOWED_HOSTS
        value: "*"
      - key: DATABASE_URL
        fromDatabase:
          name: inventory-db
          property: connectionString

  # Frontend React App
  - type: web
    name: inventory-frontend
    env: node
    buildCommand: |
      cd frontend
      npm install
      npm run build
    startCommand: |
      cd frontend
      npx serve -s build -l $PORT
    envVars:
      - key: REACT_APP_API_URL
        value: https://inventory-backend.onrender.com

# Database
databases:
  - name: inventory-db
    databaseName: inventory_management
    user: inventory_user
"""
        
        with open(self.project_root / "render.yaml", 'w', encoding='utf-8') as f:
            f.write(render_config)
        
        print("✅ render.yaml created")
    
    def create_build_script(self):
        """Create build script for backend"""
        print("🔨 Creating build script...")
        
        build_script = """#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit  # exit on error

echo "🚀 Starting build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Navigate to backend
cd backend

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create superuser if it doesn't exist
echo "👤 Creating superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Create sample data
echo "📊 Creating sample data..."
python create_sample_data.py

echo "✅ Build completed successfully!"
"""
        
        with open(self.project_root / "build.sh", 'w', encoding='utf-8') as f:
            f.write(build_script)
        
        print("✅ build.sh created")
    
    def check_git_status(self):
        """Check git status and provide instructions"""
        print("📋 Checking Git status...")
        
        try:
            # Check if git repo exists
            result = subprocess.run(['git', 'status'], 
                                  capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode == 0:
                print("✅ Git repository detected")
                
                # Check for uncommitted changes
                if "nothing to commit" not in result.stdout:
                    print("⚠️  You have uncommitted changes. Please commit them before deployment.")
                    return False
                else:
                    print("✅ No uncommitted changes")
                    return True
            else:
                print("❌ Not a git repository. Please initialize git first.")
                return False
                
        except FileNotFoundError:
            print("❌ Git not found. Please install Git first.")
            return False
    
    def generate_deployment_instructions(self):
        """Generate step-by-step deployment instructions"""
        print("\n" + "="*60)
        print("🚀 DEPLOYMENT INSTRUCTIONS FOR RENDER.COM")
        print("="*60)
        
        instructions = """
📋 STEP-BY-STEP DEPLOYMENT:

1. 🔗 PUSH TO GITHUB:
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main

2. 🌐 CREATE RENDER ACCOUNT:
   - Go to https://render.com
   - Sign up with your GitHub account
   - Authorize Render to access your repositories

3. 🗄️ CREATE DATABASE:
   - Click "New +" → "PostgreSQL"
   - Name: inventory-db
   - Database Name: inventory_management
   - User: inventory_user
   - Region: Choose closest to you
   - Plan: Free

4. 🔧 DEPLOY BACKEND:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this repository
   - Configure:
     * Name: inventory-backend
     * Environment: Python 3
     * Build Command: ./build.sh
     * Start Command: cd backend && gunicorn inventory_system.wsgi:application --bind 0.0.0.0:$PORT
   
   - Environment Variables:
     * DJANGO_SETTINGS_MODULE = inventory_system.production_settings
     * SECRET_KEY = [Auto-generated]
     * DEBUG = False
     * ALLOWED_HOSTS = *
     * DATABASE_URL = [Connect to your database]

5. 🎨 DEPLOY FRONTEND:
   - Click "New +" → "Static Site"
   - Connect same GitHub repository
   - Root Directory: frontend
   - Build Command: npm install && npm run build
   - Publish Directory: build
   
   - Environment Variables:
     * REACT_APP_API_URL = https://inventory-backend.onrender.com

6. 🔗 UPDATE CORS:
   After frontend deployment, update backend environment:
   * CORS_ALLOWED_ORIGINS = https://your-frontend-url.onrender.com

7. 🧪 TEST DEPLOYMENT:
   - Visit your frontend URL
   - Login with: admin / admin123
   - Test all functionality

📊 EXPECTED URLS:
- Backend API: https://inventory-backend.onrender.com
- Frontend App: https://inventory-frontend.onrender.com
- Admin Panel: https://inventory-backend.onrender.com/admin

💰 COST:
- Free Tier: $0/month (750 hours)
- Paid Tier: $7/month (always-on)

🎉 Your Inventory Management System will be live!
"""
        
        print(instructions)
    
    def run_deployment_prep(self):
        """Run the complete deployment preparation"""
        print("🚀 RENDER.COM DEPLOYMENT PREPARATION")
        print("="*50)
        
        # Check prerequisites
        if not self.check_prerequisites():
            print("❌ Prerequisites check failed. Please fix the issues above.")
            return False
        
        # Update configurations
        self.update_frontend_config()
        self.create_render_config()
        self.create_build_script()
        
        # Check git status
        git_ready = self.check_git_status()
        
        # Generate instructions
        self.generate_deployment_instructions()
        
        if git_ready:
            print("\n✅ PROJECT IS READY FOR DEPLOYMENT!")
            print("Follow the instructions above to deploy to Render.com")
        else:
            print("\n⚠️  Please fix Git issues before deployment")
        
        return True

if __name__ == "__main__":
    deployer = RenderDeployment()
    success = deployer.run_deployment_prep()
    sys.exit(0 if success else 1)