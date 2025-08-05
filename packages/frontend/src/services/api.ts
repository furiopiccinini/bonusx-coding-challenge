import axios from 'axios';
import { FileInfo, AuthResponse, LoginData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle  errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

export const filesAPI = {
  uploadFile: async (file: File): Promise<FileInfo> => {
        
    // Upload file directly to the backend
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading file to backend...');
    try {
      const uploadResponse = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log('Upload response:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        data: uploadResponse.data,
      });

      if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      console.log('Upload completed successfully');
      return uploadResponse.data;
    } catch (error) {
      console.error('Upload error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any).response ? {
          status: (error as any).response.status,
          statusText: (error as any).response.statusText,
          data: (error as any).response.data,
        } : 'No response',
      });
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getFiles: async (): Promise<FileInfo[]> => {
    const response = await api.get('/files');
    return response.data;
  },

  downloadFile: async (fileId: string): Promise<void> => {
    
    // Get presigned download URL fro the backend
    const downloadUrlResponse = await api.get(`/files/${fileId}/download-url`);
    const { downloadUrl } = downloadUrlResponse.data;

    console.log('Download URL:', downloadUrl);

    // Download file directly from S3
    const response = await axios.get(downloadUrl, {
      responseType: 'blob',
    });

    // Get file info for filename
    const filesResponse = await api.get('/files');
    const fileInfo = filesResponse.data.find((file: any) => file.id === fileId);

    if (!fileInfo) {
      console.error('File not found');
      return;
    }

    // Create a download link
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;

    // Use the original filename from file info
    const filename = fileInfo.originalName || 'download';

    console.log('Download filename:', filename);

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },
};

export default api; 