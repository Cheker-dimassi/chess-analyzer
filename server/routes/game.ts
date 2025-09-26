import { RequestHandler } from 'express';
import { 
  CreateGameRequest, 
  CreateGameResponse, 
  MakeMoveRequest, 
  MakeMoveResponse,
  ChessGame,
  ChessMove,
  GameSettings
} from '@shared/api';
import { enhancedChessEngine } from '../services/stockfishEngine';
import { chessEngine } from '../services/chessEngine';
import { dataService } from '../services/dataService';

/**
 * Create a new chess game
 */
export const createGame: RequestHandler = async (req, res) => {
  try {
    const { settings }: CreateGameRequest = req.body;

    if (!settings) {
      return res.status(400).json({
        success: false,
        error: 'Game settings are required'
      } as CreateGameResponse);
    }

    // Validate settings
    const validationError = validateGameSettings(settings);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError
      } as CreateGameResponse);
    }

    // Determine player color
    let playerColor: 'white' | 'black';
    if (settings.color === 'random') {
      playerColor = Math.random() < 0.5 ? 'white' : 'black';
    } else {
      playerColor = settings.color;
    }

    // Create new game
    const gameId = generateGameId();
    const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    const game: ChessGame = {
      id: gameId,
      playerColor,
      currentPosition: {
        fen: startingFen,
        turn: 'w'
      },
      moves: [],
      status: 'active',
      settings,
      startTime: new Date().toISOString()
    };

    // If bot plays white, make the first move
    if (playerColor === 'black') {
      const botMove = await enhancedChessEngine.getStockfishMove(startingFen, settings.difficulty);
      if (botMove) {
        const moveEntry: ChessMove = {
          from: botMove.from,
          to: botMove.to,
          san: botMove.san,
          fen: botMove.fen,
          timestamp: new Date().toISOString(),
          isPlayerMove: false
        };
        
        game.moves.push(moveEntry);
        game.currentPosition = {
          fen: botMove.fen,
          turn: 'b'
        };
      }
    }

    // Save game
    await dataService.saveGame(game);

    res.json({
      success: true,
      game
    } as CreateGameResponse);

  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create game'
    } as CreateGameResponse);
  }
};

/**
 * Make a move in an existing game
 */
export const makeMove: RequestHandler = async (req, res) => {
  try {
    const { gameId, move }: MakeMoveRequest = req.body;

    if (!gameId || !move) {
      return res.status(400).json({
        success: false,
        error: 'Game ID and move are required'
      } as MakeMoveResponse);
    }

    // Get game
    const game = await dataService.getGame(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      } as MakeMoveResponse);
    }

    if (game.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Game is not active'
      } as MakeMoveResponse);
    }

    // Validate move
    if (!enhancedChessEngine.isLegalMove(game.currentPosition.fen, move)) {
      return res.status(400).json({
        success: false,
        error: 'Illegal move'
      } as MakeMoveResponse);
    }

    // Make player move
    const moveResult = enhancedChessEngine.makeMove(game.currentPosition.fen, move);
    if (!moveResult) {
      return res.status(400).json({
        success: false,
        error: 'Failed to make move'
      } as MakeMoveResponse);
    }

    // Add player move to game
    const playerMoveEntry: ChessMove = {
      from: moveResult.move.from,
      to: moveResult.move.to,
      san: moveResult.move.san,
      fen: moveResult.fen,
      timestamp: new Date().toISOString(),
      isPlayerMove: true
    };

    game.moves.push(playerMoveEntry);
    game.currentPosition = {
      fen: moveResult.fen,
      turn: moveResult.fen.split(' ')[1] as 'w' | 'b'
    };

    // Check if game is over
    if (moveResult.isGameOver) {
      game.status = moveResult.isCheckmate ? 'checkmate' : 
                    moveResult.isStalemate ? 'stalemate' : 'draw';
      game.endTime = new Date().toISOString();
      game.result = chessEngine.getGameStatus(moveResult.fen) as any;
      
      await dataService.saveGame(game);
      
      return res.json({
        success: true,
        game
      } as MakeMoveResponse);
    }

    // Make bot move if game is still active
    let botMoveEntry: ChessMove | undefined;
    const botMove = await enhancedChessEngine.getStockfishMove(moveResult.fen, game.settings.difficulty);
    
    if (botMove) {
      botMoveEntry = {
        from: botMove.from,
        to: botMove.to,
        san: botMove.san,
        fen: botMove.fen,
        timestamp: new Date().toISOString(),
        isPlayerMove: false
      };

      game.moves.push(botMoveEntry);
      game.currentPosition = {
        fen: botMove.fen,
        turn: botMove.fen.split(' ')[1] as 'w' | 'b'
      };

      // Check if game is over after bot move
      const gameStatus = enhancedChessEngine.getGameStatus(botMove.fen);
      if (gameStatus !== 'active') {
        game.status = gameStatus.includes('1/2') ? 'draw' : 'checkmate';
        game.endTime = new Date().toISOString();
        game.result = gameStatus as any;
      }
    }

    // Save updated game
    await dataService.saveGame(game);

    res.json({
      success: true,
      game,
      botMove: botMoveEntry
    } as MakeMoveResponse);

  } catch (error) {
    console.error('Make move error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to make move'
    } as MakeMoveResponse);
  }
};

/**
 * Get game by ID
 */
export const getGame: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await dataService.getGame(gameId);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }
    
    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve game'
    });
  }
};

/**
 * Resign game
 */
export const resignGame: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await dataService.getGame(gameId);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    if (game.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Game is not active'
      });
    }

    // Update game status
    game.status = 'resignation';
    game.endTime = new Date().toISOString();
    game.result = game.playerColor === 'white' ? '0-1' : '1-0';

    await dataService.saveGame(game);
    
    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('Resign game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resign game'
    });
  }
};

/**
 * Get game history
 */
export const getGameHistory: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const games = await dataService.getGameHistory(Math.min(limit, 50));
    
    res.json({
      success: true,
      games
    });
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve game history'
    });
  }
};

/**
 * Validate game settings
 */
function validateGameSettings(settings: GameSettings): string | null {
  if (!settings.timeControl || !settings.difficulty || !settings.color) {
    return 'Missing required settings';
  }

  if (!['beginner', 'intermediate', 'advanced', 'stockfish'].includes(settings.difficulty)) {
    return 'Invalid difficulty level';
  }

  if (!['white', 'black', 'random'].includes(settings.color)) {
    return 'Invalid color choice';
  }

  if (settings.timeControl.initial < 60 || settings.timeControl.initial > 3600) {
    return 'Initial time must be between 1 and 60 minutes';
  }

  if (settings.timeControl.increment < 0 || settings.timeControl.increment > 60) {
    return 'Increment must be between 0 and 60 seconds';
  }

  return null;
}

/**
 * Generate unique game ID
 */
function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
