import { Chess } from 'chess.js';
import { ChessAnalysis, ChessPosition } from '@shared/api';

// Simple in-memory Stockfish alternative for demo purposes
// In production, you'd use actual Stockfish engine
export class ChessEngineService {
  private chess: Chess;

  constructor() {
    this.chess = new Chess();
  }

  /**
   * Analyze a chess position
   */
  async analyzePosition(fen: string, depth: number = 15, timeout: number = 5000): Promise<ChessAnalysis> {
    try {
      // Load the position
      this.chess.load(fen);
      
      // Validate the position
      if (!this.chess.isGameOver()) {
        // Get all legal moves
        const moves = this.chess.moves({ verbose: true });
        
        if (moves.length === 0) {
          throw new Error('No legal moves available');
        }

        // Simple evaluation for demo (in production, use actual Stockfish)
        const evaluation = this.evaluatePosition();
        const bestMove = this.getBestMove(moves);
        
        const analysis: ChessAnalysis = {
          position: {
            fen,
            turn: this.chess.turn(),
            pgn: this.chess.pgn()
          },
          evaluation: {
            type: 'cp',
            value: evaluation,
            formatted: evaluation > 0 ? `+${(evaluation / 100).toFixed(1)}` : (evaluation / 100).toFixed(1)
          },
          bestMove: {
            from: bestMove.from,
            to: bestMove.to,
            san: bestMove.san,
            promotion: bestMove.promotion
          },
          principalVariation: [bestMove.san],
          depth,
          confidence: Math.min(95, 70 + Math.random() * 25), // Simulated confidence
          analysisTime: Math.random() * 1000 + 500 // Simulated analysis time
        };

        return analysis;
      } else {
        // Game is over
        const evaluation = this.chess.isCheckmate() ? 
          (this.chess.turn() === 'w' ? -30000 : 30000) : 0;
        
        return {
          position: {
            fen,
            turn: this.chess.turn(),
            pgn: this.chess.pgn()
          },
          evaluation: {
            type: this.chess.isCheckmate() ? 'mate' : 'cp',
            value: evaluation,
            formatted: this.chess.isCheckmate() ? 
              (this.chess.turn() === 'w' ? 'M-1' : 'M1') : '0.0'
          },
          bestMove: {
            from: '',
            to: '',
            san: 'Game Over'
          },
          principalVariation: [],
          depth,
          confidence: 100,
          analysisTime: 100
        };
      }
    } catch (error) {
      throw new Error(`Failed to analyze position: ${error.message}`);
    }
  }

  /**
   * Get the best move for the current position (simplified for demo)
   */
  private getBestMove(moves: any[]) {
    // Simple move selection for demo
    // Prioritize captures, then center control
    const captures = moves.filter(move => move.captured);
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    const centerMoves = moves.filter(move => 
      ['e4', 'e5', 'd4', 'd5', 'Nf3', 'Nc3', 'Nf6', 'Nc6'].includes(move.san)
    );
    if (centerMoves.length > 0) {
      return centerMoves[Math.floor(Math.random() * centerMoves.length)];
    }

    return moves[Math.floor(Math.random() * moves.length)];
  }

  /**
   * Simple position evaluation (simplified for demo)
   */
  private evaluatePosition(): number {
    const pieceValues = {
      p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
      P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0
    };

    let evaluation = 0;
    const board = this.chess.board();
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          evaluation += piece.color === 'w' ? value : -value;
        }
      }
    }

    // Add positional factors (simplified)
    evaluation += this.chess.moves().length * 0.1; // Mobility
    evaluation += Math.random() * 100 - 50; // Random factor for demo

    return Math.round(evaluation * 100); // Convert to centipawns
  }

  /**
   * Make a move for the bot
   */
  async makeBotMove(fen: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<any> {
    this.chess.load(fen);
    const moves = this.chess.moves({ verbose: true });
    
    if (moves.length === 0) {
      return null;
    }

    let selectedMove;
    
    switch (difficulty) {
      case 'beginner':
        // Random move with occasional blunders
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
        break;
        
      case 'intermediate':
        // Better move selection
        selectedMove = this.getBestMove(moves);
        break;
        
      case 'advanced':
        // Analyze and pick the best move
        const analysis = await this.analyzePosition(fen);
        const bestMoveNotation = analysis.bestMove.san;
        selectedMove = moves.find(move => move.san === bestMoveNotation) || this.getBestMove(moves);
        break;
        
      default:
        selectedMove = this.getBestMove(moves);
    }

    const move = this.chess.move(selectedMove);
    return {
      from: move.from,
      to: move.to,
      san: move.san,
      fen: this.chess.fen(),
      promotion: move.promotion
    };
  }

  /**
   * Validate if a move is legal
   */
  isLegalMove(fen: string, move: { from: string; to: string; promotion?: string }): boolean {
    try {
      this.chess.load(fen);
      const result = this.chess.move(move);
      return result !== null;
    } catch {
      return false;
    }
  }

  /**
   * Make a move and return the new position
   */
  makeMove(fen: string, move: { from: string; to: string; promotion?: string }): any {
    this.chess.load(fen);
    const result = this.chess.move(move);
    if (result) {
      return {
        move: result,
        fen: this.chess.fen(),
        isGameOver: this.chess.isGameOver(),
        isCheck: this.chess.isCheck(),
        isCheckmate: this.chess.isCheckmate(),
        isStalemate: this.chess.isStalemate(),
        isDraw: this.chess.isDraw()
      };
    }
    return null;
  }

  /**
   * Get game status
   */
  getGameStatus(fen: string): string {
    this.chess.load(fen);
    
    if (this.chess.isCheckmate()) {
      return this.chess.turn() === 'w' ? '0-1' : '1-0';
    }
    if (this.chess.isStalemate() || this.chess.isDraw()) {
      return '1/2-1/2';
    }
    return 'active';
  }
}

export const chessEngine = new ChessEngineService();
