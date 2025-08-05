export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  s3Key: string;
  uploadedAt: string;
  userId: string;
}

export interface User {
  id: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginData {
  username: string;
  password: string;
} 