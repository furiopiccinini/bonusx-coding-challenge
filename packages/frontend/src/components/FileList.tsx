import React, { useState } from 'react';
import { FileInfo } from '../types';
import { filesAPI } from '../services/api';

interface FileListProps {
  files: FileInfo[];
  onFileDeleted: (fileId: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onFileDeleted }) => {
  const [deleting, setDeleting] = useState<string | undefined>(undefined);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    setDeleting(fileId);
    try {
      await filesAPI.deleteFile(fileId);
      onFileDeleted(fileId);
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    } finally {
      setDeleting(undefined);
    }
  };

  if (files.length === 0) {
    return (
      <div className="card">
        <h2>Your Files</h2>
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No files uploaded yet. Upload your first file above!
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Your Files ({files.length})</h2>
      <div className="file-list">
        {files.map((file) => (
          <div key={file.id} className="file-item">
            <div className="file-info">
              <div className="file-name">{file.originalName}</div>
              <div className="file-size">
                {formatFileSize(file.size)} • Uploaded {formatDate(file.uploadedAt)}
              </div>
            </div>
            <div className="file-actions">
              <button
                onClick={() => handleDelete(file.id)}
                disabled={deleting === file.id}
                className="btn btn-danger"
              >
                {deleting === file.id ? (
                  <span className="loading"></span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList; 