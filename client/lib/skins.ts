export interface BoardSkin {
  id: string;
  name: string;
  description: string;
  lightSquare: string;
  darkSquare: string;
  border?: string;
  pattern?: string;
  preview: string;
}

export interface PieceSkin {
  id: string;
  name: string;
  description: string;
  style: 'classic' | 'modern' | 'fantasy' | 'minimal' | 'vintage' | 'flat' | 'garden' | 'glacier' | 'outline' | 'royal' | 'chesscom';
  pieces: {
    [key: string]: string; // Piece codes to SVG paths or CSS classes
  };
  preview: string;
}

export interface SkinTheme {
  id: string;
  name: string;
  description: string;
  board: BoardSkin;
  pieces: PieceSkin;
  preview: string;
}

// Board Skins
export const boardSkins: BoardSkin[] = [
  {
    id: 'chesscom',
    name: 'Chess.com',
    description: 'Official Chess.com board colors',
    lightSquare: '#edeed1',
    darkSquare: '#779556',
    border: '#4b7399',
    preview: '♟️'
  },
  {
    id: 'classic-wood',
    name: 'Classic Wood',
    description: 'Traditional wooden chess board',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    border: '#8b4513',
    preview: '🟫'
  },
  {
    id: 'marble',
    name: 'Marble',
    description: 'Elegant marble board',
    lightSquare: '#f5f5f5',
    darkSquare: '#2c2c2c',
    border: '#666666',
    preview: '⚪'
  },
  {
    id: 'glass',
    name: 'Glass',
    description: 'Modern glass board',
    lightSquare: 'rgba(255, 255, 255, 0.8)',
    darkSquare: 'rgba(0, 0, 0, 0.6)',
    border: 'rgba(100, 100, 100, 0.3)',
    preview: '🔳'
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Cyberpunk neon board',
    lightSquare: '#00ff88',
    darkSquare: '#ff0088',
    border: '#ffffff',
    preview: '💚'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep ocean theme',
    lightSquare: '#87ceeb',
    darkSquare: '#4682b4',
    border: '#2e4a6b',
    preview: '🌊'
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural forest theme',
    lightSquare: '#90ee90',
    darkSquare: '#228b22',
    border: '#006400',
    preview: '🌲'
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'Luxurious gold board',
    lightSquare: '#ffd700',
    darkSquare: '#b8860b',
    border: '#8b6914',
    preview: '🟡'
  },
  {
    id: 'ice',
    name: 'Ice',
    description: 'Frozen ice theme',
    lightSquare: '#e6f3ff',
    darkSquare: '#87cefa',
    border: '#4682b4',
    preview: '❄️'
  },
  {
    id: 'garden-green',
    name: 'Garden Green',
    description: 'Verdant tournament green board',
    lightSquare: '#e7f0c2',
    darkSquare: '#7c9b5b',
    border: '#566f3c',
    preview: '🟩'
  },
  {
    id: 'glacier-blue',
    name: 'Glacier Blue',
    description: 'Cool glacier blue analysis board',
    lightSquare: '#b8c7dd',
    darkSquare: '#5f7598',
    border: '#3e516b',
    preview: '🧊'
  },
  {
    id: 'charcoal-outline',
    name: 'Charcoal Outline',
    description: 'Warm charcoal board for outline pieces',
    lightSquare: '#dbcabc',
    darkSquare: '#5d4a43',
    border: '#3b2d27',
    preview: '⬛'
  },
  {
    id: 'royal-onyx',
    name: 'Royal Onyx',
    description: 'Dark onyx board for royal emblems',
    lightSquare: '#5f6673',
    darkSquare: '#2b3037',
    border: '#1f242b',
    preview: '👑'
  }
];

// Piece Skins
export const pieceSkins: PieceSkin[] = [
  {
    id: 'chesscom',
    name: 'Chess.com',
    description: 'Official Chess.com piece style with clean lines and shadows',
    style: 'chesscom',
    pieces: {
      'K': 'chesscom-king', 'Q': 'chesscom-queen', 'R': 'chesscom-rook', 
      'B': 'chesscom-bishop', 'N': 'chesscom-knight', 'P': 'chesscom-pawn',
      'k': 'chesscom-king', 'q': 'chesscom-queen', 'r': 'chesscom-rook', 
      'b': 'chesscom-bishop', 'n': 'chesscom-knight', 'p': 'chesscom-pawn'
    },
    preview: '♔'
  },
  {
    id: 'flat',
    name: 'Flat Outline',
    description: 'Flat filled shapes with dark outlines',
    style: 'flat',
    pieces: {
      'K': 'flat-king', 'Q': 'flat-queen', 'R': 'flat-rook', 'B': 'flat-bishop', 'N': 'flat-knight', 'P': 'flat-pawn',
      'k': 'flat-king', 'q': 'flat-queen', 'r': 'flat-rook', 'b': 'flat-bishop', 'n': 'flat-knight', 'p': 'flat-pawn'
    },
    preview: '♔'
  },
  {
    id: 'garden',
    name: 'Garden Classic',
    description: 'Muted natural palette with soft outline',
    style: 'garden',
    pieces: {
      'K': 'garden-king', 'Q': 'garden-queen', 'R': 'garden-rook', 'B': 'garden-bishop', 'N': 'garden-knight', 'P': 'garden-pawn',
      'k': 'garden-king', 'q': 'garden-queen', 'r': 'garden-rook', 'b': 'garden-bishop', 'n': 'garden-knight', 'p': 'garden-pawn'
    },
    preview: '♔'
  },
  {
    id: 'glacier',
    name: 'Glacier Glow',
    description: 'Cool blues with subtle glow outlines',
    style: 'glacier',
    pieces: {
      'K': 'glacier-king', 'Q': 'glacier-queen', 'R': 'glacier-rook', 'B': 'glacier-bishop', 'N': 'glacier-knight', 'P': 'glacier-pawn',
      'k': 'glacier-king', 'q': 'glacier-queen', 'r': 'glacier-rook', 'b': 'glacier-bishop', 'n': 'glacier-knight', 'p': 'glacier-pawn'
    },
    preview: '♔'
  },
  {
    id: 'outline',
    name: 'Outline Contrast',
    description: 'High-contrast outline set',
    style: 'outline',
    pieces: {
      'K': 'outline-king', 'Q': 'outline-queen', 'R': 'outline-rook', 'B': 'outline-bishop', 'N': 'outline-knight', 'P': 'outline-pawn',
      'k': 'outline-king', 'q': 'outline-queen', 'r': 'outline-rook', 'b': 'outline-bishop', 'n': 'outline-knight', 'p': 'outline-pawn'
    },
    preview: '♔'
  },
  {
    id: 'royal',
    name: 'Royal Emblem',
    description: 'Regal gold/silver with dark strokes',
    style: 'royal',
    pieces: {
      'K': 'royal-king', 'Q': 'royal-queen', 'R': 'royal-rook', 'B': 'royal-bishop', 'N': 'royal-knight', 'P': 'royal-pawn',
      'k': 'royal-king', 'q': 'royal-queen', 'r': 'royal-rook', 'b': 'royal-bishop', 'n': 'royal-knight', 'p': 'royal-pawn'
    },
    preview: '♔'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional Staunton pieces',
    style: 'classic',
    pieces: {
      'K': 'classic-king', 'Q': 'classic-queen', 'R': 'classic-rook', 'B': 'classic-bishop', 'N': 'classic-knight', 'P': 'classic-pawn',
      'k': 'classic-king', 'q': 'classic-queen', 'r': 'classic-rook', 'b': 'classic-bishop', 'n': 'classic-knight', 'p': 'classic-pawn'
    },
    preview: '♔'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Sleek modern pieces',
    style: 'modern',
    pieces: {
      'K': 'modern-king', 'Q': 'modern-queen', 'R': 'modern-rook', 'B': 'modern-bishop', 'N': 'modern-knight', 'P': 'modern-pawn',
      'k': 'modern-king', 'q': 'modern-queen', 'r': 'modern-rook', 'b': 'modern-bishop', 'n': 'modern-knight', 'p': 'modern-pawn'
    },
    preview: '♔'
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Magical fantasy pieces',
    style: 'fantasy',
    pieces: {
      'K': 'fantasy-king', 'Q': 'fantasy-queen', 'R': 'fantasy-rook', 'B': 'fantasy-bishop', 'N': 'fantasy-knight', 'P': 'fantasy-pawn',
      'k': 'fantasy-king', 'q': 'fantasy-queen', 'r': 'fantasy-rook', 'b': 'fantasy-bishop', 'n': 'fantasy-knight', 'p': 'fantasy-pawn'
    },
    preview: '♔'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean minimal pieces',
    style: 'minimal',
    pieces: {
      'K': 'minimal-king', 'Q': 'minimal-queen', 'R': 'minimal-rook', 'B': 'minimal-bishop', 'N': 'minimal-knight', 'P': 'minimal-pawn',
      'k': 'minimal-king', 'q': 'minimal-queen', 'r': 'minimal-rook', 'b': 'minimal-bishop', 'n': 'minimal-knight', 'p': 'minimal-pawn'
    },
    preview: '♔'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Retro vintage pieces',
    style: 'vintage',
    pieces: {
      'K': 'vintage-king', 'Q': 'vintage-queen', 'R': 'vintage-rook', 'B': 'vintage-bishop', 'N': 'vintage-knight', 'P': 'vintage-pawn',
      'k': 'vintage-king', 'q': 'vintage-queen', 'r': 'vintage-rook', 'b': 'vintage-bishop', 'n': 'vintage-knight', 'p': 'vintage-pawn'
    },
    preview: '♔'
  },
  {
    id: 'garden-classic',
    name: 'Garden Classic',
    description: 'Ivory and onyx pieces tailored for verdant boards',
    style: 'garden',
    pieces: {
      'K': 'classic-king', 'Q': 'classic-queen', 'R': 'classic-rook', 'B': 'classic-bishop', 'N': 'classic-knight', 'P': 'classic-pawn',
      'k': 'classic-king', 'q': 'classic-queen', 'r': 'classic-rook', 'b': 'classic-bishop', 'n': 'classic-knight', 'p': 'classic-pawn'
    },
    preview: '♗'
  },
  {
    id: 'glacier-luminous',
    name: 'Glacier Luminous',
    description: 'Frosted sapphire pieces inspired by digital boards',
    style: 'glacier',
    pieces: {
      'K': 'modern-king', 'Q': 'modern-queen', 'R': 'modern-rook', 'B': 'modern-bishop', 'N': 'modern-knight', 'P': 'modern-pawn',
      'k': 'modern-king', 'q': 'modern-queen', 'r': 'modern-rook', 'b': 'modern-bishop', 'n': 'modern-knight', 'p': 'modern-pawn'
    },
    preview: '♘'
  },
  {
    id: 'outline-contrast',
    name: 'Outline Contrast',
    description: 'Flat pieces with bold contrasting outlines',
    style: 'outline',
    pieces: {
      'K': 'minimal-king', 'Q': 'minimal-queen', 'R': 'minimal-rook', 'B': 'minimal-bishop', 'N': 'minimal-knight', 'P': 'minimal-pawn',
      'k': 'minimal-king', 'q': 'minimal-queen', 'r': 'minimal-rook', 'b': 'minimal-bishop', 'n': 'minimal-knight', 'p': 'minimal-pawn'
    },
    preview: '♖'
  },
  {
    id: 'royal-emblem',
    name: 'Royal Emblem',
    description: 'Gilded royalty paired with silver defenders',
    style: 'royal',
    pieces: {
      'K': 'classic-king', 'Q': 'classic-queen', 'R': 'classic-rook', 'B': 'classic-bishop', 'N': 'classic-knight', 'P': 'classic-pawn',
      'k': 'classic-king', 'q': 'classic-queen', 'r': 'classic-rook', 'b': 'classic-bishop', 'n': 'classic-knight', 'p': 'classic-pawn'
    },
    preview: '♕'
  }
];

const resolveBoardSkin = (id: string): BoardSkin => {
  const skin = boardSkins.find(entry => entry.id === id);
  if (!skin) {
    throw new Error(`Board skin with id "${id}" not found`);
  }
  return skin;
};

const resolvePieceSkin = (id: string): PieceSkin => {
  const skin = pieceSkins.find(entry => entry.id === id);
  if (!skin) {
    throw new Error(`Piece skin with id "${id}" not found`);
  }
  return skin;
};

// Complete Themes
export const skinThemes: SkinTheme[] = [
  {
    id: 'chesscom-theme',
    name: 'Chess.com',
    description: 'Official Chess.com look and feel',
    board: resolveBoardSkin('chesscom'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '♜♞♝♛♚♝♞♜'
  },
  {
    id: 'flat-classic-board',
    name: 'Classic Wood',
    description: 'Traditional wooden board with professional pieces',
    board: resolveBoardSkin('classic-wood'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '♜♞♝♛♚♝♞♜'
  },
  {
    id: 'classic-traditional',
    name: 'Marble Elegant',
    description: 'Elegant marble board with professional pieces',
    board: resolveBoardSkin('marble'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '⚪♔'
  },
  {
    id: 'modern-glass',
    name: 'Modern Glass',
    description: 'Sleek glass board with professional pieces',
    board: resolveBoardSkin('glass'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '🔳♔'
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    description: 'Neon board with professional pieces',
    board: resolveBoardSkin('neon'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '💚♔'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Ocean board with professional pieces',
    board: resolveBoardSkin('ocean'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '🌊♔'
  },
  {
    id: 'forest-nature',
    name: 'Forest Nature',
    description: 'Natural forest board with professional pieces',
    board: resolveBoardSkin('forest'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '🌲♔'
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Gold board with professional pieces',
    board: resolveBoardSkin('gold'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '🟡♔'
  },
  {
    id: 'frozen-ice',
    name: 'Frozen Ice',
    description: 'Ice board with professional pieces',
    board: resolveBoardSkin('ice'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '❄️♔'
  },
  {
    id: 'garden-tournament',
    name: 'Garden Tournament',
    description: 'Verdant garden board with professional pieces',
    board: resolveBoardSkin('garden-green'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '🟩♗'
  },
  {
    id: 'glacier-digital',
    name: 'Glacier Digital',
    description: 'Cool blue board with professional pieces',
    board: resolveBoardSkin('glacier-blue'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '🧊♘'
  },
  {
    id: 'charcoal-contrast',
    name: 'Charcoal Contrast',
    description: 'Charcoal board with professional pieces',
    board: resolveBoardSkin('charcoal-outline'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '⬛♖'
  },
  {
    id: 'royal-onyx-emblem',
    name: 'Royal Onyx',
    description: 'Onyx board with professional pieces',
    board: resolveBoardSkin('royal-onyx'),
    pieces: resolvePieceSkin('chesscom'),
    preview: '👑♕'
  }
];

// Default skin
export const defaultSkin: SkinTheme = skinThemes[0];

// Skin storage key
export const SKIN_STORAGE_KEY = 'chess-skin-theme';
