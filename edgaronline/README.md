# EDGAR Online Filing System - Frontend

React-based web application for creating and submitting SEC ownership filings (Forms 3, 4, 5) through the EDGAR system.

## Features

- ✅ SEC.gov themed UI using USWDS 3.0
- ✅ Secure authentication with JWT
- ✅ Form 3, 4, and 5 filing wizards
- ✅ Draft management
- ✅ XML validation before submission
- ✅ File upload for exhibits
- ✅ Submission tracking

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **React Hook Form** - Form management
- **React Context** - State management
- **Axios** - HTTP client
- **USWDS 3.8.1** - US Web Design System (precompiled CSS)

## Project Structure

```
edgaronline/
├── public/                  # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── forms/         # Form components
│   │   ├── layout/        # Layout components (Header, Footer)
│   │   ├── validation/    # Validation components
│   │   └── common/        # Common UI components
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── assets/            # Styles, images
├── index.html
├── vite.config.js
└── package.json
```

## Installation

### Prerequisites

- Node.js 18+ (check .nvmrc file for exact version)
- npm or yarn

### Setup

1. **Install dependencies:**

```bash
cd /home/ec2-user/poc/code/edgaronline
npm install
```

2. **Configure environment:**

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3001/api
```

3. **Start development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Development

### Adding New Components

Components should be organized by purpose:
- **Forms** → `src/components/forms/`
- **Layout** → `src/components/layout/`
- **Common/Shared** → `src/components/common/`

### API Integration

All API calls go through the service layer in `src/services/api.js`:

```javascript
import { filingService } from '@services/api';

// Get user's drafts
const drafts = await filingService.getDrafts();
```

### State Management

Authentication state is managed in `src/context/AuthContext.jsx`:

```javascript
import { useAuth } from '@context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  // ... component logic
}
```

### Styling

The application uses:
1. **USWDS base styles** (precompiled CSS from npm package)
2. **SEC theme overrides** (`src/assets/styles/sec-theme.css`)

Key CSS variables are defined in `sec-theme.css`:
- `--sec-blue-primary`: #004990
- `--sec-blue-dark`: #162e51
- `--sec-red-accent`: #d63e04

## Key Files

- `src/App.jsx` - Main application component with routing
- `src/main.jsx` - Application entry point
- `src/context/AuthContext.jsx` - Authentication state management
- `src/services/api.js` - API service layer
- `src/assets/styles/sec-theme.css` - SEC.gov themed styling

## Next Steps

Priority implementation tasks:

1. **Authentication Pages** - Complete Login and Register forms with React Hook Form
2. **Filing Wizard** - Multi-step form for creating filings
3. **Form Components** - Build reusable form components for ownership data
4. **XML Preview** - Display generated XML before submission
5. **Validation Panel** - Show validation errors/warnings
6. **File Upload** - Implement exhibit file upload with progress
7. **Submission Flow** - Complete EDGAR submission workflow

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001/api` |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

Follows USWDS browser support policy (2% rule):
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Links

- [USWDS Documentation](https://designsystem.digital.gov/)
- [React Hook Form](https://react-hook-form.com/)
- [Vite Documentation](https://vitejs.dev/)


