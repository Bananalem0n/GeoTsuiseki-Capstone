/**
 * QR Code Service
 * Uses local 'qrcode' library - free, unlimited, no external API calls
 */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { StorageService } from './storage.service';
import { StorageContentType } from 'src/models/content-type.model';

@Injectable()
export class QrCodeService {
  constructor(private readonly storageService: StorageService) { }

  /**
   * Generate a QR code as SVG string
   * @param data - Data to encode in QR code (string or object)
   * @param _output - Filename (unused, kept for compatibility)
   * @returns SVG string
   */
  async generateQrCode(data: string | object, _output: string = 'qrcode'): Promise<string> {
    try {
      // Convert object to string if needed
      const content = typeof data === 'string' ? data : JSON.stringify(data);

      // Generate QR code as SVG string
      const svg = await QRCode.toString(content, {
        type: 'svg',
        width: 400,
        margin: 4,
        errorCorrectionLevel: 'Q',
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return svg;
    } catch (error) {
      console.error('Error generating QR code:', error.message);
      throw new InternalServerErrorException('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code as PNG buffer (for image use)
   * @param data - Data to encode
   * @returns PNG buffer
   */
  async generateQrCodeBuffer(data: string | object): Promise<Buffer> {
    try {
      const content = typeof data === 'string' ? data : JSON.stringify(data);

      const buffer = await QRCode.toBuffer(content, {
        type: 'png',
        width: 400,
        margin: 4,
        errorCorrectionLevel: 'Q',
      });

      return buffer;
    } catch (error) {
      console.error('Error generating QR code buffer:', error.message);
      throw new InternalServerErrorException('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code and store in Firestore
   * @param data - Data to encode (should include 'id' property)
   * @param location - Storage location path
   * @returns Document ID of stored QR code
   */
  async generateBatchQrCode(
    data: { id: string;[key: string]: unknown },
    location: string,
  ): Promise<string> {
    try {
      const svg = await this.generateQrCode(data, data.id);

      // Convert SVG string to buffer for storage
      const buffer = Buffer.from(svg, 'utf-8');

      const fileId = await this.storageService.storeFile(
        buffer,
        `${location}/${data.id}`,
        StorageContentType.SVG,
      );

      return fileId;
    } catch (error) {
      console.error('Error generating batch QR code:', error.message);
      throw new InternalServerErrorException('Failed to generate and store QR code');
    }
  }

  /**
   * Generate QR code as data URI (for embedding in HTML)
   * @param data - Data to encode
   * @returns Data URI string (data:image/png;base64,...)
   */
  async generateQrCodeDataUri(data: string | object): Promise<string> {
    try {
      const content = typeof data === 'string' ? data : JSON.stringify(data);

      return await QRCode.toDataURL(content, {
        width: 400,
        margin: 4,
        errorCorrectionLevel: 'Q',
      });
    } catch (error) {
      console.error('Error generating QR code data URI:', error.message);
      throw new InternalServerErrorException('Failed to generate QR code');
    }
  }
}

