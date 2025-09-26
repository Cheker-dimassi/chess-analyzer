import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, TrendingUp, Clock, Target } from "lucide-react";
import ChessBoard from "@/components/ChessBoard";

interface Opening {
  name: string;
  eco: string; // Encyclopedia of Chess Openings code
  moves: string[];
  fen: string;
  description: string;
  popularity: number; // 1-100
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  mainLine: boolean;
  stats: {
    white: number;
    draw: number;
    black: number;
  };
}

const openingDatabase: Opening[] = [
  {
    name: "Italian Game",
    eco: "C50",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    description: "A classical opening focusing on rapid development and central control",
    popularity: 85,
    difficulty: 'beginner',
    mainLine: true,
    stats: { white: 45, draw: 25, black: 30 }
  },
  {
    name: "Sicilian Defense",
    eco: "B20",
    moves: ["e4", "c5"],
    fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
    description: "The most popular and complex defense against 1.e4",
    popularity: 95,
    difficulty: 'intermediate',
    mainLine: true,
    stats: { white: 35, draw: 20, black: 45 }
  },
  {
    name: "Queen's Gambit",
    eco: "D06",
    moves: ["d4", "d5", "c4"],
    fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
    description: "A solid positional opening offering space advantage",
    popularity: 80,
    difficulty: 'intermediate',
    mainLine: true,
    stats: { white: 50, draw: 30, black: 20 }
  },
  {
    name: "French Defense",
    eco: "C00",
    moves: ["e4", "e6"],
    fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    description: "Solid but slightly passive defense leading to pawn chains",
    popularity: 60,
    difficulty: 'intermediate',
    mainLine: true,
    stats: { white: 40, draw: 35, black: 25 }
  },
  {
    name: "Ruy Lopez",
    eco: "C60",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    description: "The Spanish Opening, focusing on pressure against Black's center",
    popularity: 75,
    difficulty: 'advanced',
    mainLine: true,
    stats: { white: 48, draw: 28, black: 24 }
  },
  {
    name: "King's Indian Defense",
    eco: "E60",
    moves: ["d4", "Nf6", "c4", "g6"],
    fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    description: "Hypermodern defense allowing White center before counterattacking",
    popularity: 70,
    difficulty: 'advanced',
    mainLine: true,
    stats: { white: 42, draw: 25, black: 33 }
  },
  {
    name: "Caro-Kann Defense",
    eco: "B10",
    moves: ["e4", "c6"],
    fen: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    description: "Solid defense avoiding pawn weaknesses",
    popularity: 55,
    difficulty: 'intermediate',
    mainLine: true,
    stats: { white: 38, draw: 40, black: 22 }
  },
  {
    name: "English Opening",
    eco: "A10",
    moves: ["c4"],
    fen: "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1",
    description: "Flexible opening controlling central squares from the side",
    popularity: 65,
    difficulty: 'intermediate',
    mainLine: true,
    stats: { white: 46, draw: 32, black: 22 }
  }
];

interface OpeningBookProps {
  currentFen?: string;
  onOpeningSelect?: (opening: Opening) => void;
  showAnalysis?: boolean;
}

export default function OpeningBook({ currentFen, onOpeningSelect, showAnalysis = true }: OpeningBookProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [filteredOpenings, setFilteredOpenings] = useState<Opening[]>(openingDatabase);
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);

  useEffect(() => {
    let filtered = openingDatabase;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(opening =>
        opening.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opening.eco.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opening.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(opening => opening.difficulty === selectedDifficulty);
    }

    // Sort by popularity
    filtered.sort((a, b) => b.popularity - a.popularity);

    setFilteredOpenings(filtered);
  }, [searchTerm, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getWinRateColor = (winRate: number): string => {
    if (winRate >= 45) return 'text-green-600';
    if (winRate >= 35) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleOpeningClick = (opening: Opening) => {
    setSelectedOpening(opening);
    if (onOpeningSelect) {
      onOpeningSelect(opening);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Opening Book</h2>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search openings, ECO codes, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty(difficulty)}
              className="capitalize"
            >
              {difficulty}
            </Button>
          ))}
        </div>
      </div>

      {/* Opening Detail */}
      {selectedOpening && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {selectedOpening.name}
                <Badge variant="secondary">{selectedOpening.eco}</Badge>
              </CardTitle>
              <Badge className={getDifficultyColor(selectedOpening.difficulty)}>
                {selectedOpening.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <ChessBoard
                  fen={selectedOpening.fen}
                  size="md"
                />
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {selectedOpening.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Moves:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedOpening.moves.map((move, index) => (
                      <Badge key={index} variant="outline" className="font-mono">
                        {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'} {move}
                      </Badge>
                    ))}
                  </div>
                </div>

                {showAnalysis && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Statistics:</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 bg-muted rounded">
                        <div className={`font-bold ${getWinRateColor(selectedOpening.stats.white)}`}>
                          {selectedOpening.stats.white}%
                        </div>
                        <div className="text-xs text-muted-foreground">White</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-bold text-blue-600">
                          {selectedOpening.stats.draw}%
                        </div>
                        <div className="text-xs text-muted-foreground">Draw</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className={`font-bold ${getWinRateColor(selectedOpening.stats.black)}`}>
                          {selectedOpening.stats.black}%
                        </div>
                        <div className="text-xs text-muted-foreground">Black</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Popularity: {selectedOpening.popularity}%
                      </div>
                      {selectedOpening.mainLine && (
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Main Line
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opening List */}
      <div className="grid gap-3">
        {filteredOpenings.map((opening, index) => (
          <Card 
            key={opening.eco}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedOpening?.eco === opening.eco ? 'border-primary' : ''
            }`}
            onClick={() => handleOpeningClick(opening)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{opening.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {opening.eco}
                    </Badge>
                    <Badge className={getDifficultyColor(opening.difficulty)}>
                      {opening.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {opening.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {opening.popularity}% popular
                    </div>
                    <div>
                      W: {opening.stats.white}% | D: {opening.stats.draw}% | B: {opening.stats.black}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {opening.mainLine && (
                    <Badge variant="outline" className="text-xs">
                      Main Line
                    </Badge>
                  )}
                  <div className="text-right">
                    <div className="text-sm font-mono">
                      {opening.moves.slice(0, 3).join(' ')}
                      {opening.moves.length > 3 && '...'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOpenings.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No openings found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or difficulty filter
          </p>
        </div>
      )}
    </div>
  );
}
