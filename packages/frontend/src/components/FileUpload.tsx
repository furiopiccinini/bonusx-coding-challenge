import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { filesAPI } from '../services/api';
import { FileInfo } from '../types';

interface FileUploadProps {
  onFileUploaded: (file: FileInfo) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg'],
    'image/png': ['.png'],
    'text/plain': ['.txt'],
  };

  const validateFile = (file: File): string | undefined => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
      return `File type not allowed. Allowed types: PDF, JPG, PNG, TXT`;
    }

    return undefined;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(undefined);

    try {
      const uploadedFile = await filesAPI.uploadFile(file);
      onFileUploaded(uploadedFile);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div className="card">
      <h2>Upload File</h2>
      {error && <div className="alert alert-error">{error}</div>}
      
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <div className="loading"></div>
            <p className="dropzone-text">Uploading...</p>
          </div>
        ) : (
          <div>
            <p className="dropzone-text">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop a file here, or click to select'}
            </p>
            <p className="dropzone-subtext">
              Supported formats: PDF, JPG, PNG, TXT (max 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 