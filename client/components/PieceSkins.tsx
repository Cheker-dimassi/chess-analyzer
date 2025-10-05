import React from 'react';
import { cn } from '@/lib/utils';

interface PieceProps {
  className?: string;
  size?: number;
}

type PieceComponentDict = Record<string, (props: PieceProps) => JSX.Element>;

// Classic Pieces (Traditional Staunton - Crown-like King)
export const ClassicKing = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Crown base */}
    <rect x="8" y="20" width="16" height="8" rx="1"/>
    {/* Crown points */}
    <path d="M6 20 L10 16 L14 20 L18 16 L22 20 L26 16 L30 20 L30 28 L6 28 Z"/>
    {/* Cross on top */}
    <rect x="15" y="8" width="2" height="8"/>
    <rect x="11" y="12" width="10" height="2"/>
    {/* Crown jewels */}
    <circle cx="12" cy="18" r="1"/>
    <circle cx="16" cy="18" r="1"/>
    <circle cx="20" cy="18" r="1"/>
  </svg>
);

export const ClassicQueen = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Crown with multiple points */}
    <path d="M4 20 L8 8 L12 16 L16 6 L20 16 L24 8 L28 20 L28 28 L4 28 Z"/>
    {/* Base */}
    <rect x="6" y="20" width="20" height="8" rx="2"/>
    {/* Crown jewels */}
    <circle cx="8" cy="12" r="1"/>
    <circle cx="12" cy="10" r="1"/>
    <circle cx="16" cy="8" r="1"/>
    <circle cx="20" cy="10" r="1"/>
    <circle cx="24" cy="12" r="1"/>
  </svg>
);

export const ClassicRook = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Castle tower with crenellations */}
    <rect x="8" y="8" width="16" height="16" rx="2"/>
    {/* Crenellations */}
    <rect x="6" y="6" width="20" height="4" rx="1"/>
    <rect x="8" y="4" width="4" height="2"/>
    <rect x="12" y="4" width="4" height="2"/>
    <rect x="16" y="4" width="4" height="2"/>
    <rect x="20" y="4" width="4" height="2"/>
    {/* Base */}
    <rect x="4" y="24" width="24" height="4" rx="1"/>
    {/* Windows */}
    <rect x="10" y="12" width="2" height="4"/>
    <rect x="14" y="12" width="2" height="4"/>
    <rect x="18" y="12" width="2" height="4"/>
  </svg>
);

export const ClassicBishop = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Mitre (bishop hat) */}
    <path d="M16 4 L12 8 L20 8 Z"/>
    <rect x="14" y="8" width="4" height="2"/>
    {/* Body - tapered */}
    <path d="M12 10 L20 10 L18 20 L14 20 Z"/>
    {/* Base */}
    <rect x="8" y="20" width="16" height="8" rx="2"/>
    {/* Cross on mitre */}
    <rect x="15" y="5" width="2" height="3"/>
    <rect x="14" y="6" width="4" height="1"/>
  </svg>
);

export const ClassicKnight = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Horse head shape */}
    <path d="M8 8 Q8 4 12 4 Q16 4 16 8 Q16 6 18 6 Q20 6 20 8 Q20 10 18 10 Q16 10 16 12 Q16 14 18 14 Q20 14 20 16 Q20 18 18 18 Q16 18 16 20 Q16 22 18 22 Q20 22 20 24 Q20 26 18 26 Q16 26 16 28 L8 28 Z"/>
    {/* Mane */}
    <path d="M8 8 Q6 6 8 4 Q10 2 12 4"/>
    {/* Base */}
    <rect x="6" y="26" width="20" height="4" rx="1"/>
  </svg>
);

export const ClassicPawn = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Spherical head */}
    <circle cx="16" cy="8" r="4"/>
    {/* Neck */}
    <rect x="14" y="12" width="4" height="4"/>
    {/* Body - tapered */}
    <path d="M12 16 L20 16 L18 24 L14 24 Z"/>
    {/* Base */}
    <rect x="10" y="24" width="12" height="4" rx="1"/>
  </svg>
);

// Modern Pieces (Geometric and Angular)
export const ModernKing = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Angular crown */}
    <polygon points="16,4 12,8 14,8 14,12 18,12 18,8 20,8"/>
    {/* Diamond body */}
    <polygon points="16,12 8,20 16,28 24,20"/>
    {/* Base */}
    <rect x="4" y="28" width="24" height="4" rx="1"/>
  </svg>
);

export const ModernQueen = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Hexagonal crown */}
    <polygon points="16,4 10,8 12,8 12,12 20,12 20,8 22,8"/>
    {/* Triangular body */}
    <polygon points="16,12 6,24 26,24"/>
    {/* Base */}
    <rect x="4" y="24" width="24" height="4" rx="1"/>
  </svg>
);

export const ModernRook = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Square tower with notches */}
    <rect x="8" y="6" width="16" height="16" rx="1"/>
    {/* Notches */}
    <rect x="6" y="4" width="4" height="2"/>
    <rect x="10" y="4" width="4" height="2"/>
    <rect x="14" y="4" width="4" height="2"/>
    <rect x="18" y="4" width="4" height="2"/>
    <rect x="22" y="4" width="4" height="2"/>
    {/* Base */}
    <rect x="4" y="22" width="24" height="6" rx="1"/>
  </svg>
);

export const ModernBishop = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Angular mitre */}
    <polygon points="16,4 12,8 20,8"/>
    {/* Diamond body */}
    <polygon points="16,8 8,16 16,24 24,16"/>
    {/* Base */}
    <rect x="4" y="24" width="24" height="4" rx="1"/>
  </svg>
);

export const ModernKnight = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Angular horse head */}
    <polygon points="8,8 12,4 16,6 20,4 24,8 22,12 20,10 18,12 16,10 14,12 12,10 10,12"/>
    {/* Body */}
    <polygon points="8,12 6,20 10,24 14,20 12,16 16,16 20,16 18,20 22,24 26,20 24,12"/>
    {/* Base */}
    <rect x="4" y="24" width="24" height="4" rx="1"/>
  </svg>
);

export const ModernPawn = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Square head */}
    <rect x="12" y="6" width="8" height="8" rx="1"/>
    {/* Angular body */}
    <polygon points="16,14 8,24 24,24"/>
    {/* Base */}
    <rect x="6" y="24" width="20" height="4" rx="1"/>
  </svg>
);

// Fantasy Pieces (Magical and Ornate)
export const FantasyKing = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Magical crown with stars */}
    <polygon points="16,4 10,8 12,10 8,12 14,10 16,12 18,10 24,12 20,10 22,8"/>
    {/* Star on top */}
    <polygon points="16,2 17,6 21,6 18,8 19,12 16,10 13,12 14,8 11,6 15,6"/>
    {/* Ornate body */}
    <path d="M8 14 Q16 12 24 14 Q24 20 16 22 Q8 20 8 14"/>
    {/* Base with magical symbols */}
    <rect x="4" y="22" width="24" height="6" rx="2"/>
    <circle cx="8" cy="25" r="1"/>
    <circle cx="16" cy="25" r="1"/>
    <circle cx="24" cy="25" r="1"/>
  </svg>
);

export const FantasyQueen = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Flowing crown */}
    <path d="M4 20 Q8 8 12 12 Q16 6 20 12 Q24 8 28 20 L28 28 L4 28 Z"/>
    {/* Star decorations */}
    <polygon points="8,10 9,12 11,12 9,14 10,16 8,15 6,16 7,14 5,12 7,12"/>
    <polygon points="16,8 17,10 19,10 17,12 18,14 16,13 14,14 15,12 13,10 15,10"/>
    <polygon points="24,10 25,12 27,12 25,14 26,16 24,15 22,16 23,14 21,12 23,12"/>
    {/* Base */}
    <rect x="6" y="20" width="20" height="8" rx="2"/>
  </svg>
);

export const FantasyRook = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Magical tower */}
    <rect x="8" y="8" width="16" height="16" rx="2"/>
    {/* Flowing top */}
    <path d="M6 8 Q16 4 26 8 Q26 12 16 10 Q6 12 6 8"/>
    {/* Magical symbols */}
    <circle cx="12" cy="12" r="1"/>
    <circle cx="20" cy="12" r="1"/>
    <circle cx="16" cy="16" r="1"/>
    {/* Base */}
    <rect x="4" y="24" width="24" height="4" rx="1"/>
  </svg>
);

export const FantasyBishop = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Magical mitre */}
    <path d="M16 4 Q12 8 16 10 Q20 8 16 4"/>
    {/* Flowing body */}
    <path d="M8 12 Q16 8 24 12 Q24 20 16 24 Q8 20 8 12"/>
    {/* Magical symbols */}
    <circle cx="12" cy="16" r="1"/>
    <circle cx="20" cy="16" r="1"/>
    {/* Base */}
    <rect x="6" y="24" width="20" height="4" rx="1"/>
  </svg>
);

export const FantasyKnight = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Magical horse with flowing mane */}
    <path d="M8 8 Q8 4 12 4 Q16 4 16 8 Q16 6 18 6 Q20 6 20 8 Q20 10 18 10 Q16 10 16 12 Q16 14 18 14 Q20 14 20 16 Q20 18 18 18 Q16 18 16 20 Q16 22 18 22 Q20 22 20 24 Q20 26 18 26 Q16 26 16 28 L8 28 Z"/>
    {/* Flowing mane */}
    <path d="M8 8 Q6 6 8 4 Q10 2 12 4 Q10 6 8 8"/>
    {/* Magical symbols */}
    <circle cx="12" cy="12" r="1"/>
    <circle cx="20" cy="16" r="1"/>
    {/* Base */}
    <rect x="6" y="26" width="20" height="4" rx="1"/>
  </svg>
);

export const FantasyPawn = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Magical orb head */}
    <circle cx="16" cy="8" r="4"/>
    {/* Flowing body */}
    <path d="M12 12 Q16 10 20 12 Q20 20 16 22 Q12 20 12 12"/>
    {/* Magical symbols */}
    <circle cx="14" cy="16" r="1"/>
    <circle cx="18" cy="16" r="1"/>
    {/* Base */}
    <rect x="8" y="22" width="16" height="6" rx="2"/>
  </svg>
);

// Minimal Pieces (Clean and Simple)
export const MinimalKing = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Simple cross */}
    <rect x="15" y="4" width="2" height="12"/>
    <rect x="11" y="8" width="10" height="2"/>
    {/* Simple body */}
    <rect x="12" y="16" width="8" height="12"/>
    {/* Base */}
    <rect x="8" y="28" width="16" height="4"/>
  </svg>
);

export const MinimalQueen = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Simple triangle */}
    <polygon points="16,4 8,20 24,20"/>
    {/* Base */}
    <rect x="6" y="20" width="20" height="8"/>
  </svg>
);

export const MinimalRook = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Simple square */}
    <rect x="8" y="8" width="16" height="16"/>
    {/* Simple top */}
    <rect x="6" y="6" width="20" height="4"/>
    {/* Base */}
    <rect x="4" y="24" width="24" height="4"/>
  </svg>
);

export const MinimalBishop = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Simple triangle */}
    <polygon points="16,4 8,20 24,20"/>
    {/* Base */}
    <rect x="6" y="20" width="20" height="8"/>
  </svg>
);

export const MinimalKnight = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Simple L-shape */}
    <rect x="8" y="8" width="8" height="16"/>
    <rect x="16" y="8" width="8" height="8"/>
    {/* Base */}
    <rect x="6" y="24" width="20" height="4"/>
  </svg>
);

export const MinimalPawn = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Simple circle */}
    <circle cx="16" cy="8" r="4"/>
    {/* Simple body */}
    <rect x="12" y="12" width="8" height="12"/>
    {/* Base */}
    <rect x="8" y="24" width="16" height="4"/>
  </svg>
);

// Vintage Pieces (Retro Style)
export const VintageKing = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Vintage crown */}
    <path d="M16 4 L12 8 L14 10 L10 12 L16 10 L22 12 L18 10 L20 8 Z"/>
    {/* Vintage body */}
    <rect x="10" y="12" width="12" height="12"/>
    {/* Vintage base */}
    <rect x="6" y="24" width="20" height="6" rx="2"/>
    {/* Vintage details */}
    <rect x="12" y="14" width="2" height="2"/>
    <rect x="18" y="14" width="2" height="2"/>
    <rect x="12" y="18" width="8" height="2"/>
  </svg>
);

export const VintageQueen = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Vintage crown */}
    <path d="M16 4 L10 8 L12 10 L8 12 L14 10 L18 10 L24 12 L20 10 L22 8 Z"/>
    {/* Vintage body */}
    <rect x="8" y="12" width="16" height="12"/>
    {/* Vintage base */}
    <rect x="6" y="24" width="20" height="6" rx="2"/>
  </svg>
);

export const VintageRook = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Vintage tower */}
    <rect x="8" y="8" width="16" height="16"/>
    {/* Vintage crenellations */}
    <rect x="6" y="6" width="20" height="4"/>
    <rect x="8" y="4" width="4" height="2"/>
    <rect x="12" y="4" width="4" height="2"/>
    <rect x="16" y="4" width="4" height="2"/>
    <rect x="20" y="4" width="4" height="2"/>
    {/* Vintage base */}
    <rect x="4" y="24" width="24" height="6" rx="2"/>
  </svg>
);

export const VintageBishop = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Vintage mitre */}
    <path d="M16 4 L12 8 L20 8 Z"/>
    {/* Vintage body */}
    <rect x="10" y="8" width="12" height="16"/>
    {/* Vintage base */}
    <rect x="6" y="24" width="20" height="6" rx="2"/>
  </svg>
);

export const VintageKnight = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Vintage horse */}
    <rect x="8" y="8" width="16" height="16"/>
    {/* Vintage mane */}
    <rect x="6" y="6" width="4" height="4"/>
    {/* Vintage base */}
    <rect x="4" y="24" width="24" height="6" rx="2"/>
  </svg>
);

export const VintagePawn = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cn("fill-current", className)}>
    {/* Vintage head */}
    <circle cx="16" cy="8" r="4"/>
    {/* Vintage body */}
    <rect x="10" y="12" width="12" height="12"/>
    {/* Vintage base */}
    <rect x="6" y="24" width="20" height="6" rx="2"/>
  </svg>
);

// Chess.com Style Pieces (Matching the extension)
export const ChessComKing = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 45 45" width={size} height={size} className={cn("fill-current", className)}>
    <g fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 22.5,11.63 L 22.5,6" />
      <path d="M 20,8 L 25,8" />
      <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
      <path d="M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 11.5,29.5 11.5,29.5 L 11.5,37 z" />
      <path d="M 11.5,30 C 17,27 27,27 32.5,30" />
      <path d="M 11.5,33.5 C 17,30.5 27,30.5 32.5,33.5" />
      <path d="M 11.5,37 C 17,34 27,34 32.5,37" />
    </g>
  </svg>
);

export const ChessComQueen = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 45 45" width={size} height={size} className={cn("fill-current", className)}>
    <g fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 8,12 A 2,2 0 1,1 4,12 A 2,2 0 1,1 8,12 z" transform="translate(-1,-1)" />
      <path d="M 9,13 A 2,2 0 1,1 5,13 A 2,2 0 1,1 9,13 z" transform="translate(15.5,-5.5)" />
      <path d="M 9,13 A 2,2 0 1,1 5,13 A 2,2 0 1,1 9,13 z" transform="translate(32,-1)" />
      <path d="M 9,13 A 2,2 0 1,1 5,13 A 2,2 0 1,1 9,13 z" transform="translate(7,-4.5)" />
      <path d="M 9,13 A 2,2 0 1,1 5,13 A 2,2 0 1,1 9,13 z" transform="translate(24,-4)" />
      <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,9.5 L 19.5,24.5 L 14,10.5 L 14,25 L 7,14 L 9,26 z" />
      <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
      <path d="M 11.5,30 C 15,29 30,29 33.5,30" />
      <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" />
    </g>
  </svg>
);

export const ChessComRook = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 45 45" width={size} height={size} className={cn("fill-current", className)}>
    <g fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
      <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
      <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
      <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
      <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" />
      <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" />
      <path d="M 11,14 L 34,14" />
    </g>
  </svg>
);

export const ChessComBishop = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 45 45" width={size} height={size} className={cn("fill-current", className)}>
    <g fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" />
      <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
      <path d="M 25 8 A 2.5 2.5 0 1 1 20,8 A 2.5 2.5 0 1 1 25 8 z" />
      <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" strokeLinejoin="miter" />
    </g>
  </svg>
);

export const ChessComKnight = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 45 45" width={size} height={size} className={cn("fill-current", className)}>
    <g fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" />
      <path d="M 9.5,25.5 A 0.5,0.5 0 1 1 8.5,25.5 A 0.5,0.5 0 1 1 9.5,25.5 z" fill="#000" />
      <path d="M 15,15.5 A 0.5,1.5 0 1 1 14,15.5 A 0.5,1.5 0 1 1 15,15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#000" />
    </g>
  </svg>
);

export const ChessComPawn = ({ className, size = 32 }: PieceProps) => (
  <svg viewBox="0 0 45 45" width={size} height={size} className={cn("fill-current", className)}>
    <g strokeWidth="1.5" strokeLinecap="round">
      <path d="M 22.5,9 C 19.5,9 17,11.5 17,14.5 C 17,17 18,18 18,18 C 15,19 14,21 14,23.5 C 14,26 15,27 15,27 C 15,27 14.5,28.5 15,30 C 15.5,31.5 17,34.5 17,34.5 L 17,36 L 28,36 L 28,34.5 C 28,34.5 29.5,31.5 30,30 C 30.5,28.5 30,27 30,27 C 30,27 31,26 31,23.5 C 31,21 30,19 27,18 C 27,18 28,17 28,14.5 C 28,11.5 25.5,9 22.5,9 z" />
    </g>
  </svg>
);

// Piece component mapping
const classicPieces: PieceComponentDict = {
  K: ClassicKing,
  Q: ClassicQueen,
  R: ClassicRook,
  B: ClassicBishop,
  N: ClassicKnight,
  P: ClassicPawn,
  k: ClassicKing,
  q: ClassicQueen,
  r: ClassicRook,
  b: ClassicBishop,
  n: ClassicKnight,
  p: ClassicPawn,
};

const minimalPieces: PieceComponentDict = {
  K: MinimalKing,
  Q: MinimalQueen,
  R: MinimalRook,
  B: MinimalBishop,
  N: MinimalKnight,
  P: MinimalPawn,
  k: MinimalKing,
  q: MinimalQueen,
  r: MinimalRook,
  b: MinimalBishop,
  n: MinimalKnight,
  p: MinimalPawn,
};

const modernPieces: PieceComponentDict = {
  K: ModernKing,
  Q: ModernQueen,
  R: ModernRook,
  B: ModernBishop,
  N: ModernKnight,
  P: ModernPawn,
  k: ModernKing,
  q: ModernQueen,
  r: ModernRook,
  b: ModernBishop,
  n: ModernKnight,
  p: ModernPawn,
};

const fantasyPieces: PieceComponentDict = {
  K: FantasyKing,
  Q: FantasyQueen,
  R: FantasyRook,
  B: FantasyBishop,
  N: FantasyKnight,
  P: FantasyPawn,
  k: FantasyKing,
  q: FantasyQueen,
  r: FantasyRook,
  b: FantasyBishop,
  n: FantasyKnight,
  p: FantasyPawn,
};

const vintagePieces: PieceComponentDict = {
  K: VintageKing,
  Q: VintageQueen,
  R: VintageRook,
  B: VintageBishop,
  N: VintageKnight,
  P: VintagePawn,
  k: VintageKing,
  q: VintageQueen,
  r: VintageRook,
  b: VintageBishop,
  n: VintageKnight,
  p: VintagePawn,
};

const chessComPieces: PieceComponentDict = {
  K: ChessComKing,
  Q: ChessComQueen,
  R: ChessComRook,
  B: ChessComBishop,
  N: ChessComKnight,
  P: ChessComPawn,
  k: ChessComKing,
  q: ChessComQueen,
  r: ChessComRook,
  b: ChessComBishop,
  n: ChessComKnight,
  p: ChessComPawn,
};

export const pieceComponents = {
  classic: classicPieces,
  garden: classicPieces,
  royal: classicPieces,
  flat: minimalPieces,
  outline: minimalPieces,
  minimal: minimalPieces,
  modern: modernPieces,
  glacier: modernPieces,
  fantasy: fantasyPieces,
  vintage: vintagePieces,
  chesscom: chessComPieces,
};
