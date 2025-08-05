import React, { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import { filesAPI } from './services/api';
import { AuthResponse, FileInfo, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      loadFiles();
    }
    setLoading(false);
  }, []);

  const loadFiles = async () => {
    try {
      const filesData = await filesAPI.getFiles();
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleAuthSuccess = (authData: AuthResponse) => {
    localStorage.setItem('token', authData.access_token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setUser(authData.user);
    loadFiles();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(undefined);
    setFiles([]);
  };

  const handleFileUploaded = (file: FileInfo) => {
    setFiles(prev => [file, ...prev]);
  };

  const handleFileDeleted = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="loading"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>File Uploader for BonusX</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Welcome, {user.username}!</span>
          <button onClick={handleLogout} className="btn">
            Logout
          </button>
        </div>
      </div>

      <FileUpload onFileUploaded={handleFileUploaded} />
      <FileList files={files} onFileDeleted={handleFileDeleted} />
    </div>
  );
};

export default App; 