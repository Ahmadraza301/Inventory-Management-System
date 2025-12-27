# 🚀 Quick Deployment Commands

## **HEROKU DEPLOYMENT (Recommended)**

### **1. Install Heroku CLI**
```bash
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

### **2. One-Command Deployment**
```bash
# Login to Heroku
heroku login

# Create app (replace 'your-app-name' with your desired name)
heroku create your-inventory-system

# Add PostgreSQL database
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SECRET_KEY="$(openssl rand -base64 50)"
heroku config:set DEBUG=False
heroku config:set DJANGO_SETTINGS_MODULE=inventory_system.production_settings
heroku config:set ALLOWED_HOSTS="your-inventory-system.herokuapp.com"
heroku config:set CORS_ALLOWED_ORIGINS="https://your-inventory-system.herokuapp.com"

# Deploy
git add .
git commit -m "Deploy to production"
git push heroku main

# Setup database
heroku run python backend/manage.py migrate
heroku run python backend/manage.py createsuperuser

# Open your live app
heroku open
```

### **3. Your App URL**
```
https://your-inventory-system.herokuapp.com
```

---

## **RAILWAY DEPLOYMENT**

### **1. Install Railway CLI**
```bash
npm install -g @railway/cli
```

### **2. Deploy to Railway**
```bash
# Login
railway login

# Initialize
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up

# Get your app URL
railway domain
```

---

## **DIGITALOCEAN APP PLATFORM**

### **1. Via Web Interface**
1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `python build_production.py`
   - **Run Command**: `cd backend && gunicorn inventory_system.wsgi:application`
5. Add PostgreSQL database
6. Set environment variables
7. Deploy

---

## **DOCKER DEPLOYMENT**

### **1. Build and Run with Docker**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Run in production mode
docker-compose -f docker-compose.prod.yml up -d

# Setup database
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

---

## **ENVIRONMENT VARIABLES NEEDED**

```bash
SECRET_KEY=your-super-secure-secret-key-here
DEBUG=False
DJANGO_SETTINGS_MODULE=inventory_system.production_settings
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

---

## **POST-DEPLOYMENT CHECKLIST**

### **✅ Test Your Live App**
- [ ] Visit your app URL
- [ ] Test user registration
- [ ] Test login functionality
- [ ] Create sample data
- [ ] Test all CRUD operations
- [ ] Generate and download reports
- [ ] Test PDF generation

### **✅ Security Check**
- [ ] HTTPS is working
- [ ] Admin panel is secure
- [ ] API endpoints require authentication
- [ ] No debug information visible

### **✅ Performance Check**
- [ ] Pages load quickly
- [ ] API responses are fast
- [ ] Images and assets load properly
- [ ] Mobile responsiveness works

---

**🎉 Your app is now LIVE and ready for users! 🎉**