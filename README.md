# 🏢 Inventory Management System

A modern, full-stack web application for comprehensive inventory management built with React.js and Django REST Framework.

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based authentication system
- User registration and login
- Protected routes and secure API endpoints
- Password hashing and validation

### 📊 Dashboard & Analytics
- Real-time statistics and metrics
- Interactive charts (Bar, Pie, Line)
- Revenue analytics and trends
- Inventory overview and alerts

### 👥 Employee Management
- Complete CRUD operations
- Auto-generated Employee IDs (EMP1234)
- Role-based access control
- Salary and contact management

### 🏪 Supplier Management
- Supplier information management
- Auto-generated Supplier IDs (SUP1234)
- Contact details and status tracking
- Supplier performance analytics

### 📦 Product Management
- Product catalog with categories
- Auto-generated Product Codes (PRD1234)
- Stock quantity tracking
- Price management and status control

### 💰 Sales Management
- Multi-item sales transactions
- Auto-generated Invoice Numbers
- Customer information capture
- Automatic inventory updates
- Discount calculations

### 📈 Reports & Analytics
- Comprehensive sales reports
- Product performance analysis
- Category-wise analytics
- Employee performance tracking
- PDF report generation

### 📄 PDF Generation
- Professional sales invoices
- Detailed reports with charts
- Indian Rupee (₹) formatting
- Downloadable documents

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern UI framework
- **Material-UI (MUI)** - Professional components
- **React Router** - Navigation and routing
- **Axios** - API communication
- **React Hook Form** - Form management
- **Recharts** - Data visualization
- **jsPDF** - PDF generation

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Production database
- **JWT Authentication** - Secure tokens
- **CORS Headers** - Cross-origin requests

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Inventory-Management-System
```

2. **Backend Setup**
```bash
cd backend
pip install -r ../requirements.txt
```

3. **Configure Environment**
```bash
# Copy and edit environment file
cp .env.example .env
# Update database credentials in .env
```

4. **Database Setup**
```bash
python manage.py migrate
python manage.py createsuperuser
python create_sample_data.py
```

5. **Frontend Setup**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start Backend Server**
```bash
cd backend
python manage.py runserver 8000
```

2. **Start Frontend Server**
```bash
cd frontend
npm start
```

3. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database Configuration
DB_NAME=inventory_db
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
USE_POSTGRES=True

# Django Configuration
SECRET_KEY=your-secret-key
DEBUG=True

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 📱 Features Overview

### Auto-Generation Systems
- **Employee IDs**: EMP + 4 digits (e.g., EMP1234)
- **Supplier IDs**: SUP + 4 digits (e.g., SUP1234)
- **Product Codes**: PRD + 4 digits (e.g., PRD1234)
- **Invoice Numbers**: INV + timestamp (e.g., INV20251222140135)

### Business Logic
- **Stock Management**: Real-time inventory updates
- **Price Calculations**: Automatic totals and discounts
- **Stock Validation**: Prevents overselling
- **Currency**: Indian Rupee (₹) formatting throughout

### User Experience
- **Responsive Design**: Mobile-friendly interface
- **Loading States**: Visual feedback for operations
- **Error Handling**: Clear, actionable error messages
- **Success Notifications**: Toast confirmations
- **Search & Filter**: Quick data access

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with Django's security
- CORS properly configured
- Input validation and sanitization
- Protected API endpoints
- SQL injection prevention

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Core Entities
- `GET/POST /api/employees/` - Employee management
- `GET/POST /api/suppliers/` - Supplier management
- `GET/POST /api/categories/` - Category management
- `GET/POST /api/products/` - Product management
- `GET/POST /api/sales/` - Sales management

### Analytics
- `GET /api/dashboard/stats/` - Dashboard statistics
- `GET /api/dashboard/activities/` - Recent activities
- `GET /api/sales/reports/` - Sales reports

## 🚀 Production Deployment

### Pre-Deployment Checklist
- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up production database
- [ ] Configure static file serving
- [ ] Set up SSL certificates
- [ ] Configure monitoring and logging

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📁 Project Structure

```
Inventory-Management-System/
├── backend/
│   ├── apps/
│   │   ├── authentication/
│   │   ├── employees/
│   │   ├── suppliers/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── sales/
│   │   └── dashboard/
│   ├── inventory_system/
│   ├── manage.py
│   └── create_sample_data.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .env.example
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Built by Ahmad**  
**Technology**: React & Django  

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**🎉 Enjoy your modern Inventory Management System!**
