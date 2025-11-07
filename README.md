# Solidex Manufacturing Company - DC & Stock Management System

A comprehensive web application for managing Delivery Challans (DC), stock, and products for Solidex Manufacturing Company.

## Features

### Public Pages
- **Homepage**: Company information, product showcase, and contact details
- **Products Page**: Browse all products with category filtering
- **About Page**: Company information and services
- **Gallery Page**: Product and facility images
- **Contact Page**: Contact form and company details

### Admin Features (Login Required)
- **DC Management**: Create and manage Inward and Outward Delivery Challans
- **Stock Management**: Real-time stock tracking with automatic updates
- **Product Management**: Add and manage products
- **Dashboard**: Overview of DCs, stock levels, and recent activities
- **Auto Stock Updates**: Stock automatically updates when DCs are completed
- **Authentication**: Secure login/register system with JWT tokens

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Database**: MongoDB

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB connection string
```

3. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend server on `http://localhost:3000`

### Manual Setup

If you prefer to run servers separately:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get product by ID (public)
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)

### Delivery Challans
- `GET /api/dc` - Get all DCs (public, with filters: type, status, date)
- `GET /api/dc/:id` - Get DC by ID (public)
- `POST /api/dc` - Create DC (protected)
- `PUT /api/dc/:id` - Update DC (protected)
- `POST /api/dc/:id/complete` - Complete DC and update stock (protected)
- `DELETE /api/dc/:id` - Delete DC (protected)

### Stock
- `GET /api/stock` - Get all stock (public)
- `GET /api/stock/product/:productId` - Get stock by product (public)
- `GET /api/stock/low-stock` - Get low stock items (public)
- `GET /api/stock/summary` - Get stock summary (public)
- `PUT /api/stock/:id` - Update stock (protected)

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics (protected)

## Usage

### For Public Users
1. **Browse Products**: Visit the homepage or products page to see available products
2. **Contact**: Use the contact page to send inquiries
3. **View Gallery**: Check out product and facility images

### For Admin Users
1. **Login/Register**: Create an account or login at `/login`
2. **Add Products**: Navigate to Admin > Products and add your products
3. **Create DC**: Go to Admin > DC Management and create Inward/Outward DCs
4. **Complete DC**: Click "Complete" on a DC to update stock automatically
5. **Monitor Stock**: Check Admin > Stock page for current inventory levels
6. **Dashboard**: View overview of all activities in Admin Dashboard

## Environment Variables

Backend `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/solidex
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

Frontend `.env.local` (optional):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Notes

- DC numbers are auto-generated (format: INW-YYYY-0001 or OUT-YYYY-0001)
- Stock updates automatically when DCs are completed
- Low stock threshold is set to 10 units (configurable)
- All dates are stored in UTC format
- Public pages don't require authentication
- Admin routes are protected and require login
- JWT tokens are stored in localStorage and expire after 7 days
- Replace placeholder images in gallery with actual product photos

