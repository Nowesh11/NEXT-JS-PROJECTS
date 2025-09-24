# NEXT-JS-PROJECTS - Tamil Language Society Website

This is a comprehensive Next.js project for the Tamil Language Society website, organized into separate frontend and backend directories for better maintainability and scalability.

## Project Structure

```
tls-nextjs/
├── frontend-public/          # Public-facing Next.js application
│   ├── app/                  # Next.js 13+ app directory
│   ├── components/           # Public components
│   ├── pages/                # Public pages
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── i18n/                 # Internationalization
│   ├── styles/               # CSS styles
│   ├── next.config.js        # Next.js configuration
│   └── package.json          # Dependencies
│
├── frontend-admin/           # Admin dashboard Next.js application
│   ├── components/           # Admin components
│   ├── pages/                # Admin pages
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── i18n/                 # Internationalization
│   ├── styles/               # CSS styles
│   ├── next.config.js        # Next.js configuration
│   └── package.json          # Dependencies
│
└── backend/                  # Backend API and services
    ├── api/                  # API routes
    ├── models/               # Database models
    ├── lib/                  # Utility libraries
    ├── utils/                # Helper utilities
    └── middleware.js         # Server middleware
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies for public frontend:**
   ```bash
   cd frontend-public
   npm install
   ```

2. **Install dependencies for admin frontend:**
   ```bash
   cd frontend-admin
   npm install
   ```

### Running the Applications

1. **Start the public frontend (port 3000):**
   ```bash
   cd frontend-public
   npm run dev
   ```

2. **Start the admin frontend (port 3001):**
   ```bash
   cd frontend-admin
   npm run dev
   ```

3. **Start the backend API server (if separate):**
   ```bash
   # Configure and start your backend server on port 5000
   ```

### Access URLs

- **Public Frontend:** http://localhost:3000
- **Admin Frontend:** http://localhost:3001/admin
- **Backend API:** http://localhost:5000/api

## Development Notes

- The public and admin frontends are completely separate Next.js applications
- Both frontends share similar dependencies but can be customized independently
- API calls are configured to proxy to the backend server
- Each frontend has its own build and deployment process

## Building for Production

```bash
# Build public frontend
cd frontend-public && npm run build

# Build admin frontend
cd frontend-admin && npm run build
```

## Migration Notes

This project was reorganized from a monolithic structure to separate frontend and backend applications. Import paths and configurations have been updated accordingly.
