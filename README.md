# ShopVerse - Multi-Vendor E-Commerce Platform

A full-stack multi-vendor e-commerce platform built with React.js, Node.js, Express.js, and MongoDB. This platform supports three user roles: Customer, Vendor, and Admin.

## Tech Stack

### Frontend
- React.js (Vite)
- React Router DOM
- Redux Toolkit + React Redux
- Axios
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (JSON Web Tokens)
- bcrypt
- multer (file uploads)
- cookie-parser
- cors
- dotenv

### Future Integrations
- Cloudinary (image storage)
- Razorpay (payment processing)
- Nodemailer (email service)

## Project Structure

```
├── client/                  # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/      # Header, Footer, Loader, NotificationBell, etc.
│   │   │   ├── layout/      # MainLayout
│   │   │   ├── product/     # ProductCard
│   │   │   └── review/      # ReviewForm, ReviewList, RatingStars
│   │   ├── hooks/
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages (Dashboard, Reports, Users, etc.)
│   │   │   └── vendor/      # Vendor pages (Dashboard, Analytics, Products, etc.)
│   │   ├── redux/
│   │   │   ├── slices/      # Redux slices (auth, cart, product, notification, etc.)
│   │   │   └── store.js     # Redux store
│   │   ├── routes/          # React Router config (lazy-loaded)
│   │   ├── services/        # Axios API config
│   │   ├── utils/           # formatCurrency, formatDate, validators
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
├── server/                  # Backend (Express.js)
│   ├── config/              # DB connection
│   ├── controllers/         # Route handlers (admin, vendor, order, product, notification, etc.)
│   ├── middleware/           # Auth, error handling
│   ├── models/              # Mongoose schemas (User, Product, Order, Notification, etc.)
│   ├── routes/              # API routes
│   ├── services/            # Business logic (email, payment)
│   ├── uploads/             # File uploads
│   ├── utils/               # Helpers (notify.js, email templates, validators)
│   ├── .env
│   ├── app.js               # Express app config
│   └── server.js            # Server entry point
│
├── .gitignore
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd multi-vendor-ecommerce
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

## Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/multi-vendor-ecommerce
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Project

### Start Backend
```bash
cd server
npm run dev
```

### Start Frontend (in a separate terminal)
```bash
cd client
npm run dev
```

The frontend will run at `http://localhost:5173` and the backend at `http://localhost:5000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/orders` | Customer - list my orders |
| GET | `/api/orders/:id` | Customer - view single order |
| POST | `/api/orders/:id/cancel` | Customer - cancel eligible order |
| GET | `/api/orders/:id/track` | Customer - track order |
| POST | `/api/payment/create-order` | Customer - create Razorpay order |
| POST | `/api/payment/verify` | Customer - verify Razorpay signature |
| POST | `/api/payment/webhook` | Razorpay webhook handler |
| POST | `/api/admin/orders/:id/refund` | Admin - process refund |
| GET | `/api/reviews/product/:productId` | Public - get product reviews |
| GET | `/api/reviews/product/:productId/me` | Customer - get my review for product |
| GET | `/api/reviews/product/:productId/eligibility` | Customer - check review eligibility |
| POST | `/api/reviews/product/:productId` | Customer - create review |
| PUT | `/api/reviews/:id` | Customer - update own review |
| DELETE | `/api/reviews/:id` | Customer/Admin - delete review |
| POST | `/api/auth/forgot-password` | Request password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/vendor/orders` | Vendor - view their orders |
| PATCH | `/api/vendor/orders/:orderId/items/:itemId/status` | Vendor - update item status |

## Features Completed (Part 1)

- Complete project structure (client + server)
- React app with Vite and Tailwind CSS
- Express.js server with middleware setup
- MongoDB connection configuration
- Health check API endpoint
- Redux store with auth, cart, and product slices
- Axios instance with interceptors
- React Router with all routes
- Responsive Header and Footer
- Home page with hero, categories, and features
- Login and Register pages with role selection
- Products page with filter sidebar
- Cart page with quantity management
- Wishlist, Checkout, and Account pages
- 404 Not Found page
- ScrollToTop and Loader components

## Features Completed (Part 6: Customer Shopping System)

- Cart (add/remove/update/clear, stock validation, coupons)
- Wishlist (add/remove/view with stale product pruning)
- Addresses (create/update/delete/default with ownership checks)
- Checkout (preview + place order)
- Server-side price computation (never trusts frontend)
- Coupon validation engine
- Auth + role middleware and ownership verification

## Features Completed (Part 7: Orders & Payment System)

- Enhanced Order model (orderNumber, out_for_delivery, paymentId)
- Razorpay integration (create-order, verify, webhook)
- Secure signature verification on backend
- Customer order management (list, detail, cancel, track)
- Vendor order management (view own, update status)
- Admin order management (view all, refunds, payment history)
- Online payments via Razorpay (UPI, card, netbanking, wallet) + COD
- Inventory deduction only after successful payment verification
- Payment refunds (admin + auto on cancel)
- Frontend: Orders, OrderDetails, OrderTracking, Payment, PaymentSuccess, PaymentFailed pages

## Features Completed (Part 8: Reviews, Ratings, Coupons & Email)

- Review system (create, edit, delete) - only for verified purchasers
- Duplicate review prevention (unique user+product+order)
- Product ratings (averageRating + totalReviews recomputed server-side)
- Rating breakdown UI (5-star distribution bars)
- Frontend: ReviewForm with star input + photos, ReviewList, RatingStars
- Coupon model with minimumOrderAmount / expiryDate aliases + full validation
- Coupon validation on backend (status, dates, usage limit, vendor scope, min purchase, max discount)
- Nodemailer email service with reusable HTML templates
- Emails: registration, vendor approval/rejection, order confirmation, payment success, order shipped, order delivered, password reset
- Forgot/Reset password flow wired to backend + email

## Environment Variables (Part 8)

Add to `server/.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=ShopVerse <no-reply@shopverse.com>
```

## Features Completed (Part 9: Analytics, Notifications & UI Polish)

- Full notification system (backend + frontend)
  - Notification model (recipient, type, title, message, link, isRead)
  - API: GET /api/notifications (paginated + unreadCount), PATCH /read-all, PATCH /:id/read
  - Notifications emitted for: order placed, payment success, order shipped, order delivered, vendor approved/rejected, low stock, new review, new order (vendors)
  - NotificationBell component (bell icon + unread badge + dropdown list) wired into all headers (customer, admin, vendor)
- Admin analytics expanded with 3 new aggregations:
  - Sales by category ($lookup products → categories, group by revenue)
  - Sales by vendor ($lookup products → users, group by revenue)
  - Orders by status (date-filtered)
- Recommended products API (GET /products/recommended) — fetches user's purchased categories → related products, fallback to featured/top-rated
- Frontend charts using Recharts:
  - Admin Dashboard: monthly revenue AreaChart
  - Reports page: daily sales AreaChart, orders-by-status PieChart, category sales BarChart, vendor sales BarChart
  - Vendor Analytics: daily sales AreaChart, orders-by-status PieChart, monthly revenue BarChart
- Customer dashboard (Account page): stat cards (orders, cart, wishlist, addresses), profile card, recent orders list, recommended products section
- Home page: dynamic categories from catalog, featured/popular products grid, skeleton loading states
- Code splitting via React.lazy + Suspense for all page components (reduces initial bundle from ~1MB to ~340KB + lazy-loaded chunks)
