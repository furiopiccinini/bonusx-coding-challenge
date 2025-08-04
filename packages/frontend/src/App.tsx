import React, { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import { filesAPI } from './services/api';
import { FileInfo } from './types';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const filesData = await filesAPI.getFiles();
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <h1>S3 Uploader App for BonusX Challenge</h1>
        <p style={{ color: '#FFFFFF', marginTop: '8px' }}>
          Upload files by dragging and dropping or clicking to select
        </p>
      </div>

      <FileUpload onFileUploaded={handleFileUploaded} />
      <FileList files={files} onFileDeleted={handleFileDeleted} />
    </div>
  );
};

export default App; 