# File Upload Application (Prototype)

A minimal viable prototype with NestJS backend and React frontend for file uploads.

## Features

- **Authentication**: JWT-based authentication with demo user
- **File Upload**: Drag and drop file upload with progress indication
- **File Management**: List, view, and delete uploaded files
- **In-Memory Storage**: Files stored in memory for prototype purposes
- **Modern UI**: Beautiful, responsive design with smooth animations
- **TypeScript**: Full TypeScript support for both frontend and backend

## Project Structure

```
bonusx-coding-challenge/
├── packages/
│   ├── backend/          # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── files/    # File upload module
│   │   │   ├── users/    # User management
│   │   │   └── ...
│   │   └── ...
│   └── frontend/         # React frontend
│       ├── src/
│       │   ├── components/
│       │   ├── services/
│       │   ├── types/
│       │   └── ...
│       └── ...
├── package.json          # Root package.json with workspaces
└── README.md
```

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure environment variables (optional):**
   ```bash
   # Copy the example environment file
   cp packages/backend/env.example packages/backend/.env
   ```

3. **Start the development servers:**
   ```bash
   # Start backend (in one terminal)
   npm run dev:backend
   
   # Start frontend (in another terminal)
   npm run dev:frontend
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Environment Variables

### Backend (.env file)

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login (demo: demo@example.com / password)

### Files (requires authentication)
- `POST /files/upload` - Upload a file
- `GET /files` - Get user's files
- `DELETE /files/:id` - Delete a file

## Available Scripts

### Root level
- `npm run dev:backend` - Start backend in development mode
- `npm run dev:frontend` - Start frontend in development mode
- `npm run build` - Build both frontend and backend
- `npm run install:all` - Install dependencies for all packages

### Backend
- `npm run start:dev` - Start backend in development mode
- `npm run build` - Build the backend
- `npm run start:prod` - Start backend in production mode

### Frontend
- `npm start` - Start frontend development server
- `npm run build` - Build the frontend



## Development

### Backend Development
The backend is built with NestJS and includes:
- JWT authentication with demo user
- File upload handling with Multer
- In-memory file storage
- TypeScript support

### Frontend Development
The frontend is built with React and includes:
- Modern UI with CSS animations
- Drag and drop file upload
- Responsive design
- TypeScript support
- Axios for API communication



## Security Considerations

- Change the JWT secret in production
- Use environment variables for all sensitive data
- Configure proper CORS settings
- Use HTTPS in production
- Implement rate limiting for production use
- This is a prototype - files are stored in memory and will be lost on server restart

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for demonstration purposes. 