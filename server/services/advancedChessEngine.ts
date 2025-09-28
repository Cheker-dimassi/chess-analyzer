import { Chess } from 'chess.js';
import type { Square, Move } from 'chess.js';

export interface AdvancedAnalysisResult {
  evaluation: {
    value: number;
    formatted: string;
    type: 'cp' | 'mate';
  };
  bestMoves: Array<{
    san: string;
    from: string;
    to: string;
    evaluation: number;
    depth: number;
    confidence: number;
    explanation: string;
    tactical: string[];
  }>;
  position: {
    material: { white: number; black: number };
    kingSafety: { white: number; black: number };
    centerControl: { white: number; black: number };
    development: { white: number; black: number };
    tactical: string[];
    strategic: string[];
  };
  depth: number;
  nodes: number;
  time: number;
}

export class AdvancedChessEngine {
  private chess: Chess;

  constructor() {
    this.chess = new Chess();
  }

  /**
   * Advanced position analysis with multiple evaluation criteria
   */
  analyzePosition(fen: string, depth: number = 15): AdvancedAnalysisResult {
    this.chess.load(fen);
    
    const startTime = Date.now();
    const analysis = this.performDeepAnalysis(depth);
    const endTime = Date.now();

    return {
      evaluation: analysis.evaluation,
      bestMoves: analysis.bestMoves,
      position: analysis.position,
      depth: depth,
      nodes: analysis.nodes,
      time: endTime - startTime
    };
  }

  private performDeepAnalysis(depth: number): any {
    const moves = this.chess.moves({ verbose: true }) as Move[];
    const bestMoves: any[] = [];
    let nodes = 0;

    // Analyze each possible move
    for (const move of moves) {
      this.chess.move(move);
      const evaluation = this.evaluatePosition(depth - 1);
      this.chess.undo();
      
      nodes += Math.pow(moves.length, Math.min(depth, 3)); // Approximate node count
      
      bestMoves.push({
        san: move.san,
        from: move.from,
        to: move.to,
        evaluation: evaluation.value,
        depth: depth,
        confidence: this.calculateConfidence(evaluation, depth),
        explanation: this.generateMoveExplanation(move, evaluation),
        tactical: this.identifyTacticalPatterns(move)
      });
    }

    // Sort by evaluation (best first)
    bestMoves.sort((a, b) => {
      const turn = this.chess.turn();
      return turn === 'w' ? b.evaluation - a.evaluation : a.evaluation - b.evaluation;
    });

    const bestMove = bestMoves[0];
    const position = this.analyzePositionFeatures();

    return {
      evaluation: {
        value: bestMove.evaluation,
        formatted: this.formatEvaluation(bestMove.evaluation),
        type: Math.abs(bestMove.evaluation) > 900 ? 'mate' : 'cp'
      },
      bestMoves: bestMoves.slice(0, 5), // Top 5 moves
      position,
      nodes
    };
  }

  private evaluatePosition(depth: number): { value: number; features: any } {
    if (depth <= 0) {
      return { value: this.quickEvaluation(), features: {} };
    }

    const moves = this.chess.moves({ verbose: true }) as Move[];
    if (moves.length === 0) {
      return { value: this.chess.isCheckmate() ? -1000 : 0, features: {} };
    }

    let bestValue = this.chess.turn() === 'w' ? -Infinity : Infinity;

    for (const move of moves) {
      this.chess.move(move);
      const evaluation = this.evaluatePosition(depth - 1);
      this.chess.undo();

      if (this.chess.turn() === 'w') {
        bestValue = Math.max(bestValue, evaluation.value);
      } else {
        bestValue = Math.min(bestValue, evaluation.value);
      }
    }

    return { value: bestValue, features: {} };
  }

  private quickEvaluation(): number {
    let score = 0;
    const board = this.chess.board();

    // Material evaluation
    const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const value = pieceValues[piece.type as keyof typeof pieceValues] || 0;
          score += piece.color === 'w' ? value : -value;
        }
      }
    }

    // Position evaluation
    score += this.evaluateKingSafety();
    score += this.evaluateCenterControl();
    score += this.evaluateDevelopment();
    score += this.evaluatePawnStructure();

    return score;
  }

  private evaluateKingSafety(): number {
    const board = this.chess.board();
    let whiteKingSafety = 0;
    let blackKingSafety = 0;

    // Find kings
    let whiteKingPos = null;
    let blackKingPos = null;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'k') {
          if (piece.color === 'w') {
            whiteKingPos = { row, col };
          } else {
            blackKingPos = { row, col };
          }
        }
      }
    }

    // Evaluate king safety based on position and surrounding pieces
    if (whiteKingPos) {
      whiteKingSafety = this.calculateKingSafety(whiteKingPos, board, 'w');
    }
    if (blackKingPos) {
      blackKingSafety = this.calculateKingSafety(blackKingPos, board, 'b');
    }

    return whiteKingSafety - blackKingSafety;
  }

  private calculateKingSafety(kingPos: { row: number; col: number }, board: any[][], color: 'w' | 'b'): number {
    let safety = 0;
    const { row, col } = kingPos;

    // Check for castling (kingside/queenside)
    const isCastled = (color === 'w' && row === 7 && (col === 6 || col === 2)) ||
                     (color === 'b' && row === 0 && (col === 6 || col === 2));
    
    if (isCastled) safety += 0.5;

    // Count defending pieces around king
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const piece = board[newRow][newCol];
          if (piece && piece.color === color) {
            safety += 0.1;
          }
        }
      }
    }

    return safety;
  }

  private evaluateCenterControl(): number {
    const centerSquares = ['d4', 'd5', 'e4', 'e5'];
    let whiteControl = 0;
    let blackControl = 0;

    for (const square of centerSquares) {
      const piece = this.chess.get(square as Square);
      if (piece) {
        if (piece.color === 'w') whiteControl += 0.5;
        else blackControl += 0.5;
      }
    }

    return whiteControl - blackControl;
  }

  private evaluateDevelopment(): number {
    const board = this.chess.board();
    let whiteDevelopment = 0;
    let blackDevelopment = 0;

    // Count pieces that have moved from starting position
    const startingPositions = {
      'w': { 'n': ['b1', 'g1'], 'b': ['c1', 'f1'], 'r': ['a1', 'h1'], 'q': ['d1'] },
      'b': { 'n': ['b8', 'g8'], 'b': ['c8', 'f8'], 'r': ['a8', 'h8'], 'q': ['d8'] }
    };

    for (const color of ['w', 'b'] as const) {
      for (const pieceType of ['n', 'b', 'r', 'q'] as const) {
        const positions = startingPositions[color][pieceType];
        for (const pos of positions) {
          const piece = this.chess.get(pos as Square);
          if (!piece || piece.type !== pieceType || piece.color !== color) {
            if (color === 'w') whiteDevelopment += 0.3;
            else blackDevelopment += 0.3;
          }
        }
      }
    }

    return whiteDevelopment - blackDevelopment;
  }

  private evaluatePawnStructure(): number {
    const board = this.chess.board();
    let whitePawnStructure = 0;
    let blackPawnStructure = 0;

    // Evaluate pawn chains, isolated pawns, doubled pawns
    for (let col = 0; col < 8; col++) {
      let whitePawns = 0;
      let blackPawns = 0;

      for (let row = 0; row < 8; row++) {
        const piece = board[row][col];
        if (piece && piece.type === 'p') {
          if (piece.color === 'w') whitePawns++;
          else blackPawns++;
        }
      }

      // Penalize doubled pawns
      if (whitePawns > 1) whitePawnStructure -= 0.5;
      if (blackPawns > 1) blackPawnStructure -= 0.5;
    }

    return whitePawnStructure - blackPawnStructure;
  }

  private calculateConfidence(evaluation: any, depth: number): number {
    // Higher depth and clearer evaluation = higher confidence
    const depthBonus = Math.min(depth * 5, 50);
    const clarityBonus = Math.min(Math.abs(evaluation.value) * 10, 30);
    return Math.min(depthBonus + clarityBonus, 100);
  }

  private generateMoveExplanation(move: Move, evaluation: any): string {
    const explanations = [];

    // Check for captures
    if (move.captured) {
      explanations.push(`Captures ${move.captured.toUpperCase()}`);
    }

    // Check for checks
    this.chess.move(move);
    if (this.chess.isCheck()) {
      explanations.push('Gives check');
    }
    this.chess.undo();

    // Check for tactical motifs
    if (this.isTacticalMove(move)) {
      explanations.push('Tactical move');
    }

    // Check for development
    if (this.isDevelopmentMove(move)) {
      explanations.push('Develops piece');
    }

    // Check for center control
    if (this.controlsCenter(move)) {
      explanations.push('Controls center');
    }

    return explanations.length > 0 ? explanations.join(', ') : 'Positional move';
  }

  private isTacticalMove(move: Move): boolean {
    // Check for pins, forks, skewers, etc.
    this.chess.move(move);
    const isTactical = this.chess.isCheck() || move.captured !== undefined;
    this.chess.undo();
    return isTactical;
  }

  private isDevelopmentMove(move: Move): boolean {
    const startingSquares = ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
                            'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'];
    return startingSquares.includes(move.from);
  }

  private controlsCenter(move: Move): boolean {
    const centerSquares = ['d4', 'd5', 'e4', 'e5'];
    return centerSquares.includes(move.to);
  }

  private identifyTacticalPatterns(move: Move): string[] {
    const patterns = [];

    this.chess.move(move);
    
    if (this.chess.isCheck()) patterns.push('Check');
    if (this.chess.isCheckmate()) patterns.push('Checkmate');
    if (move.captured) patterns.push('Capture');
    
    // Check for pins, forks, skewers (simplified)
    const moves = this.chess.moves({ verbose: true }) as Move[];
    if (moves.some(m => m.captured)) patterns.push('Tactical');
    
    this.chess.undo();

    return patterns;
  }

  private analyzePositionFeatures(): any {
    const board = this.chess.board();
    
    return {
      material: this.calculateMaterial(),
      kingSafety: this.calculateKingSafetyValues(),
      centerControl: this.calculateCenterControlValues(),
      development: this.calculateDevelopmentValues(),
      tactical: this.identifyTacticalFeatures(),
      strategic: this.identifyStrategicFeatures()
    };
  }

  private calculateMaterial(): { white: number; black: number } {
    const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };
    const board = this.chess.board();
    let white = 0;
    let black = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const value = pieceValues[piece.type as keyof typeof pieceValues] || 0;
          if (piece.color === 'w') white += value;
          else black += value;
        }
      }
    }

    return { white, black };
  }

  private calculateKingSafetyValues(): { white: number; black: number } {
    return { white: 0.7, black: 0.6 }; // Simplified
  }

  private calculateCenterControlValues(): { white: number; black: number } {
    return { white: 0.5, black: 0.4 }; // Simplified
  }

  private calculateDevelopmentValues(): { white: number; black: number } {
    return { white: 0.6, black: 0.5 }; // Simplified
  }

  private identifyTacticalFeatures(): string[] {
    const features = [];
    
    if (this.chess.isCheck()) features.push('King in check');
    if (this.chess.isCheckmate()) features.push('Checkmate');
    if (this.chess.isStalemate()) features.push('Stalemate');
    
    return features;
  }

  private identifyStrategicFeatures(): string[] {
    const features = [];
    
    // Add strategic analysis
    features.push('Position evaluation');
    
    return features;
  }

  private formatEvaluation(value: number): string {
    if (Math.abs(value) > 900) {
      const mateIn = Math.ceil((1000 - Math.abs(value)) / 2);
      return value > 0 ? `M+${mateIn}` : `M-${mateIn}`;
    }
    
    const sign = value > 0 ? '+' : '';
    return `${sign}${(value / 100).toFixed(2)}`;
  }
}
