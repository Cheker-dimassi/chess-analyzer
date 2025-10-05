import React from 'react';
import { useSkin } from '@/hooks/useSkin';
import { pieceComponents } from './PieceSkins';
import { cn } from '@/lib/utils';

interface SkinnedPieceProps {
  piece: string;
  size?: number;
  className?: string;
}

export default function SkinnedPiece({ piece, size = 32, className }: SkinnedPieceProps) {
  const { currentSkin } = useSkin();
  const pieceStyle = currentSkin.pieces.style;
  const pieceKey = piece.toUpperCase();
  
  // Get the appropriate component based on piece and style
  const PieceComponent = pieceComponents[pieceStyle]?.[pieceKey];
  
  if (!PieceComponent) {
    // Fallback to Unicode symbols
    return (
      <span 
        className={cn(
          "flex items-center justify-center text-2xl font-bold",
          piece === piece.toUpperCase() ? "text-white" : "text-black",
          className
        )}
        style={{ fontSize: size }}
      >
        {piece}
      </span>
    );
  }

  // Determine piece color class
  const isWhite = piece === piece.toUpperCase();
  const colorClass = isWhite ? 'text-white' : 'text-black';
  
  // Add skin-specific styling
  const skinClass = `piece-${pieceStyle}`;
  const colorVariant = isWhite ? 'white' : 'black';
  const specialClass = `${skinClass}-${colorVariant}`;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <PieceComponent 
        size={size} 
        className={cn(colorClass, skinClass, specialClass)}
      />
    </div>
  );
}
