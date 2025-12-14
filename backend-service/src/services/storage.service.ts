import { Injectable } from '@nestjs/common';
import { FirestoreStorageService } from './firestore-storage.service';
import { StorageContentType } from 'src/models/content-type.model';

/**
 * Service for storing files
 * Now uses Firestore instead of Cloud Storage for Spark plan compatibility
 */
@Injectable()
export class StorageService {
  constructor(
    private readonly firestoreStorageService: FirestoreStorageService,
  ) { }

  /**
   * Store a file buffer in Firestore
   * @param file - File buffer to store
   * @param destinationPath - Path/location identifier
   * @param options - MIME type (optional)
   * @returns Document ID of the stored file
   */
  async storeFile(
    file: Buffer,
    destinationPath: string,
    options?: StorageContentType | string,
  ): Promise<string> {
    const mimeType = options || StorageContentType.SVG;
    return this.firestoreStorageService.storeBuffer(
      file,
      destinationPath,
      mimeType,
    );
  }

  /**
   * Get a file from Firestore as data URI
   * @param fileId - Document ID of the stored file
   * @returns Data URI string
   */
  async getFile(fileId: string): Promise<string> {
    return this.firestoreStorageService.getImage(fileId);
  }
}

