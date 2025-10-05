import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import type { Square, Move } from "chess.js";
import { cn } from "@/lib/utils";
import { PieceSvg } from "./ChessPieces";
import { useSkin } from "@/hooks/useSkin";

interface InteractiveChessBoardProps {
  fen: string;
  playerColor: 'white' | 'black';
  isPlayerTurn: boolean;
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  onFenChange?: (fen: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  highlightLastMove?: boolean;
  showCoordinates?: boolean;
  disabled?: boolean;
}

// Chess piece Unicode symbols
const pieceSymbols: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"
};

const MOVE_ANIMATION_DURATION = 260;

type MoveAnimationState = {
  pieceCode: string;
  from: string;
  to: string;
};

export default function InteractiveChessBoard({
  fen,
  playerColor,
  isPlayerTurn,
  onMove,
  onFenChange,
  className,
  size = "md",
  highlightLastMove = true,
  showCoordinates = true,
  disabled = false
}: InteractiveChessBoardProps) {
  const { currentSkin } = useSkin();
  const [chess] = useState(() => new Chess());

  // Apply skin styles dynamically
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--skin-board-light', currentSkin.board.lightSquare);
    root.style.setProperty('--skin-board-dark', currentSkin.board.darkSquare);
    if (currentSkin.board.border) {
      root.style.setProperty('--skin-board-border', currentSkin.board.border);
    }
  }, [currentSkin]);
  const [board, setBoard] = useState<(any | null)[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [promotionSquare, setPromotionSquare] = useState<{ from: string; to: string } | null>(null);
  const [animatingMove, setAnimatingMove] = useState<{ from: string; to: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const initialLoadRef = useRef(true);
  const animationStartRef = useRef<number>();
  const animationFrameRef = useRef<number>();
  const animationTimeoutRef = useRef<number>();
  const [boardSize, setBoardSize] = useState(0);
  const [activeAnimation, setActiveAnimation] = useState<MoveAnimationState | null>(null);
  const [animateProgress, setAnimateProgress] = useState(false);

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

    return () => {
      observer.disconnect();
    };
  }, [size]);

  useEffect(() => {
    chess.load(fen);
    setBoard(chess.board());

    const history = chess.history({ verbose: true }) as Move[];
    if (history.length > 0) {
      const lastMoveData = history[history.length - 1];
      setLastMove({ from: lastMoveData.from, to: lastMoveData.to });

      if (!initialLoadRef.current) {
        const pieceCode = lastMoveData.color === 'w'
          ? lastMoveData.piece.toUpperCase()
          : lastMoveData.piece;

        setActiveAnimation({
          pieceCode,
          from: lastMoveData.from,
          to: lastMoveData.to,
        });
      }
    } else {
      setLastMove(null);
      if (!initialLoadRef.current) {
        setActiveAnimation(null);
      }
    }

    initialLoadRef.current = false;
  }, [fen, chess]);

  const sizeClasses = {
    sm: "w-64 h-64",
    md: "w-80 h-80", 
    lg: "w-96 h-96"
  };

  useEffect(() => {
    if (!activeAnimation || boardSize === 0) {
      return;
    }

    setAnimateProgress(false);

    if (animationStartRef.current !== undefined) {
      window.cancelAnimationFrame(animationStartRef.current);
      animationStartRef.current = undefined;
    }

    if (animationFrameRef.current !== undefined) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    if (animationTimeoutRef.current !== undefined) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = undefined;
    }

    animationStartRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = window.requestAnimationFrame(() => {
        setAnimateProgress(true);
      });
    });

    animationTimeoutRef.current = window.setTimeout(() => {
      setAnimateProgress(false);
      setActiveAnimation(null);
      animationTimeoutRef.current = undefined;
    }, MOVE_ANIMATION_DURATION);

    return () => {
      if (animationStartRef.current !== undefined) {
        window.cancelAnimationFrame(animationStartRef.current);
        animationStartRef.current = undefined;
      }

      if (animationFrameRef.current !== undefined) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }

      if (animationTimeoutRef.current !== undefined) {
        window.clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = undefined;
      }
    };
  }, [activeAnimation, boardSize]);

  const getSquareName = (row: number, col: number): string => {
    const fileIndex = playerColor === 'white' ? col : 7 - col;
    const rankIndex = playerColor === 'white' ? 7 - row : row;
    return String.fromCharCode(97 + fileIndex) + (rankIndex + 1).toString();
  };

  const getSquarePosition = (squareName: string): { row: number; col: number } => {
    const file = squareName.charCodeAt(0) - 97;
    const rank = parseInt(squareName[1]) - 1;
    const row = playerColor === 'white' ? 7 - rank : rank;
    const col = playerColor === 'white' ? file : 7 - file;
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

  const isPieceMovable = (piece: any): boolean => {
    if (!piece || !isPlayerTurn || disabled) return false;
    return (playerColor === 'white' && piece.color === 'w') || 
           (playerColor === 'black' && piece.color === 'b');
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!isPlayerTurn || disabled) return;

    const squareName = getSquareName(row, col);
    const piece = board[row][col];

    if (selectedSquare === null) {
      // Selecting a piece
      if (piece && isPieceMovable(piece)) {
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
      
      // Check for pawn promotion
      const movingPiece = chess.get(selectedSquare as unknown as Square);
      if (movingPiece?.type === 'p') {
        const isPromotionMove = (movingPiece.color === 'w' && squareName[1] === '8') ||
                               (movingPiece.color === 'b' && squareName[1] === '1');
        
        if (isPromotionMove) {
          setPromotionSquare(move);
          return;
        }
      }

      makeMove(move);
    } else {
      // Selecting a different piece
      if (piece && isPieceMovable(piece)) {
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
      // Validate move
      const testChess = new Chess(fen);
      const result = testChess.move(move);
      
      if (result) {
        onMove(move);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setPromotionSquare(null);
        if (typeof onFenChange === 'function') {
          onFenChange(testChess.fen());
        }
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
  };

  const handlePromotion = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (promotionSquare) {
      makeMove({ ...promotionSquare, promotion: piece });
    }
  };

  const isSquareHighlighted = (row: number, col: number): boolean => {
    const squareName = getSquareName(row, col);
    
    // Highlight selected square
    if (selectedSquare === squareName) return true;
    
    // Highlight possible moves
    if (possibleMoves.includes(squareName)) return true;
    
    // Highlight last move
    if (highlightLastMove && lastMove) {
      if (lastMove.from === squareName || lastMove.to === squareName) return true;
    }
    
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
        return isLight ? "bg-red-300" : "bg-red-400"; // Capture
      } else {
        return isLight ? "bg-green-300" : "bg-green-400"; // Move
      }
    }

    // Enhanced highlighting for last move with stronger colors
    if (highlightLastMove && lastMove) {
      if (lastMove.from === squareName) {
        return isLight ? "bg-orange-300 animate-pulse-highlight" : "bg-orange-400 animate-pulse-highlight"; // Source square - orange
      }
      if (lastMove.to === squareName) {
        return isLight ? "bg-blue-300 animate-pulse-highlight" : "bg-blue-400 animate-pulse-highlight"; // Destination square - blue
      }
    }

    // Use skin colors
    return isLight ? "skin-board-light" : "skin-board-dark";
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

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Chess Board */}
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
                    isPlayerTurn && !disabled && "hover:opacity-80",
                    disabled && "cursor-not-allowed opacity-60"
                  )}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece && (!activeAnimation || activeAnimation.to !== squareName) && (
                    <PieceSvg
                      code={piece.color === 'w' ? piece.type.toUpperCase() : piece.type}
                      className={cn("pointer-events-none", pieceSizeClass)}
                    />
                  )}
                  
                  {/* Possible move indicators */}
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

          {/* Outside coordinates */}
          {showCoordinates && size !== "sm" && (
            <>
              {/* Left side rank numbers */}
              <div className="absolute -left-6 top-0 h-full grid grid-rows-8 place-items-center text-xs font-medium select-none">
                {(playerColor === 'white' ? [8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8]).map((n) => (
                  <span key={n} className="text-slate-900">{n}</span>
                ))}
              </div>
              {/* Bottom file letters */}
              <div className="absolute -bottom-6 left-0 w-full grid grid-cols-8 place-items-center text-xs font-medium select-none">
                {(playerColor === 'white' ? [...'abcdefgh'] : [...'hgfedcba']).map((c) => (
                  <span key={c} className="text-slate-900">{c}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Promotion Dialog */}
      {promotionSquare && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Choose promotion piece:</h3>
            <div className="flex gap-4">
              {['q', 'r', 'b', 'n'].map((piece) => (
                <button
                  key={piece}
                  onClick={() => handlePromotion(piece as 'q' | 'r' | 'b' | 'n')}
                  className="w-16 h-16 border-2 border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-4xl"
                >
                  {pieceSymbols[piece.toUpperCase() + (playerColor === 'white' ? '' : piece)]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
