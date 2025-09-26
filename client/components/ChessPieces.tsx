import React from "react";

type PieceColor = "white" | "black";

interface PieceProps {
  color: PieceColor;
  className?: string;
}

const fillFor = (color: PieceColor) => (color === "white" ? "#ffffff" : "#000000");
const strokeFor = (color: PieceColor) => (color === "white" ? "#000000" : "#ffffff");

export const King: React.FC<PieceProps> = ({ color, className }) => (
  <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
    <g fill={fillFor(color)} stroke={strokeFor(color)} strokeWidth="2">
      <path d="M22.5 11 v6" />
      <path d="M20 14 h5" />
      <circle cx="22.5" cy="19" r="2.5" />
      <path d="M15 27 h15 l-2 10 h-11 z" />
    </g>
  </svg>
);

export const Queen: React.FC<PieceProps> = ({ color, className }) => (
  <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
    <g fill={fillFor(color)} stroke={strokeFor(color)} strokeWidth="2">
      <circle cx="12" cy="16" r="2.5" />
      <circle cx="22.5" cy="13" r="2.5" />
      <circle cx="33" cy="16" r="2.5" />
      <path d="M14 20 l8 -6 l8 6 l-3 17 h-10 z" />
    </g>
  </svg>
);

export const Rook: React.FC<PieceProps> = ({ color, className }) => (
  <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
    <g fill={fillFor(color)} stroke={strokeFor(color)} strokeWidth="2">
      <path d="M14 14 h17 v6 h-17 z" />
      <path d="M16 20 h13 v15 h-13 z" />
      <path d="M12 35 h21 v4 h-21 z" />
    </g>
  </svg>
);

export const Bishop: React.FC<PieceProps> = ({ color, className }) => (
  <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
    <g fill={fillFor(color)} stroke={strokeFor(color)} strokeWidth="2">
      <path d="M22.5 12 c6 6 6 10 0 16 c-6 -6 -6 -10 0 -16 z" />
      <path d="M16 30 h13 l-2 7 h-9 z" />
    </g>
  </svg>
);

export const Knight: React.FC<PieceProps> = ({ color, className }) => (
  <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
    <g fill={fillFor(color)} stroke={strokeFor(color)} strokeWidth="2">
      <path d="M28 14 c-6 0 -10 4 -12 9 l-4 5 h13 l6 9 h4 l-3 -10 l5 -4 l-3 -3 c-1 -3 -3 -6 -6 -6 z" />
      <path d="M12 35 h21 v4 h-21 z" />
    </g>
  </svg>
);

export const Pawn: React.FC<PieceProps> = ({ color, className }) => (
  <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
    <g fill={fillFor(color)} stroke={strokeFor(color)} strokeWidth="2">
      <circle cx="22.5" cy="16" r="5" />
      <path d="M17 23 h11 l-2 9 h-7 z" />
      <path d="M14 34 h17 v4 h-17 z" />
    </g>
  </svg>
);

export const PieceSvg: React.FC<{ code: string; className?: string }> = ({ code, className }) => {
  const isWhite = code === code.toUpperCase();
  const color: PieceColor = isWhite ? "white" : "black";
  const type = code.toUpperCase();
  const cls = className ?? "w-full h-full";
  switch (type) {
    case "K":
      return <King color={color} className={cls} />;
    case "Q":
      return <Queen color={color} className={cls} />;
    case "R":
      return <Rook color={color} className={cls} />;
    case "B":
      return <Bishop color={color} className={cls} />;
    case "N":
      return <Knight color={color} className={cls} />;
    case "P":
      return <Pawn color={color} className={cls} />;
    default:
      return null;
  }
};


