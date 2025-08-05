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
    'application/pdf': ['.pdf'], // File type filter
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg'],
    'image/png': ['.png'],
    'text/plain': ['.txt'],
  };

  const validateFile = (file: File): string | undefined => {
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

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
      alert(`File "${uploadedFile.originalName}" uploaded successfully!`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [onFileUploaded]);

  const onDropRejected = useCallback((rejectedFiles: any[]) => {
    const file = rejectedFiles[0];
    let errorMessage = '';

    if (file.errors) {
      const error = file.errors[0];
      if (error.code === 'file-invalid-type') {
        errorMessage = 'Unsupported file type. Please upload PDF, JPG, PNG, or TXT files only.';
      } else if (error.code === 'file-too-large') {
        errorMessage = 'File is too large. Maximum size is 10MB.';
      } else {
        errorMessage = error.message;
      }
    } else {
      errorMessage = 'File upload failed. Please try again.';
    }

    setError(errorMessage);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
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
                ? 'Drop your file here'
                : 'Drag and drop a file here, or click to select from disk'}
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