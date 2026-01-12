import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
  BlobServiceClient,
} from '@azure/storage-blob';

@Injectable()
export class AzureSasService {
  private readonly logger = new Logger(AzureSasService.name);
  private credential: StorageSharedKeyCredential | null = null;
  private containerName: string | null = null;
  private accountName: string | null = null;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    // Try connection string first (same as UploadsService)
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    const containerName = this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME');

    if (connectionString && containerName) {
      try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        // Extract account name from connection string
        const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
        const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
        
        if (accountNameMatch && accountKeyMatch) {
          this.accountName = accountNameMatch[1];
          const accountKey = accountKeyMatch[1];
          this.containerName = containerName.trim();
          this.credential = new StorageSharedKeyCredential(this.accountName, accountKey);
          this.isConfigured = true;
          this.logger.log('✅ Azure SAS Service configured (Connection String)');
          return;
        }
      } catch (error) {
        this.logger.warn('Failed to initialize from connection string:', error);
      }
    }

    // Fallback to individual credentials
    const accountName = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_NAME');
    const accountKey = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_KEY');
    const container = this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME');

    if (accountName && accountKey && container) {
      this.accountName = accountName;
      this.containerName = container.trim();
      this.credential = new StorageSharedKeyCredential(accountName, accountKey);
      this.isConfigured = true;
      this.logger.log('✅ Azure SAS Service configured (Individual Credentials)');
      return;
    }

    // Not configured - service will be available but generateSas will fail gracefully
    this.logger.warn('⚠️ Azure SAS Service not configured - SAS URL generation will be disabled');
  }

  generateReadOnlySas(blobPath: string, expiresAt: Date): string {
    if (!this.isConfigured || !this.credential || !this.accountName || !this.containerName) {
      this.logger.warn('Azure SAS Service not configured - cannot generate SAS URL');
      throw new Error('Azure Storage is not configured for SAS URL generation');
    }

    const sas = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: expiresAt,
      },
      this.credential,
    ).toString();

    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobPath}?${sas}`;
  }
}

