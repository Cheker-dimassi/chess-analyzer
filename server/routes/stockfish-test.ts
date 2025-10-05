import { RequestHandler } from 'express';
import { enhancedChessEngine } from '../services/stockfishEngine';

export const testStockfish: RequestHandler = async (req, res) => {
  try {
    // Try to analyze a simple position
    const result = await enhancedChessEngine.analyzePosition(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      5  // shallow depth for quick test
    );
    res.json({
      success: true,
      result,
      enginePath: process.env.STOCKFISH_PATH
    });
  } catch (error) {
    console.error('Stockfish test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      enginePath: process.env.STOCKFISH_PATH
    });
  }
};