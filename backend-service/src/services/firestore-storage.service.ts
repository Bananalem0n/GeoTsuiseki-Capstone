import {
    Injectable,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { admin } from 'src/main';
import { nanoid } from 'nanoid';
import { COLLECTIONS } from 'src/constants';
import * as firebaseAdmin from 'firebase-admin';

/**
 * Interface for stored file document
 */
export interface StoredFile {
    id: string;
    location: string;
    filename: string;
    mimeType: string;
    size: number;
    data: string;
    createdAt: FirebaseFirestore.Timestamp;
}

/**
 * Service for storing files in Firestore instead of Cloud Storage
 * This enables the app to run on Firebase Spark (free) plan
 */
@Injectable()
export class FirestoreStorageService {
    private readonly filesCollection = COLLECTIONS.FILES;

    // Maximum size in bytes before compression (5MB)
    private readonly MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

    // Target size after compression to stay under 1MB Firestore limit
    // Base64 encoding adds ~33% overhead, so target ~700KB
    private readonly TARGET_SIZE_BYTES = 700 * 1024;

    /**
     * Store an image in Firestore as base64
     * @param location - Path/purpose identifier (e.g., "partner-logo/business1")
     * @param file - Multer file object
     * @returns Document ID for the stored file
     */
    async storeImage(
        location: string,
        file: Express.Multer.File,
    ): Promise<string> {
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }

        // Validate file size
        if (file.size > this.MAX_UPLOAD_SIZE) {
            throw new BadRequestException(
                `File too large. Maximum size is ${this.MAX_UPLOAD_SIZE / 1024 / 1024}MB`,
            );
        }

        // Validate file type
        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Only image files are allowed');
        }

        try {
            let buffer = file.buffer;
            let mimeType = file.mimetype;

            // Compress if needed
            if (buffer.length > this.TARGET_SIZE_BYTES) {
                const compressed = await this.compressImage(buffer, mimeType);
                buffer = compressed.buffer;
                mimeType = compressed.mimeType;
            }

            // Convert to base64
            const base64Data = buffer.toString('base64');

            // Check final size (base64 adds ~33% overhead)
            const estimatedDocSize = base64Data.length + 500; // 500 bytes for metadata
            if (estimatedDocSize > 1000000) {
                throw new BadRequestException(
                    'Image is too large even after compression. Please use a smaller image.',
                );
            }

            // Generate unique ID
            const fileId = nanoid(16);

            // Store in Firestore
            const fileDoc: Omit<StoredFile, 'createdAt'> & { createdAt: FirebaseFirestore.FieldValue } = {
                id: fileId,
                location,
                filename: file.originalname,
                mimeType,
                size: buffer.length,
                data: base64Data,
                createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            };

            await admin
                .firestore()
                .collection(this.filesCollection)
                .doc(fileId)
                .set(fileDoc);

            return fileId;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            console.error('Error storing image:', error.message);
            throw new InternalServerErrorException('Failed to store image');
        }
    }

    /**
     * Store a raw buffer (for QR codes, etc.) in Firestore
     * @param buffer - File buffer
     * @param location - Path/purpose identifier
     * @param mimeType - MIME type of the file
     * @returns Document ID for the stored file
     */
    async storeBuffer(
        buffer: Buffer,
        location: string,
        mimeType: string = 'image/svg+xml',
    ): Promise<string> {
        try {
            const base64Data = buffer.toString('base64');
            const fileId = nanoid(16);

            const fileDoc: Omit<StoredFile, 'createdAt'> & { createdAt: FirebaseFirestore.FieldValue } = {
                id: fileId,
                location,
                filename: `${fileId}.${this.getExtensionFromMime(mimeType)}`,
                mimeType,
                size: buffer.length,
                data: base64Data,
                createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            };

            await admin
                .firestore()
                .collection(this.filesCollection)
                .doc(fileId)
                .set(fileDoc);

            return fileId;
        } catch (error) {
            console.error('Error storing buffer:', error.message);
            throw new InternalServerErrorException('Failed to store file');
        }
    }

    /**
     * Get an image from Firestore as a data URI
     * @param fileId - Document ID of the stored file
     * @returns Base64 data URI (data:image/jpeg;base64,...)
     */
    async getImage(fileId: string): Promise<string> {
        try {
            // If already a data URI, return as-is
            if (fileId.startsWith('data:')) {
                return fileId;
            }

            const doc = await admin
                .firestore()
                .collection(this.filesCollection)
                .doc(fileId)
                .get();

            if (!doc.exists) {
                throw new NotFoundException('Image not found');
            }

            const fileData = doc.data() as StoredFile;
            return `data:${fileData.mimeType};base64,${fileData.data}`;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error getting image:', error.message);
            throw new InternalServerErrorException('Failed to retrieve image');
        }
    }

    /**
     * Get raw base64 data (without data URI prefix)
     * @param fileId - Document ID of the stored file
     * @returns Base64 string
     */
    async getBase64(fileId: string): Promise<string> {
        try {
            const doc = await admin
                .firestore()
                .collection(this.filesCollection)
                .doc(fileId)
                .get();

            if (!doc.exists) {
                throw new NotFoundException('File not found');
            }

            const fileData = doc.data() as StoredFile;
            return fileData.data;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error getting file:', error.message);
            throw new InternalServerErrorException('Failed to retrieve file');
        }
    }

    /**
     * Delete an image from Firestore
     * @param fileId - Document ID of the stored file
     */
    async deleteImage(fileId: string): Promise<void> {
        try {
            await admin
                .firestore()
                .collection(this.filesCollection)
                .doc(fileId)
                .delete();
        } catch (error) {
            console.error('Error deleting image:', error.message);
            throw new InternalServerErrorException('Failed to delete image');
        }
    }

    /**
     * Compress image to fit within size limits
     * Uses quality reduction for JPEG/PNG
     */
    private async compressImage(
        buffer: Buffer,
        mimeType: string,
    ): Promise<{ buffer: Buffer; mimeType: string }> {
        try {
            // Dynamic import for sharp (optional dependency)
            const sharp = await import('sharp');

            let quality = 80;
            let compressedBuffer = buffer;

            // Progressive quality reduction until we hit target size
            while (compressedBuffer.length > this.TARGET_SIZE_BYTES && quality > 10) {
                const image = sharp.default(buffer);

                // Resize if very large
                const metadata = await image.metadata();
                if (metadata.width > 1200 || metadata.height > 1200) {
                    image.resize(1200, 1200, { fit: 'inside', withoutEnlargement: true });
                }

                // Compress as JPEG for best compression
                compressedBuffer = await image
                    .jpeg({ quality, progressive: true })
                    .toBuffer();

                quality -= 10;
            }

            return {
                buffer: compressedBuffer,
                mimeType: 'image/jpeg',
            };
        } catch (error) {
            // If sharp is not available, return original with warning
            console.warn(
                'Image compression not available (sharp not installed). Using original image.',
            );
            return { buffer, mimeType };
        }
    }

    /**
     * Get file extension from MIME type
     */
    private getExtensionFromMime(mimeType: string): string {
        const mimeMap: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/svg+xml': 'svg',
            'image/webp': 'webp',
        };
        return mimeMap[mimeType] || 'bin';
    }
}
