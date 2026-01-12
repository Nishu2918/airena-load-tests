import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private s3Client: S3Client | null = null;
  private azureBlobClient: BlobServiceClient | null = null;
  private containerName: string | null = null;
  private bucketName: string | null = null;
  private endpoint: string | null = null;
  private _isCloudStorageConfigured = false;
  private storageType: 'b2' | 'azure' | null = null;
  private azureAccountName: string | null = null;
  private azureAccountKey: string | null = null;

  constructor(private configService: ConfigService) {
    this.initializeStorage();
  }

  private initializeStorage() {
    // Check for Azure Blob Storage configuration (priority)
    const azureAccountName = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_NAME');
    const azureAccountKey = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_KEY');
    const azureContainerName = this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME');
    const azureConnectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');

    // Check for Backblaze B2 configuration (S3-compatible)
    const b2KeyId = this.configService.get<string>('B2_APPLICATION_KEY_ID');
    const b2Key = this.configService.get<string>('B2_APPLICATION_KEY');
    const b2Bucket = this.configService.get<string>('B2_BUCKET_NAME');
    const b2Endpoint = this.configService.get<string>('B2_ENDPOINT_URL') || this.configService.get<string>('B2_ENDPOINT');

    // Priority: Azure Blob Storage
    if (azureConnectionString && azureContainerName) {
      try {
        // Azure Blob Storage Configuration using Connection String
        this.azureBlobClient = BlobServiceClient.fromConnectionString(azureConnectionString);
        this.containerName = azureContainerName.trim();
        this.storageType = 'azure';
        this._isCloudStorageConfigured = true;
        this.logger.log('✅ Azure Blob Storage configured (Connection String)');
        this.logger.log(`   Container: ${azureContainerName}`);
      } catch (error) {
        this.logger.error('❌ Failed to initialize Azure Blob Storage client:', error.message);
        this._isCloudStorageConfigured = false;
      }
    } else if (azureAccountName && azureAccountKey && azureContainerName) {
      try {
        // Azure Blob Storage Configuration using Account Name and Key
        const sharedKeyCredential = new StorageSharedKeyCredential(azureAccountName, azureAccountKey);
        this.azureBlobClient = new BlobServiceClient(
          `https://${azureAccountName}.blob.core.windows.net`,
          sharedKeyCredential
        );
        this.containerName = azureContainerName.trim();
        this.azureAccountName = azureAccountName.trim();
        this.azureAccountKey = azureAccountKey.trim();
        this.storageType = 'azure';
        this._isCloudStorageConfigured = true;
        this.logger.log('✅ Azure Blob Storage configured (Account Key)');
        this.logger.log(`   Account: ${azureAccountName}`);
        this.logger.log(`   Container: ${azureContainerName}`);
      } catch (error) {
        this.logger.error('❌ Failed to initialize Azure Blob Storage client:', error.message);
        this.logger.error('   Please verify your AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, and AZURE_STORAGE_CONTAINER_NAME in .env');
        this._isCloudStorageConfigured = false;
      }
    } else if (b2KeyId && b2Key && b2Bucket && b2Endpoint) {
      // Validate Backblaze B2 credentials format
      if (b2KeyId.trim().length === 0 || b2Key.trim().length === 0) {
        this.logger.error('❌ Backblaze B2 credentials are empty. Please check your .env file.');
        this._isCloudStorageConfigured = false;
        return;
      }

      // Validate endpoint format
      if (!b2Endpoint.startsWith('https://')) {
        this.logger.error(`❌ Invalid Backblaze B2 endpoint format: ${b2Endpoint}`);
        this.logger.error('   Endpoint should start with https:// (e.g., https://s3.us-west-004.backblazeb2.com)');
        this._isCloudStorageConfigured = false;
        return;
      }

      try {
        // Backblaze B2 Configuration (S3-compatible)
        this.s3Client = new S3Client({
          region: 'us-west-004', // Backblaze B2 uses this region
          endpoint: b2Endpoint,
          credentials: {
            accessKeyId: b2KeyId.trim(),
            secretAccessKey: b2Key.trim(),
          },
          forcePathStyle: true, // Required for Backblaze B2
        });
        this.bucketName = b2Bucket.trim();
        this.endpoint = b2Endpoint.trim();
        this.storageType = 'b2';
        this._isCloudStorageConfigured = true;
        this.logger.log('✅ Backblaze B2 configured (S3-compatible)');
        this.logger.log(`   Bucket: ${b2Bucket}`);
        this.logger.log(`   Endpoint: ${b2Endpoint}`);
        this.logger.log(`   Key ID: ${b2KeyId.substring(0, 8)}...${b2KeyId.substring(b2KeyId.length - 4)} (masked)`);
      } catch (error) {
        this.logger.error('❌ Failed to initialize Backblaze B2 client:', error.message);
        this.logger.error('   Please verify your B2_APPLICATION_KEY_ID and B2_APPLICATION_KEY in .env');
        this._isCloudStorageConfigured = false;
      }
    } else {
      this._isCloudStorageConfigured = false;
      this.logger.warn('⚠️  Cloud storage not configured. File uploads will fail.');
      
      // Show which variables are missing
      const missingAzureVars: string[] = [];
      if (!azureConnectionString && !azureAccountName) missingAzureVars.push('AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME');
      if (!azureAccountKey && !azureConnectionString) missingAzureVars.push('AZURE_STORAGE_ACCOUNT_KEY');
      if (!azureContainerName) missingAzureVars.push('AZURE_STORAGE_CONTAINER_NAME');
      
      if (missingAzureVars.length > 0) {
        this.logger.warn(`   Missing Azure Blob Storage variables: ${missingAzureVars.join(', ')}`);
      }
      
      this.logger.warn('   To enable Azure Blob Storage (Primary): set AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER_NAME (or AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, and AZURE_STORAGE_CONTAINER_NAME) in .env');
      this.logger.warn('   Optional fallback: Backblaze B2 (only used if Azure is not configured)');
    }
  }

  public isCloudStorageConfigured(): boolean {
    return this._isCloudStorageConfigured;
  }

  /**
   * Upload a file to cloud storage (Azure Blob Storage - Primary, Backblaze B2 - Fallback)
   * @param file - File buffer and metadata
   * @param folder - Folder path in container/bucket (e.g., 'submissions', 'avatars')
   * @param userId - User ID for organizing files
   * @returns Public URL of the uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    userId?: string,
  ): Promise<{ url: string; key: string; size: number }> {
    if (!this._isCloudStorageConfigured) {
      const errorMsg = 'Cloud storage is not configured. Please configure Azure Blob Storage or Backblaze B2 in your .env file.';
      this.logger.error(`❌ ${errorMsg}`);
      throw new BadRequestException(errorMsg);
    }

    if (!file || !file.buffer) {
      throw new BadRequestException('File is required');
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop() || 'bin';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    
    // Build file path: folder/userId/filename or folder/filename
    const fileKey = userId 
      ? `${folder}/${userId}/${uniqueFileName}`
      : `${folder}/${uniqueFileName}`;

    try {
      if (this.storageType === 'azure' && this.azureBlobClient && this.containerName) {
        // Azure Blob Storage upload
        const containerClient = this.azureBlobClient.getContainerClient(this.containerName);
        
        // Ensure container exists
        await containerClient.createIfNotExists();

        const blockBlobClient = containerClient.getBlockBlobClient(fileKey);
        
        // Upload file to Azure Blob Storage (overwrite if exists, similar to Python upload_blob with overwrite=True)
        await blockBlobClient.upload(file.buffer, file.buffer.length, {
          blobHTTPHeaders: {
            blobContentType: file.mimetype || 'application/octet-stream',
          },
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          },
          // Overwrite existing blob if it exists (matches Python upload_blob overwrite=True behavior)
        });

        // Generate public URL
        const publicUrl = blockBlobClient.url;

        this.logger.log(`✅ File uploaded successfully to Azure: ${fileKey}`);
        this.logger.log(`   Size: ${(file.size / 1024).toFixed(2)} KB`);
        this.logger.log(`   URL: ${publicUrl}`);

        return {
          url: publicUrl,
          key: fileKey,
          size: file.size,
        };
      } else if (this.storageType === 'b2' && this.s3Client && this.bucketName) {
        // Backblaze B2 upload (S3-compatible)
        if (!this.s3Client) {
          const errorMsg = 'S3 client is not initialized. Please check your storage configuration.';
          this.logger.error(`❌ ${errorMsg}`);
          throw new BadRequestException(errorMsg);
        }

        const upload = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype || 'application/octet-stream',
            Metadata: {
              originalName: file.originalname,
              uploadedAt: new Date().toISOString(),
            },
          },
        });

        await upload.done();

        // Generate public URL (Backblaze B2)
        const publicUrl = `${this.endpoint}/${this.bucketName}/${fileKey}`;

        this.logger.log(`✅ File uploaded successfully: ${fileKey}`);
        this.logger.log(`   Size: ${(file.size / 1024).toFixed(2)} KB`);
        this.logger.log(`   URL: ${publicUrl}`);

        return {
          url: publicUrl,
          key: fileKey,
          size: file.size,
        };
      } else {
        throw new BadRequestException('Storage client is not properly initialized');
      }
    } catch (error) {
      this.logger.error(`❌ Failed to upload file: ${error.message}`);
      this.logger.error(`   Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
      
      // Provide more helpful error messages
      let errorMessage = `Failed to upload file: ${error.message}`;
      if (error.message.includes('Malformed Access Key Id') || error.message.includes('InvalidAccessKeyId')) {
        errorMessage = 'Invalid storage credentials. Please check your storage configuration in your .env file.';
        this.logger.error('   💡 Tip: Make sure your storage credentials are correct and not empty.');
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        errorMessage = 'Storage authentication failed. Please verify your storage credentials in .env file.';
        this.logger.error('   💡 Tip: Check that your storage credentials match your storage account.');
      } else if (error.message.includes('NoSuchBucket') || error.message.includes('ContainerNotFound')) {
        const containerOrBucket = this.storageType === 'azure' ? 'container' : 'bucket';
        errorMessage = `Storage ${containerOrBucket} not found. Please verify your ${containerOrBucket} name in .env file.`;
        this.logger.error(`   💡 Tip: Make sure the ${containerOrBucket} exists in your storage account.`);
      } else if (error.message.includes('endpoint')) {
        errorMessage = 'Invalid storage endpoint. Please check your storage endpoint configuration in .env file.';
        this.logger.error('   💡 Tip: Verify your storage endpoint URL is correct.');
      }
      
      throw new BadRequestException(errorMessage);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
    userId?: string,
  ): Promise<Array<{ url: string; key: string; size: number; originalName: string }>> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, folder, userId).then(result => ({
        ...result,
        originalName: file.originalname,
      }))
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Get storage information for debugging
   */
  getStorageInfo(): {
    configured: boolean;
    type: 'b2' | 'azure' | null;
    bucket: string | null;
    container: string | null;
    endpoint: string | null;
  } {
    return {
      configured: this._isCloudStorageConfigured,
      type: this.storageType,
      bucket: this.bucketName,
      container: this.containerName,
      endpoint: this.endpoint,
    };
  }
}
