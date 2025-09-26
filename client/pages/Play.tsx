import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, Zap, Brain, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CreateGameRequest, CreateGameResponse, GameSettings } from "@shared/api";
import { apiJson } from "@/lib/api";

export default function Play() {
  const navigate = useNavigate();
  const [creatingGame, setCreatingGame] = useState(false);

  const createGame = async (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'stockfish') => {
    if (creatingGame) return;

    setCreatingGame(true);

    try {
      const gameSettings: GameSettings = {
        timeControl: { initial: 600, increment: 5 }, // 10+5 rapid
        difficulty,
        color: 'white' // Let player be white for now
      };

      const request: CreateGameRequest = { settings: gameSettings };

      const data: CreateGameResponse = await apiJson<CreateGameResponse>(`/game/create`, {
        method: 'POST',
        json: request,
      });

      if (data.success && data.game) {
        navigate(`/game/${data.game.id}`);
      } else {
        console.error('Failed to create game:', data.error);
        alert('Failed to create game. Please try again.');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Please try again.');
    } finally {
      setCreatingGame(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-8">
      {/* Gaming Background */}
      <div className="absolute inset-0 theme-bg"></div>
      <div className="absolute inset-0 theme-overlay"></div>

      {/* Hexagon Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' stroke='%23000' stroke-width='2'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Floating Game Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 right-8 text-5xl text-red-300/20 animate-pulse" style={{animationDelay: '0.5s'}}>⚔️</div>
        <div className="absolute bottom-32 left-8 text-4xl text-rose-300/25 animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}>🏆</div>
        <div className="absolute top-1/3 left-12 text-3xl text-pink-300/20 animate-pulse" style={{animationDelay: '1.5s'}}>⚡</div>
      </div>
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Play vs Bot</h1>
            <p className="text-muted-foreground">Challenge our chess engine</p>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Choose Difficulty</h3>
          <div className="grid gap-4">
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-green-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    Beginner
                  </div>
                  <Badge className="bg-green-100 text-green-700">800-1200</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Perfect for learning basic chess principles and tactics
                </p>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => createGame('beginner')}
                  disabled={creatingGame}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  {creatingGame ? 'Creating...' : 'Start Game'}
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    Intermediate
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">1200-1800</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Challenges your tactical skills and positional understanding
                </p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => createGame('intermediate')}
                  disabled={creatingGame}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  {creatingGame ? 'Creating...' : 'Start Game'}
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-red-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-red-600" />
                    </div>
                    Advanced
                  </div>
                  <Badge className="bg-red-100 text-red-700">1800+</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Maximum engine strength for serious competitive play
                </p>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => createGame('advanced')}
                  disabled={creatingGame}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  {creatingGame ? 'Creating...' : 'Start Game'}
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    Stockfish
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">2400+</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Full Stockfish engine - ultimate chess challenge
                </p>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => createGame('stockfish')}
                  disabled={creatingGame}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  {creatingGame ? 'Creating...' : 'Start Game'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Options */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Game Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold mb-1">10+0</div>
              <div className="text-xs text-muted-foreground">Rapid</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold mb-1">5+3</div>
              <div className="text-xs text-muted-foreground">Blitz</div>
            </Card>
          </div>
        </div>

        {/* Recent Games */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">vs Advanced Bot</div>
                  <div className="text-sm text-muted-foreground">Yesterday • 1-0</div>
                </div>
                <Badge className="bg-green-100 text-green-700">Won</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">vs Intermediate Bot</div>
                  <div className="text-sm text-muted-foreground">2 days ago • 0-1</div>
                </div>
                <Badge className="bg-red-100 text-red-700">Lost</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
