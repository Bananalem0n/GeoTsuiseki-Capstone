# GeoTsuiseki - Product Tracking & Partner Management Platform

<div align="center">
  
A modern full-stack platform for product tracking and partner management with QR code verification.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

## ✨ Features

- 🔐 **Secure Authentication** - Session-based auth with Firebase
- 👥 **Role-Based Access** - Admin, Partner, Approver, and User roles
- 🤝 **Partner Workflow** - Application, approval, and management
- 📦 **Product Management** - Full CRUD with QR code generation
- 📊 **Analytics Dashboard** - Real-time stats and insights
- 🎨 **Modern UI** - Sleek dark theme with glassmorphism design
- 📱 **Responsive** - Works on all devices

## 🏗️ Architecture

```
geoTsuiseki/
├── backend-service/     # NestJS API server
│   ├── src/
│   │   ├── modules/     # Feature modules (auth, products, partners, users)
│   │   ├── common/      # Shared utilities
│   │   └── services/    # Firebase services
│   └── README.md
│
└── front-end/           # Next.js web app
    ├── src/
    │   ├── app/         # App router pages
    │   └── lib/         # API client & auth
    └── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase project with Firestore, Auth, and Storage enabled

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/geoTsuiseki.git
cd geoTsuiseki
```

### 2. Setup Backend

```bash
cd backend-service
npm install

# Create .env file
cp .env.example .env
# Edit .env with your Firebase credentials

npm run start:dev
```

### 3. Setup Frontend

```bash
cd front-end
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

npm run dev
```

### 4. Access the app

- **Frontend**: http://localhost:3001
- **API Docs**: http://localhost:3000/api/docs

## ⚙️ Environment Variables

### Backend (.env)

```env
FIREBASE_SERVICE_ACCOUNT=<path-or-json>
SESSION_SECRET=<your-secret>
COOKIE_SECRET=<your-secret>
ALLOWED_ORIGINS=http://localhost:3001
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 👤 User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full access, user management, partner approval |
| **Approver** | Partner approval, product viewing |
| **Partner** | Product CRUD, view own analytics |
| **User** | Browse products, request partner status |

## 🔒 Security

- Session-based authentication with secure cookies
- Firebase Auth for user management
- Role-based access control on all endpoints
- CORS protection for API access

## 📚 API Documentation

Full API documentation available at `/api/docs` when running the backend.

### Key Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/products` - List products
- `GET /api/partners` - List partners
- `POST /api/partners/request` - Request partner status

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Made with ❤️ by Bananalem0n

---

<div align="center">
  <sub>Built with NestJS, Next.js, and Firebase</sub>
</div>
