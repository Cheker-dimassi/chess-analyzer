import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Crown, Target, Zap, Users, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CreateGameRequest, CreateGameResponse, GameSettings } from "@shared/api";
import { apiJson } from "@/lib/api";

interface TournamentData {
  id: string;
  name: string;
  description: string;
  opponents: Array<{
    name: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'stockfish';
    rating: number;
    defeated: boolean;
  }>;
  currentRound: number;
  totalRounds: number;
  playerRating: number;
  prize: string;
}

const tournaments: TournamentData[] = [
  {
    id: 'novice_cup',
    name: 'Novice Cup',
    description: 'Perfect for beginners learning the game',
    opponents: [
      { name: 'Training Bot', difficulty: 'beginner', rating: 800, defeated: false },
      { name: 'Learning Assistant', difficulty: 'beginner', rating: 900, defeated: false },
      { name: 'Practice Partner', difficulty: 'beginner', rating: 1000, defeated: false },
    ],
    currentRound: 1,
    totalRounds: 3,
    playerRating: 1200,
    prize: 'Novice Champion Badge'
  },
  {
    id: 'rising_star',
    name: 'Rising Star Championship',
    description: 'Intermediate tournament for developing players',
    opponents: [
      { name: 'Club Player', difficulty: 'intermediate', rating: 1200, defeated: false },
      { name: 'Tournament Regular', difficulty: 'intermediate', rating: 1400, defeated: false },
      { name: 'Advanced Student', difficulty: 'intermediate', rating: 1600, defeated: false },
      { name: 'Expert Candidate', difficulty: 'advanced', rating: 1800, defeated: false },
    ],
    currentRound: 1,
    totalRounds: 4,
    playerRating: 1200,
    prize: '200 Rating Points'
  },
  {
    id: 'masters_gauntlet',
    name: 'Masters Gauntlet',
    description: 'Ultimate challenge against the strongest opponents',
    opponents: [
      { name: 'Expert Player', difficulty: 'advanced', rating: 1800, defeated: false },
      { name: 'Master Candidate', difficulty: 'advanced', rating: 2000, defeated: false },
      { name: 'Chess Master', difficulty: 'advanced', rating: 2200, defeated: false },
      { name: 'Stockfish Engine', difficulty: 'stockfish', rating: 2400, defeated: false },
    ],
    currentRound: 1,
    totalRounds: 4,
    playerRating: 1200,
    prize: 'Chess Master Title'
  }
];

export default function Tournament() {
  const navigate = useNavigate();
  const [selectedTournament, setSelectedTournament] = useState<TournamentData | null>(null);
  const [activeTournaments, setActiveTournaments] = useState<TournamentData[]>([]);
  const [creatingGame, setCreatingGame] = useState(false);

  useEffect(() => {
    // Load tournament progress from localStorage
    const saved = localStorage.getItem('chessvision_tournaments');
    if (saved) {
      try {
        const savedTournaments = JSON.parse(saved);
        setActiveTournaments(savedTournaments);
      } catch (error) {
        console.error('Error loading tournaments:', error);
      }
    }
  }, []);

  const saveTournamentProgress = (tournament: TournamentData) => {
    const existing = activeTournaments.find(t => t.id === tournament.id);
    let updated: TournamentData[];
    
    if (existing) {
      updated = activeTournaments.map(t => t.id === tournament.id ? tournament : t);
    } else {
      updated = [...activeTournaments, tournament];
    }
    
    setActiveTournaments(updated);
    localStorage.setItem('chessvision_tournaments', JSON.stringify(updated));
  };

  const startTournament = (tournament: TournamentData) => {
    const activeTournament = { ...tournament };
    saveTournamentProgress(activeTournament);
    setSelectedTournament(activeTournament);
  };

  const playNextRound = async (tournament: TournamentData) => {
    if (creatingGame) return;
    
    const currentOpponent = tournament.opponents[tournament.currentRound - 1];
    if (!currentOpponent || currentOpponent.defeated) return;

    setCreatingGame(true);
    
    try {
      const gameSettings: GameSettings = {
        timeControl: { initial: 600, increment: 5 },
        difficulty: currentOpponent.difficulty,
        color: 'white'
      };

      const request: CreateGameRequest = { settings: gameSettings };
      
      const data: CreateGameResponse = await apiJson<CreateGameResponse>(`/game/create`, {
        method: 'POST',
        json: request,
      });
      
      if (data.success && data.game) {
        // Store tournament context for the game
        sessionStorage.setItem('tournament_context', JSON.stringify({
          tournamentId: tournament.id,
          round: tournament.currentRound,
          opponentName: currentOpponent.name
        }));
        
        navigate(`/game/${data.game.id}`);
      } else {
        console.error('Failed to create tournament game:', data.error);
        alert('Failed to create game. Please try again.');
      }
    } catch (error) {
      console.error('Error creating tournament game:', error);
      alert('Failed to create game. Please try again.');
    } finally {
      setCreatingGame(false);
    }
  };

  const getTournamentProgress = (tournament: TournamentData): number => {
    const defeatedCount = tournament.opponents.filter(o => o.defeated).length;
    return (defeatedCount / tournament.totalRounds) * 100;
  };

  const isCurrentRoundCompleted = (tournament: TournamentData): boolean => {
    const currentOpponent = tournament.opponents[tournament.currentRound - 1];
    return currentOpponent?.defeated || false;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      case 'stockfish': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-8">
      {/* Tournament Background */}
      <div className="absolute inset-0 theme-bg"></div>
      <div className="absolute inset-0 theme-overlay"></div>
      
      {/* Trophy Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 10L35 20L45 20L37 28L40 40L30 35L20 40L23 28L15 20L25 20Z' stroke='%23000' stroke-width='2'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link to="/play">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8 text-amber-600" />
              Tournament Mode
            </h1>
            <p className="text-muted-foreground">
              Challenge yourself in structured competitions
            </p>
          </div>
        </div>

        {selectedTournament ? (
          /* Tournament Detail View */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Crown className="w-6 h-6 text-amber-600" />
                      {selectedTournament.name}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {selectedTournament.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTournament(null)}
                  >
                    Back to Tournaments
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Tournament Progress</h3>
                    <Progress value={getTournamentProgress(selectedTournament)} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Round {selectedTournament.currentRound} of {selectedTournament.totalRounds}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Prize</h3>
                    <Badge className="bg-amber-100 text-amber-700 text-sm">
                      {selectedTournament.prize}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opponents */}
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold">Opponents</h2>
              {selectedTournament.opponents.map((opponent, index) => (
                <Card key={index} className={cn(
                  "transition-all duration-200",
                  opponent.defeated ? "bg-green-50 border-green-200" : 
                  index === selectedTournament.currentRound - 1 ? "border-primary" : ""
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          {opponent.defeated ? (
                            <Trophy className="w-6 h-6 text-green-600" />
                          ) : (
                            <Target className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{opponent.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(opponent.difficulty)}>
                              {opponent.difficulty}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {opponent.rating} rating
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        {opponent.defeated ? (
                          <Badge className="bg-green-100 text-green-700">
                            Defeated
                          </Badge>
                        ) : index === selectedTournament.currentRound - 1 ? (
                          <Button 
                            onClick={() => playNextRound(selectedTournament)}
                            disabled={creatingGame}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {creatingGame ? 'Starting...' : 'Play Now'}
                          </Button>
                        ) : index < selectedTournament.currentRound - 1 ? (
                          <Badge variant="secondary">Skipped</Badge>
                        ) : (
                          <Badge variant="outline">Upcoming</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Tournament Selection */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => {
              const activeTournament = activeTournaments.find(t => t.id === tournament.id);
              const progress = activeTournament ? getTournamentProgress(activeTournament) : 0;
              const isCompleted = progress === 100;
              
              return (
                <Card key={tournament.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {isCompleted ? (
                        <Crown className="w-5 h-5 text-amber-600" />
                      ) : activeTournament ? (
                        <Users className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Trophy className="w-5 h-5 text-muted-foreground" />
                      )}
                      {tournament.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {tournament.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Opponents:</span> {tournament.totalRounds}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Prize:</span> {tournament.prize}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => activeTournament ? setSelectedTournament(activeTournament) : startTournament(tournament)}
                    >
                      {isCompleted ? 'View Results' : 
                       activeTournament ? 'Continue Tournament' : 'Start Tournament'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
