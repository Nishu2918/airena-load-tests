import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
      
      // Check if cloud storage is configured (Azure Blob Storage or Backblaze B2)
      // If storage is configured, files will persist. Otherwise, clear them for testing.
      const azureConfigured = (process.env.AZURE_STORAGE_CONNECTION_STRING && process.env.AZURE_STORAGE_CONTAINER_NAME) ||
                              (process.env.AZURE_STORAGE_ACCOUNT_NAME && 
                               process.env.AZURE_STORAGE_ACCOUNT_KEY && 
                               process.env.AZURE_STORAGE_CONTAINER_NAME);
      const b2Configured = process.env.B2_APPLICATION_KEY_ID && 
                          process.env.B2_APPLICATION_KEY && 
                          process.env.B2_BUCKET_NAME && 
                          (process.env.B2_ENDPOINT || process.env.B2_ENDPOINT_URL);
      
      if (azureConfigured) {
        this.logger.log('✅ Azure Blob Storage configured - files will persist');
        this.logger.log(`   Container: ${process.env.AZURE_STORAGE_CONTAINER_NAME}`);
      } else if (b2Configured) {
        this.logger.log('✅ Backblaze B2 storage configured - files will persist');
        this.logger.log(`   Bucket: ${process.env.B2_BUCKET_NAME}`);
      } else {
        // Only clear files if no storage is configured (testing mode)
        this.logger.warn('⚠️  No cloud storage configured - clearing file metadata for testing');
        try {
          // Find all submissions with files
          const submissionsWithFiles = await this.submission.findMany({
            where: {
              files: {
                not: null,
              },
            },
            select: {
              id: true,
            },
          });
          
          if (submissionsWithFiles.length > 0) {
            // Clear files from all submissions
            await this.submission.updateMany({
              where: {
                id: {
                  in: submissionsWithFiles.map(s => s.id),
                },
              },
              data: {
                files: null,
              },
            });
            this.logger.log(`🧹 Cleared file metadata from ${submissionsWithFiles.length} submission(s) (testing mode - no storage configured)`);
          }
        } catch (error) {
          // Ignore errors during cleanup (might fail if table doesn't exist yet)
          this.logger.warn('⚠️  Could not clear file metadata (this is okay)');
        }
      }
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error);
      this.logger.error('💡 Please check your DATABASE_URL in .env file');
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}

