# GeoTsuiseki Dashboard - Frontend

A modern, responsive web dashboard for the GeoTsuiseki product tracking platform built with Next.js 15.

![Dashboard Preview](./docs/dashboard-preview.png)

## Features

- 🎨 **Modern UI** - Sleek dark theme with glassmorphism design
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🔐 **Authentication** - Secure session-based login/register
- 👥 **Role-Based Access** - Different views for Admin, Partner, and User roles
- 📦 **Product Management** - View, create, and manage products
- 🤝 **Partner Management** - Partner listings and analytics
- ✅ **Approval Workflow** - Admin approval for partner applications
- 📊 **Dashboard Analytics** - Overview stats and recent activity

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **State**: React Context (Auth)

## Prerequisites

- Node.js 18+
- npm or yarn
- Running backend service (see [backend-service](../backend-service/README.md))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd front-end
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3001`

## Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── products/        # Product management
│   │   ├── partners/        # Partner listings
│   │   ├── approvals/       # Partner approval workflow
│   │   ├── users/           # User management (Admin)
│   │   ├── layout.tsx       # Dashboard layout with sidebar
│   │   └── page.tsx         # Dashboard home
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── lib/
│   ├── api.ts               # API client
│   ├── auth.tsx             # Authentication context
│   └── icons.ts             # Icon exports
└── public/
    ├── favicon.svg          # App favicon
    └── manifest.json        # PWA manifest
```

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/dashboard` | Authenticated | Dashboard home |
| `/dashboard/products` | Authenticated | Product listing |
| `/dashboard/partners` | Admin only | Partner management |
| `/dashboard/approvals` | Admin only | Partner approvals |
| `/dashboard/users` | Admin only | User management |

## Role-Based Features

### Admin
- View all products (read-only)
- Manage users and roles
- Approve/reject partner applications
- View partner analytics

### Partner
- Full product management (CRUD)
- View own analytics
- Generate QR codes

### User
- Browse products
- Request partner status

## Styling

The app uses a custom design system with:
- Dark theme with subtle gradients
- Glass morphism cards
- Consistent indigo/purple accent colors
- Lucide icons throughout

### CSS Classes

```css
.glass-card    /* Frosted glass card effect */
.btn-primary   /* Primary action button */
.btn-secondary /* Secondary action button */
.btn-danger    /* Destructive action button */
.input         /* Form input styling */
```

## API Integration

The frontend communicates with the backend via the `ApiClient` class in `src/lib/api.ts`. All requests include credentials for session-based authentication.

```typescript
import { api } from '@/lib/api';

// Example usage
const products = await api.getProducts(1, 10);
const user = await api.login(email, password);
```

## Development

### Adding a New Page

1. Create the page file in `src/app/dashboard/[page-name]/page.tsx`
2. Add navigation item in `src/app/dashboard/layout.tsx`
3. Add appropriate role check if needed

### Adding New Icons

1. Add the icon export in `src/lib/icons.ts`
2. Import and use in your component

## License

MIT
