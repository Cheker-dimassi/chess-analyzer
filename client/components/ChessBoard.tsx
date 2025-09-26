import { cn } from "@/lib/utils";
import { PieceSvg } from "./ChessPieces";

interface ChessBoardProps {
  fen?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  highlightSquares?: string[];
}

// Chess piece Unicode symbols
const pieceSymbols: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"
};

// Convert FEN to board array
function fenToBoard(fen: string): (string | null)[][] {
  const board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  const rows = fen.split(" ")[0].split("/");
  
  for (let row = 0; row < 8; row++) {
    let col = 0;
    for (const char of rows[row]) {
      if (char >= "1" && char <= "8") {
        col += parseInt(char);
      } else {
        board[row][col] = char;
        col++;
      }
    }
  }
  
  return board;
}

// Convert board position to square name (e.g., a1, e4)
function getSquareName(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (8 - row).toString();
}

export default function ChessBoard({ 
  fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
  className,
  size = "md",
  highlightSquares = []
}: ChessBoardProps) {
  const board = fenToBoard(fen);
  
  const sizeClasses = {
    sm: "w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64",
    md: "w-64 h-64 xs:w-72 xs:h-72 sm:w-80 sm:h-80",
    lg: "w-80 h-80 xs:w-88 xs:h-88 sm:w-96 sm:h-96"
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div className="pl-6 pb-6">
        <div className={cn("relative inline-block overflow-hidden", sizeClasses[size])}>
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const squareName = getSquareName(rowIndex, colIndex);
            const isHighlighted = highlightSquares.includes(squareName);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "flex items-center justify-center relative",
                  isLight ? "bg-chess-board-light" : "bg-chess-board-dark",
                  isHighlighted && "ring-2 ring-yellow-400 ring-inset"
                )}
              >
                {piece && (
                  <PieceSvg
                    code={piece}
                    className={cn(
                      size === "sm" && "w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8",
                      size === "md" && "w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10",
                      size === "lg" && "w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14"
                    )}
                  />
                )}
              </div>
            );
          })
        )}
          </div>

          {/* Outside coordinates */}
          {size !== "sm" && (
            <>
              {/* Left numbers 8 to 1 */}
              <div className="absolute -left-6 top-0 h-full grid grid-rows-8 place-items-center text-xs font-medium select-none">
                {[8,7,6,5,4,3,2,1].map((n) => (
                  <span key={n} className="text-slate-900">{n}</span>
                ))}
              </div>
              {/* Bottom letters a to h */}
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
  );
}
