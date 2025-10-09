# Team Collaboration & Mentorship Platform 

## Overview
This is the frontend application for the Team Collaboration & Mentorship Platform built with React, Vite, and Tailwind CSS.

## Features
- User authentication (Login/Register)
- Role-based dashboards (Student/Mentor)
- Team creation and management
- Resource sharing and collaboration
- Responsive design with Tailwind CSS
- Modern UI with Lucide React icons

## Tech Stack
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation component
│   │   ├── ProtectedRoute.jsx   # Route protection
│   │   └── ResourceCard.jsx     # Resource display component
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   ├── StudentDashboard.jsx # Student dashboard
│   │   └── MentorDashboard.jsx  # Mentor dashboard
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── utils/
│   │   └── axios.js             # Axios configuration
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
└── vite.config.js               # Vite configuration
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 5000

### Steps
1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open `http://localhost:3000` in your browser

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features by Role

### Students
- **Dashboard**: Overview of teams and quick actions
- **Team Creation**: Create new teams with custom size and description
- **Team Joining**: Join existing teams using Team ID
- **Resource Management**: Upload and share resources within teams
- **Team Collaboration**: View team members and shared resources

### Mentors
- **Dashboard**: Monitor multiple teams and students
- **Team Monitoring**: View all available teams and start monitoring
- **Student Oversight**: Access team resources and member information
- **Guidance Tools**: Provide feedback and upload guiding materials

## Key Components

### AuthContext
- Manages user authentication state
- Handles login/logout functionality
- Provides user information across the app
- Automatic token refresh and error handling

### ProtectedRoute
- Protects routes based on authentication
- Role-based access control
- Automatic redirects for unauthorized access

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive navigation with mobile menu
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

## Styling
- **Tailwind CSS** for utility-first styling
- **Custom components** with consistent design system
- **Color scheme** with primary blue theme
- **Typography** using Inter font family
- **Icons** from Lucide React library

## State Management
- **React Context** for global state (authentication)
- **Local state** with useState for component-specific data
- **Form handling** with controlled components
- **Error handling** with user-friendly messages

## API Integration
- **Axios instance** with automatic token injection
- **Request/Response interceptors** for error handling
- **Automatic logout** on token expiration
- **Loading states** for better UX

## Environment Variables
- `VITE_API_URL` - Backend API base URL

## Development Guidelines
1. **Component Structure**: Keep components small and focused
2. **Styling**: Use Tailwind utility classes consistently
3. **State**: Use Context for global state, local state for component data
4. **Error Handling**: Always handle API errors gracefully
5. **Accessibility**: Include proper ARIA labels and keyboard navigation

## Build & Deployment
1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify:**
   - Connect your repository
   - Set environment variables
   - Deploy automatically on push

3. **Environment Variables for Production:**
   - `VITE_API_URL` - Your production API URL

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance
- **Code splitting** with React Router
- **Lazy loading** for better initial load times
- **Optimized images** and assets
- **Minimal bundle size** with Vite optimization
