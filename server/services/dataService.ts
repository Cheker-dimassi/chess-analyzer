import { 
  AnalysisHistory, 
  GameHistory, 
  UserStats, 
  ChessGame, 
  ChessAnalysis,
  ChessPosition 
} from '@shared/api';

// In-memory storage for demo purposes
// In production, use a proper database like PostgreSQL, MongoDB, etc.
interface DataStore {
  analyses: Map<string, AnalysisHistory>;
  games: Map<string, ChessGame>;
  stats: UserStats;
}

export class DataService {
  private data: DataStore;

  constructor() {
    this.data = {
      analyses: new Map(),
      games: new Map(),
      stats: {
        totalAnalyses: 0,
        totalGames: 0,
        gamesWon: 0,
        gamesLost: 0,
        gamesDrawn: 0,
        currentRating: 1200,
        favoriteOpenings: ['Italian Game', 'Sicilian Defense', 'Queen\'s Gambit']
      }
    };

    // Add some sample data
    this.initializeSampleData();
  }

  /**
   * Save analysis to history
   */
  async saveAnalysis(
    position: ChessPosition, 
    analysis: ChessAnalysis, 
    source: 'camera' | 'upload' | 'manual'
  ): Promise<AnalysisHistory> {
    const id = this.generateId();
    const historyEntry: AnalysisHistory = {
      id,
      position,
      analysis,
      timestamp: new Date().toISOString(),
      source
    };

    this.data.analyses.set(id, historyEntry);
    this.data.stats.totalAnalyses++;

    return historyEntry;
  }

  /**
   * Get analysis history
   */
  async getAnalysisHistory(limit: number = 10): Promise<AnalysisHistory[]> {
    const analyses = Array.from(this.data.analyses.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return analyses;
  }

  /**
   * Save game
   */
  async saveGame(game: ChessGame): Promise<void> {
    this.data.games.set(game.id, game);
    
    if (game.status !== 'active') {
      this.data.stats.totalGames++;
      
      if (game.result === '1-0' && game.playerColor === 'white') {
        this.data.stats.gamesWon++;
        this.data.stats.currentRating += 20;
      } else if (game.result === '0-1' && game.playerColor === 'black') {
        this.data.stats.gamesWon++;
        this.data.stats.currentRating += 20;
      } else if (game.result === '1/2-1/2') {
        this.data.stats.gamesDrawn++;
        this.data.stats.currentRating += 5;
      } else {
        this.data.stats.gamesLost++;
        this.data.stats.currentRating -= 15;
      }
      
      // Keep rating within reasonable bounds
      this.data.stats.currentRating = Math.max(800, Math.min(2400, this.data.stats.currentRating));
    }
  }

  /**
   * Get game by ID
   */
  async getGame(gameId: string): Promise<ChessGame | null> {
    return this.data.games.get(gameId) || null;
  }

  /**
   * Get game history
   */
  async getGameHistory(limit: number = 10): Promise<GameHistory[]> {
    const games = Array.from(this.data.games.values())
      .filter(game => game.status !== 'active')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);

    return games.map(game => ({
      id: game.id,
      game,
      playerRating: this.data.stats.currentRating,
      ratingChange: this.calculateRatingChange(game)
    }));
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStats> {
    return { ...this.data.stats };
  }

  /**
   * Delete analysis
   */
  async deleteAnalysis(id: string): Promise<boolean> {
    const deleted = this.data.analyses.delete(id);
    if (deleted) {
      this.data.stats.totalAnalyses = Math.max(0, this.data.stats.totalAnalyses - 1);
    }
    return deleted;
  }

  /**
   * Delete game
   */
  async deleteGame(id: string): Promise<boolean> {
    const game = this.data.games.get(id);
    const deleted = this.data.games.delete(id);
    
    if (deleted && game && game.status !== 'active') {
      this.data.stats.totalGames = Math.max(0, this.data.stats.totalGames - 1);
      // Note: This doesn't recalculate rating changes, which would be complex
    }
    
    return deleted;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate rating change for a game
   */
  private calculateRatingChange(game: ChessGame): number {
    if (game.status === 'active') return 0;
    
    switch (game.result) {
      case '1-0':
        return game.playerColor === 'white' ? 20 : -15;
      case '0-1':
        return game.playerColor === 'black' ? 20 : -15;
      case '1/2-1/2':
        return 5;
      default:
        return 0;
    }
  }

  /**
   * Initialize sample data for demo
   */
  private initializeSampleData(): void {
    // Add sample analyses
    const sampleAnalyses = [
      {
        position: {
          fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          turn: 'w' as const
        },
        evaluation: { type: 'cp' as const, value: 120, formatted: '+1.2' },
        bestMove: { from: 'f1', to: 'c4', san: 'Bc4' },
        source: 'camera' as const
      },
      {
        position: {
          fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
          turn: 'w' as const
        },
        evaluation: { type: 'cp' as const, value: -30, formatted: '-0.3' },
        bestMove: { from: 'g1', to: 'f3', san: 'Nf3' },
        source: 'upload' as const
      }
    ];

    sampleAnalyses.forEach((sample, index) => {
      const id = `sample_${index + 1}`;
      const analysis: AnalysisHistory = {
        id,
        position: sample.position,
        analysis: {
          position: sample.position,
          evaluation: sample.evaluation,
          bestMove: sample.bestMove,
          principalVariation: [sample.bestMove.san],
          depth: 15,
          confidence: 90 + Math.random() * 10,
          analysisTime: 1000 + Math.random() * 2000
        },
        timestamp: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        source: sample.source
      };
      
      this.data.analyses.set(id, analysis);
    });

    this.data.stats.totalAnalyses = this.data.analyses.size;
  }
}

export const dataService = new DataService();
