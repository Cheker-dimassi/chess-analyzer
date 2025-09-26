import { RequestHandler } from 'express';
import { 
  ImageAnalysisRequest, 
  ImageAnalysisResponse, 
  PositionAnalysisRequest, 
  PositionAnalysisResponse 
} from '@shared/api';
import { enhancedChessEngine } from '../services/stockfishEngine';
import { imageProcessor } from '../services/imageProcessor';
import { dataService } from '../services/dataService';

/**
 * Analyze chess position from uploaded image
 */
export const analyzeImage: RequestHandler = async (req, res) => {
  try {
    const { imageData, options }: ImageAnalysisRequest = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'No image data provided'
      } as ImageAnalysisResponse);
    }

    // Convert base64 to buffer
    const imageBuffer = imageProcessor.base64ToBuffer(imageData);

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

    // Analyze the recognized position using Stockfish
    const analysis = await enhancedChessEngine.analyzeWithStockfish(
      recognition.position.fen,
      15, // Use depth 15 for Stockfish analysis
      options?.timeout || 5000
    );

    // Save to history
    await dataService.saveAnalysis(recognition.position, analysis, 'camera');

    res.json({
      success: true,
      analysis,
      recognizedPosition: recognition.position,
      confidence: recognition.confidence
    } as ImageAnalysisResponse);

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during image analysis'
    } as ImageAnalysisResponse);
  }
};

/**
 * Analyze chess position from FEN string
 */
export const analyzePosition: RequestHandler = async (req, res) => {
  try {
    const { fen, depth = 15, timeout = 5000 }: PositionAnalysisRequest = req.body;

    if (!fen) {
      return res.status(400).json({
        success: false,
        error: 'No FEN string provided'
      } as PositionAnalysisResponse);
    }

    // Validate FEN format
    if (!isValidFen(fen)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid FEN string'
      } as PositionAnalysisResponse);
    }

    // Analyze position using Stockfish
    const analysis = await enhancedChessEngine.analyzeWithStockfish(
      fen,
      Math.min(depth, 20),
      Math.min(timeout, 10000)
    );

    // Extract position info
    const fenParts = fen.split(' ');
    const position = {
      fen,
      turn: fenParts[1] as 'w' | 'b'
    };

    // Save to history
    await dataService.saveAnalysis(position, analysis, 'manual');

    res.json({
      success: true,
      analysis
    } as PositionAnalysisResponse);

  } catch (error) {
    console.error('Position analysis error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to analyze position: ${error.message}`
    } as PositionAnalysisResponse);
  }
};

/**
 * Get analysis history
 */
export const getAnalysisHistory: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const analyses = await dataService.getAnalysisHistory(Math.min(limit, 50));
    
    res.json({
      success: true,
      analyses
    });
  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analysis history'
    });
  }
};

/**
 * Delete analysis from history
 */
export const deleteAnalysis: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dataService.deleteAnalysis(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete analysis'
    });
  }
};

/**
 * Validate FEN string format
 */
function isValidFen(fen: string): boolean {
  try {
    const parts = fen.split(' ');
    if (parts.length !== 6) return false;
    
    // Validate board part
    const board = parts[0];
    const ranks = board.split('/');
    if (ranks.length !== 8) return false;
    
    for (const rank of ranks) {
      let squares = 0;
      for (const char of rank) {
        if ('12345678'.includes(char)) {
          squares += parseInt(char);
        } else if ('pnbrqkPNBRQK'.includes(char)) {
          squares += 1;
        } else {
          return false;
        }
      }
      if (squares !== 8) return false;
    }
    
    // Validate turn
    if (!'wb'.includes(parts[1])) return false;
    
    // Validate castling rights
    if (!/^-|[KQkq]+$/.test(parts[2])) return false;
    
    // Validate en passant
    if (!/^-|[a-h][36]$/.test(parts[3])) return false;
    
    // Validate halfmove and fullmove clocks
    if (isNaN(parseInt(parts[4])) || isNaN(parseInt(parts[5]))) return false;
    
    return true;
  } catch {
    return false;
  }
}
