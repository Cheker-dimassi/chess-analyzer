/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Chess Analysis Types
 */
export interface ChessPosition {
  fen: string;
  pgn?: string;
  turn: 'w' | 'b';
}

export interface ChessAnalysis {
  position: ChessPosition;
  evaluation: {
    type: 'cp' | 'mate';
    value: number;
    formatted: string; // e.g., "+1.2", "M5", "-0.8"
  };
  bestMove: {
    from: string;
    to: string;
    san: string; // Standard Algebraic Notation
    promotion?: string;
  };
  principalVariation: string[];
  depth: number;
  confidence: number; // 0-100
  analysisTime: number; // milliseconds
}

export interface ImageAnalysisRequest {
  imageData: string; // base64 encoded image
  options?: {
    timeout?: number;
    confidence?: number;
  };
}

export interface ImageAnalysisResponse {
  success: boolean;
  analysis?: ChessAnalysis;
  recognizedPosition?: ChessPosition;
  error?: string;
  confidence?: number;
}

export interface PositionAnalysisRequest {
  fen: string;
  depth?: number;
  timeout?: number;
}

export interface PositionAnalysisResponse {
  success: boolean;
  analysis?: ChessAnalysis;
  error?: string;
}

/**
 * Chess Game Types
 */
export interface GameSettings {
  timeControl: {
    initial: number; // seconds
    increment: number; // seconds
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'stockfish';
  color: 'white' | 'black' | 'random';
}

export interface ChessGame {
  id: string;
  playerColor: 'white' | 'black';
  currentPosition: ChessPosition;
  moves: ChessMove[];
  status: 'active' | 'checkmate' | 'stalemate' | 'draw' | 'resignation';
  settings: GameSettings;
  startTime: string;
  endTime?: string;
  result?: '1-0' | '0-1' | '1/2-1/2';
}

export interface ChessMove {
  from: string;
  to: string;
  san: string;
  fen: string;
  timestamp: string;
  timeLeft?: number;
  isPlayerMove: boolean;
}

export interface CreateGameRequest {
  settings: GameSettings;
}

export interface CreateGameResponse {
  success: boolean;
  game?: ChessGame;
  error?: string;
}

export interface MakeMoveRequest {
  gameId: string;
  move: {
    from: string;
    to: string;
    promotion?: string;
  };
}

export interface MakeMoveResponse {
  success: boolean;
  game?: ChessGame;
  botMove?: ChessMove;
  error?: string;
}

/**
 * User Data Types
 */
export interface AnalysisHistory {
  id: string;
  position: ChessPosition;
  analysis: ChessAnalysis;
  timestamp: string;
  source: 'camera' | 'upload' | 'manual';
}

export interface GameHistory {
  id: string;
  game: ChessGame;
  playerRating?: number;
  ratingChange?: number;
}

export interface UserStats {
  totalAnalyses: number;
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  currentRating: number;
  favoriteOpenings: string[];
}

export interface GetHistoryResponse {
  success: boolean;
  analyses?: AnalysisHistory[];
  games?: GameHistory[];
  stats?: UserStats;
  error?: string;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}
