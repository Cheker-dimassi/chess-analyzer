import { RequestHandler } from 'express';
import { GetHistoryResponse } from '@shared/api';
import { dataService } from '../services/dataService';

/**
 * Get user statistics
 */
export const getUserStats: RequestHandler = async (req, res) => {
  try {
    const stats = await dataService.getStats();
    
    res.json({
      success: true,
      stats
    } as GetHistoryResponse);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user statistics'
    } as GetHistoryResponse);
  }
};

/**
 * Get combined history (analyses and games)
 */
export const getHistory: RequestHandler = async (req, res) => {
  try {
    const analysisLimit = parseInt(req.query.analysisLimit as string) || 5;
    const gameLimit = parseInt(req.query.gameLimit as string) || 5;
    
    const [analyses, games, stats] = await Promise.all([
      dataService.getAnalysisHistory(Math.min(analysisLimit, 20)),
      dataService.getGameHistory(Math.min(gameLimit, 20)),
      dataService.getStats()
    ]);
    
    res.json({
      success: true,
      analyses,
      games,
      stats
    } as GetHistoryResponse);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve history'
    } as GetHistoryResponse);
  }
};

/**
 * Clear all user data
 */
export const clearUserData: RequestHandler = async (req, res) => {
  try {
    // In a real app, you'd clear user-specific data from the database
    // For this demo, we'll reset the data service
    const analyses = await dataService.getAnalysisHistory(100);
    const games = await dataService.getGameHistory(100);
    
    // Delete all analyses
    for (const analysis of analyses) {
      await dataService.deleteAnalysis(analysis.id);
    }
    
    // Delete all games
    for (const gameHistory of games) {
      await dataService.deleteGame(gameHistory.id);
    }
    
    res.json({
      success: true,
      message: 'User data cleared successfully'
    });
  } catch (error) {
    console.error('Clear user data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear user data'
    });
  }
};

/**
 * Export user data
 */
export const exportUserData: RequestHandler = async (req, res) => {
  try {
    const [analyses, games, stats] = await Promise.all([
      dataService.getAnalysisHistory(1000),
      dataService.getGameHistory(1000),
      dataService.getStats()
    ]);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      analyses,
      games,
      stats
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="chessvision-data.json"');
    res.json(exportData);
  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export user data'
    });
  }
};

/**
 * Update user preferences (placeholder for future implementation)
 */
export const updatePreferences: RequestHandler = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    // In a real app, you'd save preferences to the database
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
};
