# File Uploader for BonusX (MVP Prototype)

A "minimal viable prototype" with NestJS backend and React frontend for file uploads using presigned URLs (AWS S3).

## 🚀 Features

- **JWT Authentication**: Secure login with demo user (`demo` / `demo`)
- **File Upload**: Drag and drop or file selection with progress notification
- **Presigned URLs**: AWS S3 implementation with direct upload/download
- **File Management**: List, download, and delete uploaded files
- **File Metafata**: Display filename, size and date
- **File Validation**: Size limit (10MB) and type restrictions (PDF, JPG, PNG, TXT)
- **In-Memory Storage**: Files stored as Buffers for accurate downloads

## 📁 Project Structure

```
bonusx-coding-challenge/
├── packages/
│   ├── backend/          # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/     # JWT authentication
│   │   │   ├── files/    # File upload & management
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

## ⚡ Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start both servers:**
   ```bash
   npm start
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

4. **Login with demo credentials:**
   - Username: `demo`
   - Password: `demo`

## 🔧 Environment Variables

### Backend (.env file in root directory)

```env
# JWT Configuration
JWT_SECRET=simple-secret-key

# Server Configuration
PORT=3001
```

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - User login with `{username, password}`

### Files (requires JWT authentication)
- `POST /files/upload-url` - Generate presigned upload URL
- `POST /files/:id/upload-data` - Upload file data to presigned URL
- `POST /files/:id/complete-upload` - Complete upload process
- `GET /files` - Get user's files list
- `GET /files/:id/download-url` - Generate presigned download URL
- `GET /files/:id/download` - Download file directly
- `DELETE /files/:id` - Delete a file

## 🛠️ Available Scripts

### Root level
- `npm start` - Start backend in production mode
- `npm run dev:backend` - Start backend in development mode
- `npm run dev:frontend` - Start frontend in development mode
- `npm run build` - Build both frontend and backend

### Backend
- `npm run start:dev` - Start backend in development mode
- `npm run build` - Build the backend
- `npm run start:prod` - Start backend in production mode

### Frontend
- `npm start` - Start frontend development server
- `npm run build` - Build the frontend


## ⚠️ Important Notes

### Prototype Limitations:
- **In-Memory Metadata**: File metadata (list, sizes)
- **Single User**: Only demo user available
- **No Database**: File metadata stored in memory
- **AWS S3**: Files stored in actual AWS S3 buckets

## 🐛 Troubleshooting

### Common Issues:

1. **Port Already in Use**:
   ```bash
   lsof -ti:3001 | xargs kill -9
   lsof -ti:3000 | xargs kill -9
   ```

2. **Authorization Errors**:
   - Ensure JWT token is valid
   - Check browser localStorage for token
   - Restart servers if needed
   - Empty browser cache

3. **Upload Failures**:
   - Verify file type and size limits
   - Check browser console for errors
   - Ensure both servers are running

## 📄 License

This project is for demonstration purposes as an MVP prototype. 