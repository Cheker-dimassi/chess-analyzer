import sharp from 'sharp';
import { ChessPosition } from '@shared/api';

export class ImageProcessorService {
  /**
   * Process uploaded image and attempt to recognize chess position
   * This is a simplified demo implementation
   * In production, you'd use computer vision models like YOLO or custom CNN
   */
  async recognizeChessPosition(imageBuffer: Buffer): Promise<{
    success: boolean;
    position?: ChessPosition;
    confidence?: number;
    error?: string;
  }> {
    try {
      // Process the image with sharp
      const processedImage = await sharp(imageBuffer)
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .greyscale()
        .normalize()
        .png()
        .toBuffer();

      // Simulate chess board recognition
      // In production, this would involve:
      // 1. Board detection and corner finding
      // 2. Perspective correction
      // 3. Square segmentation 
      // 4. Piece classification using CNN
      
      const recognizedPositions = [
        // Starting position
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        // Italian Game
        'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        // Sicilian Defense
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
        // Queen's Gambit
        'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
        // King's Indian Defense
        'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3'
      ];

      // Simulate recognition with random selection and confidence
      const randomPosition = recognizedPositions[Math.floor(Math.random() * recognizedPositions.length)];
      const confidence = 70 + Math.random() * 25; // 70-95% confidence

      // Extract turn from FEN
      const fenParts = randomPosition.split(' ');
      const turn = fenParts[1] as 'w' | 'b';

      return {
        success: true,
        position: {
          fen: randomPosition,
          turn
        },
        confidence: Math.round(confidence)
      };

    } catch (error) {
      return {
        success: false,
        error: `Image processing failed: ${error.message}`
      };
    }
  }

  /**
   * Validate image format and size
   */
  async validateImage(imageBuffer: Buffer): Promise<{
    valid: boolean;
    error?: string;
    metadata?: any;
  }> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
      // Check file size (max 10MB)
      if (imageBuffer.length > 10 * 1024 * 1024) {
        return {
          valid: false,
          error: 'Image file is too large. Maximum size is 10MB.'
        };
      }

      // Check image dimensions (minimum 200x200)
      if (metadata.width < 200 || metadata.height < 200) {
        return {
          valid: false,
          error: 'Image is too small. Minimum size is 200x200 pixels.'
        };
      }

      // Check format
      const supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      if (!supportedFormats.includes(metadata.format || '')) {
        return {
          valid: false,
          error: 'Unsupported image format. Please use JPEG, PNG, or WebP.'
        };
      }

      return {
        valid: true,
        metadata
      };

    } catch (error) {
      return {
        valid: false,
        error: `Invalid image file: ${error.message}`
      };
    }
  }

  /**
   * Convert base64 image to buffer
   */
  base64ToBuffer(base64Data: string): Buffer {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(base64, 'base64');
  }

  /**
   * Enhance image for better recognition
   */
  async enhanceForRecognition(imageBuffer: Buffer): Promise<Buffer> {
    return await sharp(imageBuffer)
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .sharpen(1, 1, 2)
      .normalize()
      .png({ quality: 90 })
      .toBuffer();
  }
}

export const imageProcessor = new ImageProcessorService();
