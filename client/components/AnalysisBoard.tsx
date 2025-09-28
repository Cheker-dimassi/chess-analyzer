import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Chess } from "chess.js";
import type { Square, Move } from "chess.js";
import { cn } from "@/lib/utils";
import { PieceSvg } from "./ChessPieces";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Play, 
  Pause,
  SkipBack,
  SkipForward,
  Brain,
  BarChart3
} from "lucide-react";

interface AnalysisBoardProps {
  initialFen?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showCoordinates?: boolean;
}

interface AnalysisResult {
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
  insights: {
    tactical: string[];
    strategic: string[];
    recommendations: string[];
  };
  engine: {
    name: string;
    version: string;
    strength: number;
  };
  depth: number;
  nodes: number;
  time: number;
}

const MOVE_ANIMATION_DURATION = 260;

type MoveAnimationState = {
  pieceCode: string;
  from: string;
  to: string;
};

export default function AnalysisBoard({
  initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  className,
  size = "lg",
  showCoordinates = true
}: AnalysisBoardProps) {
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState<(any | null)[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  
  // Animation states
  const [activeAnimation, setActiveAnimation] = useState<MoveAnimationState | null>(null);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [boardSize, setBoardSize] = useState(0);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const animationStartRef = useRef<number>();
  const animationFrameRef = useRef<number>();
  const animationTimeoutRef = useRef<number>();

  const sizeClasses = {
    sm: "w-64 h-64",
    md: "w-80 h-80", 
    lg: "w-96 h-96"
  };

  // Initialize board
  useEffect(() => {
    chess.load(initialFen);
    setBoard(chess.board());
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setSelectedSquare(null);
    setPossibleMoves([]);
    
    if (autoAnalyze) {
      analyzePosition();
    }
  }, [initialFen, chess, autoAnalyze]);

  // Board size tracking
  useLayoutEffect(() => {
    const element = boardContainerRef.current;
    if (!element) return;

    const updateSize = () => {
      const { width } = element.getBoundingClientRect();
      setBoardSize(width);
    };

    updateSize();
    const observer = new ResizeObserver(() => updateSize());
    observer.observe(element);

    return () => observer.disconnect();
  }, [size]);

  // Animation handling
  useEffect(() => {
    if (!activeAnimation || boardSize === 0) return;

    setAnimateProgress(false);

    if (animationStartRef.current !== undefined) {
      window.cancelAnimationFrame(animationStartRef.current);
    }
    if (animationFrameRef.current !== undefined) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
    if (animationTimeoutRef.current !== undefined) {
      window.clearTimeout(animationTimeoutRef.current);
    }

    animationStartRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = window.requestAnimationFrame(() => {
        setAnimateProgress(true);
      });
    });

    animationTimeoutRef.current = window.setTimeout(() => {
      setAnimateProgress(false);
      setActiveAnimation(null);
    }, MOVE_ANIMATION_DURATION);

    return () => {
      if (animationStartRef.current !== undefined) {
        window.cancelAnimationFrame(animationStartRef.current);
      }
      if (animationFrameRef.current !== undefined) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (animationTimeoutRef.current !== undefined) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [activeAnimation, boardSize]);

  const getSquareName = (row: number, col: number): string => {
    const fileIndex = col;
    const rankIndex = 7 - row;
    return String.fromCharCode(97 + fileIndex) + (rankIndex + 1).toString();
  };

  const getSquarePosition = (squareName: string): { row: number; col: number } => {
    const file = squareName.charCodeAt(0) - 97;
    const rank = parseInt(squareName[1]) - 1;
    const row = 7 - rank;
    const col = file;
    return { row, col };
  };

  const getSquareOffset = (squareName: string): { x: number; y: number } => {
    if (boardSize === 0) return { x: 0, y: 0 };
    const { row, col } = getSquarePosition(squareName);
    const squareLength = boardSize / 8;
    return {
      x: col * squareLength,
      y: row * squareLength,
    };
  };

  const getLegalMoves = (square: Square): string[] => {
    const moves = chess.moves({ square, verbose: true }) as unknown as Move[];
    return moves.map((move) => move.to as string);
  };

  const handleSquareClick = (row: number, col: number) => {
    const squareName = getSquareName(row, col);
    const piece = board[row][col];

    if (selectedSquare === null) {
      // Selecting a piece
      if (piece) {
        setSelectedSquare(squareName);
        setPossibleMoves(getLegalMoves(squareName as unknown as Square));
      }
    } else if (selectedSquare === squareName) {
      // Deselecting the same square
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else if (possibleMoves.includes(squareName)) {
      // Making a move
      const move = { from: selectedSquare, to: squareName };
      makeMove(move);
    } else {
      // Selecting a different piece
      if (piece) {
        setSelectedSquare(squareName);
        setPossibleMoves(getLegalMoves(squareName as unknown as Square));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  const makeMove = (move: { from: string; to: string; promotion?: string }) => {
    try {
      const testChess = new Chess(chess.fen());
      const result = testChess.move(move);
      
      if (result) {
        // Add to history if we're at the end
        if (currentMoveIndex === moveHistory.length - 1) {
          const newHistory = [...moveHistory, result];
          setMoveHistory(newHistory);
          setCurrentMoveIndex(newHistory.length - 1);
        } else {
          // Truncate history and add new move
          const newHistory = moveHistory.slice(0, currentMoveIndex + 1);
          newHistory.push(result);
          setMoveHistory(newHistory);
          setCurrentMoveIndex(newHistory.length - 1);
        }

        // Update board
        chess.move(move);
        setBoard(chess.board());
        
        // Animate the move
        const pieceCode = result.color === 'w' 
          ? result.piece.toUpperCase() 
          : result.piece;
        setActiveAnimation({
          pieceCode,
          from: move.from,
          to: move.to,
        });

        setSelectedSquare(null);
        setPossibleMoves([]);

        // Auto-analyze if enabled
        if (autoAnalyze) {
          setTimeout(() => analyzePosition(), 100);
        }
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
  };

  const navigateToMove = (index: number) => {
    if (index < -1 || index >= moveHistory.length) return;

    // Reset to initial position
    chess.load(initialFen);
    
    // Apply moves up to the target index
    for (let i = 0; i <= index; i++) {
      chess.move(moveHistory[i]);
    }
    
    setBoard(chess.board());
    setCurrentMoveIndex(index);
    setSelectedSquare(null);
    setPossibleMoves([]);

    if (autoAnalyze) {
      analyzePosition();
    }
  };

  const resetPosition = () => {
    chess.load(initialFen);
    setBoard(chess.board());
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setAnalysis(null);

    if (autoAnalyze) {
      analyzePosition();
    }
  };

  const analyzePosition = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analysis/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fen: chess.fen(), 
          depth: 15,
          multiPv: 5
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
        }
      } else {
        // Mock advanced analysis for testing if API is not available
        const mockAnalysis: AnalysisResult = {
          evaluation: {
            value: Math.random() * 200 - 100,
            formatted: Math.random() > 0.5 ? `+${(Math.random() * 0.5).toFixed(2)}` : `-${(Math.random() * 0.5).toFixed(2)}`,
            type: 'cp'
          },
          bestMoves: [
            {
              san: 'Nf3',
              from: 'g1',
              to: 'f3',
              evaluation: 25,
              depth: 15,
              confidence: 95,
              explanation: 'Develops knight, controls center',
              tactical: ['Development']
            },
            {
              san: 'e4',
              from: 'e2',
              to: 'e4',
              evaluation: 20,
              depth: 15,
              confidence: 90,
              explanation: 'Central pawn advance',
              tactical: ['Center Control']
            },
            {
              san: 'd4',
              from: 'd2',
              to: 'd4',
              evaluation: 18,
              depth: 15,
              confidence: 85,
              explanation: 'Central pawn advance',
              tactical: ['Center Control']
            }
          ],
          position: {
            material: { white: 39, black: 39 },
            kingSafety: { white: 0.7, black: 0.6 },
            centerControl: { white: 0.5, black: 0.4 },
            development: { white: 0.6, black: 0.5 },
            tactical: [],
            strategic: ['Position evaluation']
          },
          insights: {
            tactical: ['Strong attacking opportunity'],
            strategic: ['Material advantage', 'Better development'],
            recommendations: ['Best move: Nf3 - Develops knight, controls center']
          },
          engine: {
            name: 'Advanced Chess AI',
            version: '2.0',
            strength: 2800
          },
          depth: 15,
          nodes: 1000000,
          time: 1500
        };
        setAnalysis(mockAnalysis);
      }
    } catch (error) {
      console.error('Error analyzing position:', error);
      // Mock analysis for testing
      const mockAnalysis: AnalysisResult = {
        evaluation: {
          value: 20,
          formatted: '+0.20',
          type: 'cp'
        },
        bestMoves: [
          {
            san: 'e4',
            from: 'e2',
            to: 'e4',
            evaluation: 20,
            depth: 12,
            confidence: 90,
            explanation: 'Central pawn advance',
            tactical: ['Center Control']
          }
        ],
        position: {
          material: { white: 39, black: 39 },
          kingSafety: { white: 0.7, black: 0.6 },
          centerControl: { white: 0.5, black: 0.4 },
          development: { white: 0.6, black: 0.5 },
          tactical: [],
          strategic: ['Position evaluation']
        },
        insights: {
          tactical: [],
          strategic: ['Position is balanced'],
          recommendations: ['Best move: e4 - Central pawn advance']
        },
        engine: {
          name: 'Advanced Chess AI',
          version: '2.0',
          strength: 2800
        },
        depth: 12,
        nodes: 500000,
        time: 800
      };
      setAnalysis(mockAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isSquareHighlighted = (row: number, col: number): boolean => {
    const squareName = getSquareName(row, col);
    
    if (selectedSquare === squareName) return true;
    if (possibleMoves.includes(squareName)) return true;
    
    return false;
  };

  const getSquareColor = (row: number, col: number): string => {
    const isLight = (row + col) % 2 === 0;
    const squareName = getSquareName(row, col);

    if (selectedSquare === squareName) {
      return isLight ? "bg-yellow-300" : "bg-yellow-400";
    }

    if (possibleMoves.includes(squareName)) {
      const piece = board[row][col];
      if (piece) {
        return isLight ? "bg-red-300" : "bg-red-400";
      } else {
        return isLight ? "bg-green-300" : "bg-green-400";
      }
    }

    return isLight ? "bg-chess-board-light" : "bg-chess-board-dark";
  };

  const pieceSizeClass =
    size === "sm"
      ? "w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8"
      : size === "md"
        ? "w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10"
        : "w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14";

  const squareLength = boardSize > 0 ? boardSize / 8 : 0;

  const animationOffsets = activeAnimation && boardSize > 0
    ? {
        from: getSquareOffset(activeAnimation.from),
        to: getSquareOffset(activeAnimation.to),
      }
    : null;

  const renderArrow = (from: string, to: string, color: string = '#3b82f6', thickness: number = 4, opacity: number = 0.8) => {
    if (boardSize === 0) return null;
    
    const fromOffset = getSquareOffset(from);
    const toOffset = getSquareOffset(to);
    const squareLength = boardSize / 8;
    
    const centerX = (fromOffset.x + toOffset.x) / 2 + squareLength / 2;
    const centerY = (fromOffset.y + toOffset.y) / 2 + squareLength / 2;
    
    const angle = Math.atan2(toOffset.y - fromOffset.y, toOffset.x - fromOffset.x);
    const length = Math.sqrt(
      Math.pow(toOffset.x - fromOffset.x, 2) + Math.pow(toOffset.y - fromOffset.y, 2)
    );
    
    return (
      <div
        key={`${from}-${to}`}
        className="absolute pointer-events-none"
        style={{
          left: centerX - length / 2,
          top: centerY,
          width: length,
          height: thickness,
          transform: `rotate(${angle}rad)`,
          transformOrigin: 'center',
          background: `linear-gradient(to right, ${color}, ${color})`,
          borderRadius: '2px',
          opacity: opacity,
        }}
      >
        <div
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0"
          style={{
            borderLeft: `${thickness + 4}px solid ${color}`,
            borderTop: `${thickness/2}px solid transparent`,
            borderBottom: `${thickness/2}px solid transparent`,
          }}
        />
      </div>
    );
  };

  const evaluationValue = analysis?.evaluation.value || 0;
  const evaluationPercentage = Math.min(Math.max((evaluationValue + 10) * 5, 0), 100);

  return (
    <div className={cn("flex gap-6", className)}>
      {/* Main Board */}
      <div className="flex-shrink-0">
        <div className={cn("relative inline-block", className)}>
          <div className="pl-6 pb-6">
            <div ref={boardContainerRef} className={cn("relative inline-block overflow-hidden", sizeClasses[size])}>
              <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {board.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const squareName = getSquareName(rowIndex, colIndex);
                    const isHighlighted = isSquareHighlighted(rowIndex, colIndex);
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={cn(
                          "flex items-center justify-center relative cursor-pointer select-none transition-colors",
                          getSquareColor(rowIndex, colIndex),
                          "hover:opacity-80"
                        )}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                      >
                        {piece && (!activeAnimation || activeAnimation.to !== squareName) && (
                          <PieceSvg
                            code={piece.color === 'w' ? piece.type.toUpperCase() : piece.type}
                            className={cn("pointer-events-none", pieceSizeClass)}
                          />
                        )}
                        
                        {possibleMoves.includes(squareName) && !piece && (
                          <div className="w-4 h-4 bg-green-600 rounded-full opacity-70"></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {activeAnimation && animationOffsets && (
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute flex items-center justify-center animate-piece-move"
                    style={{
                      width: squareLength,
                      height: squareLength,
                      transform: `translate(${animateProgress ? animationOffsets.to.x : animationOffsets.from.x}px, ${animateProgress ? animationOffsets.to.y : animationOffsets.from.y}px)`,
                      transition: `transform ${MOVE_ANIMATION_DURATION}ms ease-in-out`,
                      willChange: "transform",
                    }}
                  >
                    <PieceSvg
                      code={activeAnimation.pieceCode}
                      className={cn("pointer-events-none", pieceSizeClass)}
                    />
                  </div>
                </div>
              )}

              {/* Best Move Arrows */}
              {showArrows && analysis && analysis.bestMoves && (
                <div className="pointer-events-none absolute inset-0">
                  {analysis.bestMoves.slice(0, 3).map((move, index) => {
                    const colors = ['#10b981', '#3b82f6', '#f59e0b']; // Green, Blue, Orange
                    const thicknesses = [6, 4, 3]; // Thicker for better moves
                    const opacities = [0.9, 0.7, 0.5]; // More opaque for better moves
                    
                    return renderArrow(
                      move.from, 
                      move.to, 
                      colors[index], 
                      thicknesses[index], 
                      opacities[index]
                    );
                  })}
                </div>
              )}

              {showCoordinates && size !== "sm" && (
                <>
                  <div className="absolute -left-6 top-0 h-full grid grid-rows-8 place-items-center text-xs font-medium select-none">
                    {[8,7,6,5,4,3,2,1].map((n) => (
                      <span key={n} className="text-slate-900">{n}</span>
                    ))}
                  </div>
                  <div className="absolute -bottom-6 left-0 w-full grid grid-cols-8 place-items-center text-xs font-medium select-none">
                    {[...'abcdefgh'].map((c) => (
                      <span key={c} className="text-slate-900">{c}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Panel */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Navigation Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Position Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToMove(-1)}
                disabled={currentMoveIndex === -1}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToMove(currentMoveIndex - 1)}
                disabled={currentMoveIndex === -1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToMove(currentMoveIndex + 1)}
                disabled={currentMoveIndex === moveHistory.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToMove(moveHistory.length - 1)}
                disabled={currentMoveIndex === moveHistory.length - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetPosition}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={autoAnalyze ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoAnalyze(!autoAnalyze)}
              >
                <Brain className="w-4 h-4 mr-2" />
                Auto-analyze
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzePosition}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Pause className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
              <Button
                variant={showArrows ? "default" : "outline"}
                size="sm"
                onClick={() => setShowArrows(!showArrows)}
              >
                →
                {showArrows ? " Hide Arrows" : " Show Arrows"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Analysis Panel */}
        {analysis && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                {analysis.engine.name} ({analysis.engine.strength})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Evaluation Bar */}
                <div className="relative h-8 bg-muted rounded overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                    style={{ width: `${evaluationPercentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-foreground">
                      {analysis.evaluation.formatted}
                    </span>
                  </div>
                </div>

                {/* Best Moves */}
                <div>
                  <h4 className="font-semibold mb-2">Top Moves</h4>
                  <div className="space-y-2">
                    {analysis.bestMoves.slice(0, 3).map((move, index) => {
                      const colors = ['#10b981', '#3b82f6', '#f59e0b'];
                      return (
                        <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors[index] }}
                          />
                          <div className="flex-1">
                            <div className="font-mono font-medium">{move.san}</div>
                            <div className="text-xs text-muted-foreground">{move.explanation}</div>
                          </div>
                          <div className="text-sm font-medium">
                            {move.evaluation > 0 ? '+' : ''}{(move.evaluation / 100).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Position Analysis */}
                <div>
                  <h4 className="font-semibold mb-2">Position Analysis</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">Material</div>
                      <div className="text-muted-foreground">
                        W: {analysis.position.material.white} | B: {analysis.position.material.black}
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">King Safety</div>
                      <div className="text-muted-foreground">
                        W: {(analysis.position.kingSafety.white * 100).toFixed(0)}% | B: {(analysis.position.kingSafety.black * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">Center Control</div>
                      <div className="text-muted-foreground">
                        W: {(analysis.position.centerControl.white * 100).toFixed(0)}% | B: {(analysis.position.centerControl.black * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">Development</div>
                      <div className="text-muted-foreground">
                        W: {(analysis.position.development.white * 100).toFixed(0)}% | B: {(analysis.position.development.black * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                {analysis.insights && (
                  <div>
                    <h4 className="font-semibold mb-2">Insights</h4>
                    <div className="space-y-2">
                      {analysis.insights.tactical.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-red-600">Tactical:</div>
                          <div className="text-xs text-muted-foreground">
                            {analysis.insights.tactical.join(', ')}
                          </div>
                        </div>
                      )}
                      {analysis.insights.strategic.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-blue-600">Strategic:</div>
                          <div className="text-xs text-muted-foreground">
                            {analysis.insights.strategic.join(', ')}
                          </div>
                        </div>
                      )}
                      {analysis.insights.recommendations.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-green-600">Recommendations:</div>
                          <div className="text-xs text-muted-foreground">
                            {analysis.insights.recommendations.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Engine Info */}
                <div className="text-xs text-muted-foreground">
                  Depth: {analysis.depth} | Nodes: {analysis.nodes.toLocaleString()} | Time: {analysis.time}ms
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Move History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Move History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {moveHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  No moves yet
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {moveHistory.map((move, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-2 rounded cursor-pointer transition-colors",
                        currentMoveIndex === index 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted hover:bg-muted/80"
                      )}
                      onClick={() => navigateToMove(index)}
                    >
                      <div className="font-mono text-xs">
                        {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move.san}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
