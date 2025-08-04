import { Injectable } from '@nestjs/common';

export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
  userId: string;
}

@Injectable()
export class FilesService {
  private files: FileInfo[] = [];

  async uploadFile(file: Express.Multer.File, userId: string): Promise<FileInfo> {
    const fileId = Date.now().toString();
    
    // For prototype, we'll store file data in memory and create a fake URL
    const fileInfo: FileInfo = {
      id: fileId,
      filename: file.originalname,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      uploadedAt: new Date(),
      userId,
    };

    this.files.push(fileInfo);
    return fileInfo;
  }

  async getFilesByUserId(userId: string): Promise<FileInfo[]> {
    return this.files.filter(file => file.userId === userId);
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const fileIndex = this.files.findIndex(file => file.id === fileId && file.userId === userId);
    if (fileIndex === -1) {
      throw new Error('File not found');
    }
    
    this.files.splice(fileIndex, 1);
  }
} 