#!/usr/bin/env python3
"""
Production build script for Inventory Management System
"""
import os
import subprocess
import sys
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and handle errors"""
    print(f"Running: {command}")
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, check=True, capture_output=True, text=True)
        print(f"✅ Success: {command}")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running: {command}")
        print(f"Error: {e.stderr}")
        sys.exit(1)

def main():
    """Main build process"""
    print("🚀 Starting Production Build Process...")
    
    # Get project root
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    frontend_dir = project_root / "frontend"
    
    print("\n📦 Step 1: Installing Backend Dependencies...")
    run_command("pip install -r requirements.txt", cwd=project_root)
    
    print("\n📦 Step 2: Installing Frontend Dependencies...")
    run_command("npm install", cwd=frontend_dir)
    
    print("\n🏗️ Step 3: Building Frontend for Production...")
    run_command("npm run build", cwd=frontend_dir)
    
    print("\n🗃️ Step 4: Collecting Static Files...")
    run_command("python manage.py collectstatic --noinput", cwd=backend_dir)
    
    print("\n🔄 Step 5: Running Database Migrations...")
    run_command("python manage.py migrate", cwd=backend_dir)
    
    print("\n✅ Production Build Complete!")
    print("\n📋 Next Steps:")
    print("1. Set up your production environment variables")
    print("2. Configure your production database")
    print("3. Deploy to your chosen hosting platform")
    print("4. Set up SSL certificates")
    print("5. Configure domain and DNS")

if __name__ == "__main__":
    main()