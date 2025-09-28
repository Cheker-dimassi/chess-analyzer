import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import type { Square, Move } from "chess.js";
import { cn } from "@/lib/utils";
import { PieceSvg } from "./ChessPieces";

interface SimpleAnalysisBoardProps {
  initialFen?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showCoordinates?: boolean;
}

export default function SimpleAnalysisBoard({
  initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  className,
  size = "lg",
  showCoordinates = true
}: SimpleAnalysisBoardProps) {
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState<(any | null)[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

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
  }, [initialFen, chess]);

  const getSquareName = (row: number, col: number): string => {
    const fileIndex = col;
    const rankIndex = 7 - row;
    return String.fromCharCode(97 + fileIndex) + (rankIndex + 1).toString();
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
        
        setSelectedSquare(null);
        setPossibleMoves([]);
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
  };

  const resetPosition = () => {
    chess.load(initialFen);
    setBoard(chess.board());
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setSelectedSquare(null);
    setPossibleMoves([]);
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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Simple Controls */}
      <div className="flex gap-2">
        <button 
          onClick={() => navigateToMove(-1)}
          disabled={currentMoveIndex === -1}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Reset
        </button>
        <button 
          onClick={() => navigateToMove(currentMoveIndex - 1)}
          disabled={currentMoveIndex === -1}
          className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          ←
        </button>
        <button 
          onClick={() => navigateToMove(currentMoveIndex + 1)}
          disabled={currentMoveIndex === moveHistory.length - 1}
          className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          →
        </button>
        <span className="px-3 py-1 text-sm">
          Move {currentMoveIndex + 1} of {moveHistory.length}
        </span>
      </div>

      {/* Chess Board */}
      <div className={cn("relative inline-block", className)}>
        <div className="pl-6 pb-6">
          <div className={cn("relative inline-block overflow-hidden", sizeClasses[size])}>
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
                      {piece && (
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

      {/* Move History */}
      <div className="max-h-32 overflow-y-auto">
        <h3 className="font-semibold mb-2">Move History</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {moveHistory.map((move, index) => (
            <div 
              key={index}
              className={cn(
                "p-2 rounded cursor-pointer transition-colors",
                currentMoveIndex === index 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-200 hover:bg-gray-300"
              )}
              onClick={() => navigateToMove(index)}
            >
              <div className="font-mono text-xs">
                {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move.san}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
