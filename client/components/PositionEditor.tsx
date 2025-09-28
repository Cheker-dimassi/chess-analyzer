import { useState } from "react";
import { Chess } from "chess.js";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieceSvg } from "./ChessPieces";
import { cn } from "@/lib/utils";
import { RotateCcw, Trash2 } from "lucide-react";

interface PositionEditorProps {
  initialFen: string;
  onFenChange: (fen: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const pieceTypes = ['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'];

export default function PositionEditor({ 
  initialFen, 
  onFenChange, 
  isOpen, 
  onClose 
}: PositionEditorProps) {
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState<(any | null)[][]>([]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [castlingRights, setCastlingRights] = useState('KQkq');
  const [enPassant, setEnPassant] = useState('-');
  const [halfMove, setHalfMove] = useState(0);
  const [fullMove, setFullMove] = useState(1);

  // Initialize board
  useState(() => {
    chess.load(initialFen);
    setBoard(chess.board());
    const fenParts = initialFen.split(' ');
    setIsWhiteTurn(fenParts[1] === 'w');
    setCastlingRights(fenParts[2]);
    setEnPassant(fenParts[3]);
    setHalfMove(parseInt(fenParts[4]) || 0);
    setFullMove(parseInt(fenParts[5]) || 1);
  });

  const getSquareName = (row: number, col: number): string => {
    const fileIndex = col;
    const rankIndex = 7 - row;
    return String.fromCharCode(97 + fileIndex) + (rankIndex + 1).toString();
  };

  const handleSquareClick = (row: number, col: number) => {
    if (selectedPiece) {
      // Place piece
      const squareName = getSquareName(row, col);
      chess.remove(squareName as any);
      chess.put({ type: selectedPiece.toLowerCase() as any, color: selectedPiece === selectedPiece.toUpperCase() ? 'w' : 'b' }, squareName as any);
      setBoard(chess.board());
      setSelectedPiece(null);
    } else {
      // Remove piece
      const squareName = getSquareName(row, col);
      chess.remove(squareName as any);
      setBoard(chess.board());
    }
  };

  const generateFen = () => {
    const fen = chess.fen();
    const fenParts = fen.split(' ');
    fenParts[1] = isWhiteTurn ? 'w' : 'b';
    fenParts[2] = castlingRights;
    fenParts[3] = enPassant;
    fenParts[4] = halfMove.toString();
    fenParts[5] = fullMove.toString();
    return fenParts.join(' ');
  };

  const handleSave = () => {
    const newFen = generateFen();
    onFenChange(newFen);
    onClose();
  };

  const clearBoard = () => {
    chess.clear();
    setBoard(chess.board());
  };

  const resetToInitial = () => {
    chess.load(initialFen);
    setBoard(chess.board());
  };

  const getSquareColor = (row: number, col: number): string => {
    const isLight = (row + col) % 2 === 0;
    return isLight ? "bg-chess-board-light" : "bg-chess-board-dark";
  };

  const pieceSizeClass = "w-8 h-8";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Position Editor</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Board */}
          <div className="lg:col-span-2">
            <div className="flex justify-center mb-4">
              <div className="relative inline-block">
                <div className="pl-6 pb-6">
                  <div className="relative inline-block overflow-hidden w-80 h-80">
                    <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                      {board.map((row, rowIndex) =>
                        row.map((piece, colIndex) => {
                          const squareName = getSquareName(rowIndex, colIndex);
                          
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
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Coordinates */}
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
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={clearBoard}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Board
              </Button>
              <Button variant="outline" onClick={resetToInitial}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Piece Selection */}
            <div>
              <h3 className="font-semibold mb-2">Pieces</h3>
              <div className="grid grid-cols-2 gap-2">
                {pieceTypes.map((piece) => (
                  <Button
                    key={piece}
                    variant={selectedPiece === piece ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPiece(selectedPiece === piece ? null : piece)}
                    className="h-12"
                  >
                    <PieceSvg
                      code={piece}
                      className="w-6 h-6"
                    />
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedPiece ? `Selected: ${selectedPiece}` : "Click a piece to place, or click empty squares to remove pieces"}
              </p>
            </div>

            {/* Game State */}
            <div>
              <h3 className="font-semibold mb-2">Game State</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Turn</label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={isWhiteTurn ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsWhiteTurn(true)}
                    >
                      White
                    </Button>
                    <Button
                      variant={!isWhiteTurn ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsWhiteTurn(false)}
                    >
                      Black
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Castling Rights</label>
                  <input
                    type="text"
                    value={castlingRights}
                    onChange={(e) => setCastlingRights(e.target.value)}
                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                    placeholder="KQkq"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">En Passant</label>
                  <input
                    type="text"
                    value={enPassant}
                    onChange={(e) => setEnPassant(e.target.value)}
                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                    placeholder="-"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Half Move</label>
                    <input
                      type="number"
                      value={halfMove}
                      onChange={(e) => setHalfMove(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Full Move</label>
                    <input
                      type="number"
                      value={fullMove}
                      onChange={(e) => setFullMove(parseInt(e.target.value) || 1)}
                      className="w-full mt-1 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FEN Display */}
            <div>
              <h3 className="font-semibold mb-2">FEN</h3>
              <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                {generateFen()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Apply Position
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
