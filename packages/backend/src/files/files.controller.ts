import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  BadRequestException,
  UseGuards,
  Request,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService, FileInfo, PresignedUrlRes } from './files.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB Limit
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [ // File type filter
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'text/plain',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'File type not allowed. Allowed types: PDF, JPG, PNG, TXT'
            ),
            false
          );
        }

        callback(null, true);
      },
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<FileInfo> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.filesService.uploadToS3(file, req.user.userId);
  }

  @Post('upload-url')
  async generateUploadUrl(
    @Body() body: { filename: string; mimeType: string },
    @Request() req: any,
  ): Promise<PresignedUrlRes> {
    const { filename, mimeType } = body;

    if (!filename || !mimeType) {
      throw new BadRequestException('Filename and mimeType are required');
    }

    // Validation for file type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain',
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        'File type not allowed. Allowed types: PDF, JPG, PNG, TXT'
      );
    }

    return this.filesService.generateUploadUrl(filename, mimeType, req.user.userId);
  }

  @Post(':id/complete-upload')
  async completeUpload(
    @Param('id') id: string,
    @Body() body: { size: number },
    @Request() req: any,
  ): Promise<void> {
    await this.filesService.updateFileSize(id, body.size);
  }

  @Get()
  async getFiles(@Request() req: any): Promise<FileInfo[]> {
    return this.filesService.getFilesByUserId(req.user.userId);
  }

  @Get(':id/download-url')
  async generateDownloadUrl(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ downloadUrl: string }> {
    const downloadUrl = await this.filesService.generateDownloadUrl(id, req.user.userId);
    return { downloadUrl };
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.filesService.deleteFile(id, req.user.userId);
  }
} 