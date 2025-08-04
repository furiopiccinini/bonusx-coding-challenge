import axios from 'axios';
import { FileInfo } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const filesAPI = {
  uploadFile: async (file: File): Promise<FileInfo> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFiles: async (): Promise<FileInfo[]> => {
    const response = await api.get('/files');
    return response.data;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },
};

export default api; 