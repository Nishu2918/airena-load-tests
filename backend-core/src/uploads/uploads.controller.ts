import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UploadsService } from './uploads.service';
import { memoryStorage } from 'multer';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Upload a single file
   * POST /api/v1/uploads
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check if storage is configured before attempting upload
    if (!this.uploadsService.isCloudStorageConfigured()) {
      throw new BadRequestException(
        'File storage is not configured. Please configure Azure Blob Storage or Backblaze B2 in your .env file. ' +
        'For Azure: set AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER_NAME (or AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, and AZURE_STORAGE_CONTAINER_NAME)'
      );
    }

    try {
      const result = await this.uploadsService.uploadFile(
        file,
        folder || 'submissions',
        user.id,
      );

      return {
        success: true,
        file: {
          url: result.url,
          key: result.key,
          size: result.size,
          originalName: file.originalname,
          mimeType: file.mimetype,
        },
        storage: this.uploadsService.getStorageInfo(),
      };
    } catch (error) {
      // Re-throw with more context if it's a BadRequestException
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   * POST /api/v1/uploads/multiple
   */
  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB per file
      },
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
    @Body('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const results = await this.uploadsService.uploadFiles(
      files,
      folder || 'submissions',
      user.id,
    );

    return {
      success: true,
      files: results,
      storage: this.uploadsService.getStorageInfo(),
    };
  }

  /**
   * Get storage configuration info
   * GET /api/v1/uploads/info
   */
  @Post('info')
  getStorageInfo() {
    return {
      storage: this.uploadsService.getStorageInfo(),
    };
  }
}
