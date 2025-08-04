import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FilesService, FileInfo } from './files.service';

@Controller('files')

export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
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
  ): Promise<FileInfo> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.filesService.uploadFile(file, 'demo-user');
  }

  @Get()
  async getFiles(): Promise<FileInfo[]> {
    return this.filesService.getFilesByUserId('demo-user');
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string): Promise<void> {
    return this.filesService.deleteFile(id, 'demo-user');
  }
} 