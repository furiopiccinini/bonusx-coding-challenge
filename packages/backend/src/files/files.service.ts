import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  s3Key: string;
  uploadedAt: Date;
  userId: string;
}

export interface PresignedUrlRes {
  uploadUrl: string;
  fileInfo: FileInfo;
}

@Injectable()
export class FilesService implements OnModuleInit {
  private files: FileInfo[] = [];
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');
  }

  async onModuleInit() {
    console.log('🔄 Initializing FilesService - scanning S3 bucket for existing files...');
    await this.loadExistingFilesFromS3();
    console.log(`✅ Loaded ${this.files.length} existing files from S3 bucket`);
  }

  private async loadExistingFilesFromS3(): Promise<void> {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'uploads/',
      });

      const response = await this.s3Client.send(listCommand);
      
      if (!response.Contents) {
        console.log('📭 No existing files found in S3 bucket');
        return;
      }

      for (const object of response.Contents) {
        if (!object.Key || object.Size === 0) continue;

        // Parse S3 key to extract file info
        // Expected format: uploads/{userId}/{fileId}-{filename}
        const keyParts = object.Key.split('/');
        if (keyParts.length < 3) continue;

        const userId = keyParts[1];
        const fileNameWithId = keyParts[2];
        
        // Extract fileId and original filename
        const dashIndex = fileNameWithId.indexOf('-');
        if (dashIndex === -1) continue;

        const fileId = fileNameWithId.substring(0, dashIndex);
        const originalName = fileNameWithId.substring(dashIndex + 1);

        // Try to determine MIME type from file extension
        const mimeType = this.getMimeTypeFromFilename(originalName);

        const fileInfo: FileInfo = {
          id: fileId,
          filename: originalName,
          originalName: originalName,
          size: object.Size || 0,
          mimeType: mimeType,
          s3Key: object.Key,
          uploadedAt: object.LastModified || new Date(),
          userId: userId,
        };

        this.files.push(fileInfo);
      }

      console.log(`📁 Found ${response.Contents.length} objects in S3, processed ${this.files.length} valid files`);
    } catch (error) {
      console.error('❌ Error loading existing files from S3:', error);
      // Don't throw error to prevent app startup failure
    }
  }

  private getMimeTypeFromFilename(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  }

  async uploadToS3(file: Express.Multer.File, userId: string): Promise<FileInfo> {
    const fileId = Date.now().toString();
    const s3Key = `uploads/${userId}/${fileId}-${file.originalname}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(putObjectCommand);

    const fileInfo: FileInfo = {
      id: fileId,
      filename: file.originalname,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      s3Key,
      uploadedAt: new Date(),
      userId,
    };

    this.files.push(fileInfo);
    return fileInfo;
  }

  async generateUploadUrl(filename: string, mimeType: string, userId: string): Promise<PresignedUrlRes> {
    const fileId = Date.now().toString();
    const s3Key = `uploads/${userId}/${fileId}-${filename}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: mimeType,
    });

    // Generate presigned URL for upload
    const uploadUrl = await getSignedUrl(this.s3Client, putObjectCommand, { expiresIn: 3600 });

    const fileInfo: FileInfo = {
      id: fileId,
      filename,
      originalName: filename,
      size: 0,
      mimeType,
      s3Key,
      uploadedAt: new Date(),
      userId,
    };

    this.files.push(fileInfo);

    return {
      uploadUrl,
      fileInfo,
    };
  }

  async generateDownloadUrl(fileId: string, userId: string): Promise<string> {
    const fileInfo = await this.getFileById(fileId, userId);
    if (!fileInfo) {
      throw new Error('File not found');
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileInfo.s3Key,
    });

    // Generate presigned URL for download
    return await getSignedUrl(this.s3Client, getObjectCommand, { expiresIn: 3600 });
  }

  async updateFileSize(fileId: string, size: number): Promise<void> {
    const fileIndex = this.files.findIndex(file => file.id === fileId);
    if (fileIndex !== -1) {
      this.files[fileIndex].size = size;
    }
  }

  async getFilesByUserId(userId: string): Promise<FileInfo[]> {
    return this.files.filter(file => file.userId === userId);
  }

  async getFileById(fileId: string, userId: string): Promise<FileInfo | undefined> {
    return this.files.find(file => file.id === fileId && file.userId === userId);
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const fileInfo = await this.getFileById(fileId, userId);
    if (!fileInfo) {
      throw new Error('File not found');
    }

    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileInfo.s3Key,
    });

    await this.s3Client.send(deleteObjectCommand);

    const fileIndex = this.files.findIndex(file => file.id === fileId && file.userId === userId);
    if (fileIndex !== -1) {
      this.files.splice(fileIndex, 1);
    }
  }
} 