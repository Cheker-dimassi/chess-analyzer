import { RequestHandler } from 'express';
import multer from 'multer';
import type { RequestHandler as ExpressRequestHandler, ErrorRequestHandler } from 'express';
import { ImageAnalysisResponse } from '@shared/api';
import { enhancedChessEngine } from '../services/stockfishEngine';
import { imageProcessor } from '../services/imageProcessor';
import { dataService } from '../services/dataService';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

/**
 * Upload and analyze chess board image
 */
export const uploadAndAnalyzeImage: ExpressRequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      } as ImageAnalysisResponse);
    }

    const imageBuffer = req.file.buffer;

    // Validate image
    const validation = await imageProcessor.validateImage(imageBuffer);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      } as ImageAnalysisResponse);
    }

    // Recognize chess position from image
    const recognition = await imageProcessor.recognizeChessPosition(imageBuffer);
    if (!recognition.success || !recognition.position) {
      return res.status(400).json({
        success: false,
        error: recognition.error || 'Failed to recognize chess position',
        confidence: recognition.confidence
      } as ImageAnalysisResponse);
    }

    // Analyze the recognized position
    const depth = parseInt(req.body.depth) || 15;
    const timeout = parseInt(req.body.timeout) || 5000;
    
    const analysis = await enhancedChessEngine.analyzeWithStockfish(
      recognition.position.fen,
      Math.min(depth, 20),
      Math.min(timeout, 10000)
    );

    // Save to history
    await dataService.saveAnalysis(recognition.position, analysis, 'upload');

    res.json({
      success: true,
      analysis,
      recognizedPosition: recognition.position,
      confidence: recognition.confidence
    } as ImageAnalysisResponse);

  } catch (error) {
    console.error('Upload and analyze error:', error);
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ImageAnalysisResponse);
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error during image analysis'
    } as ImageAnalysisResponse);
  }
};

/**
 * Middleware to handle multer errors
 */
export const handleUploadError: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      } as ImageAnalysisResponse);
    }
    
    return res.status(400).json({
      success: false,
      error: `Upload error: ${error.message}`
    } as ImageAnalysisResponse);
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ImageAnalysisResponse);
  }
  
  next();
};

// Export the multer upload middleware
export const uploadMiddleware = upload.single('image');
