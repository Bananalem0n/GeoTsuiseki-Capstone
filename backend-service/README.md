# GeoTsuiseki - Product Tracking Platform

A modern product tracking and partner management platform built with NestJS and Firebase.

## Features

- 🔐 **Authentication** - Secure session-based authentication with Firebase Auth
- 👥 **User Management** - Role-based access control (Admin, Partner, Approver, User)
- 🤝 **Partner Management** - Partner application, approval workflow, and analytics
- 📦 **Product Management** - Full CRUD operations with QR code generation
- 📊 **Analytics** - Product scans, ratings, and partner performance metrics
- 🔍 **Search & Pagination** - Efficient data retrieval with filtering

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with:
  - Firestore database
  - Authentication enabled
  - Storage bucket

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Admin SDK
   FIREBASE_SERVICE_ACCOUNT=<path-to-service-account.json or JSON string>
   
   # Session configuration
   SESSION_SECRET=<your-session-secret>
   COOKIE_SECRET=<your-cookie-secret>
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
   
   # Optional
   NODE_ENV=development
   PORT=3000
   ```

4. **Firebase Service Account**
   
   Download your Firebase service account key from:
   - Firebase Console → Project Settings → Service accounts → Generate new private key
   
   Either save it as a file and reference the path, or paste the JSON content directly in the env variable.

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Watch mode
```bash
npm run start:debug
```

## API Documentation

Once running, access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## Project Structure

```
src/
├── auth/               # Authentication guards and decorators
├── common/             # Shared DTOs, filters, pipes
├── modules/
│   ├── auth/           # Login, register, session management
│   ├── partners/       # Partner CRUD and approval workflow
│   ├── products/       # Product management and ratings
│   └── users/          # User management
├── services/           # Shared services (storage, etc.)
├── constants.ts        # Firestore collection names
└── main.ts             # Application bootstrap
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Partner only)
- `PUT /api/products/:id` - Update product (Partner only)
- `DELETE /api/products/:id` - Delete product (Partner only)

### Partners
- `GET /api/partners` - List verified partners
- `GET /api/partners/pending` - List pending partners (Admin only)
- `POST /api/partners/pending/:id/approve` - Approve partner (Admin only)
- `POST /api/partners/pending/:id/reject` - Reject partner (Admin only)
- `POST /api/partners/request` - Request partner status

### Users
- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:email/role` - Update user role (Admin only)
- `DELETE /api/users/:email` - Delete user (Admin only)

## Roles

| Role | Permissions |
|------|------------|
| Admin | Full access, user management, partner approval |
| Approver | Partner approval, product viewing |
| Partner | Product CRUD, view own analytics |
| User | Browse products, request partner status |

## License

MIT
