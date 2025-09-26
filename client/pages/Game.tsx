import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Flag, RotateCcw, Clock, User, Bot, Share2 } from "lucide-react";
import InteractiveChessBoard from "@/components/InteractiveChessBoard";
import PositionShare from "@/components/PositionShare";
import { ChessGame, MakeMoveRequest, MakeMoveResponse } from "@shared/api";
import { apiJson } from "@/lib/api";

export default function Game() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<ChessGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (gameId) {
      loadGame();
    }
  }, [gameId]);

  useEffect(() => {
    if (game) {
      const currentTurn = game.currentPosition.turn;
      const isPlayersTurn = (game.playerColor === 'white' && currentTurn === 'w') ||
                           (game.playerColor === 'black' && currentTurn === 'b');
      setIsPlayerTurn(isPlayersTurn && game.status === 'active');
      
      if (game.status !== 'active') {
        setGameResult(getGameResultText(game));
      } else {
        // Analyze current position when game loads
        analyzeCurrentPosition(game.currentPosition.fen);
      }
    }
  }, [game]);

  const loadGame = async () => {
    try {
      const data = await apiJson<any>(`/game/${gameId}`);
      if (data.success) {
        setGame(data.game);
      } else {
        console.error('Failed to load game:', data.error);
        navigate('/play');
      }
    } catch (error) {
      console.error('Error loading game:', error);
      navigate('/play');
    } finally {
      setLoading(false);
    }
  };

  const makeMove = async (move: { from: string; to: string; promotion?: string }) => {
    if (!game || !isPlayerTurn) return;

    try {
      const moveRequest: MakeMoveRequest = {
        gameId: game.id,
        move
      };

      const data: MakeMoveResponse = await apiJson<MakeMoveResponse>(`/game/move`, {
        method: 'POST',
        json: moveRequest,
      });
      if (data.success && data.game) {
        setGame(data.game);
        // Trigger real-time analysis after move
        analyzeCurrentPosition(data.game.currentPosition.fen);
      } else {
        console.error('Move failed:', data.error);
      }
    } catch (error) {
      console.error('Error making move:', error);
    }
  };

  const analyzeCurrentPosition = async (fen: string) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const data = await apiJson<any>(`/analysis/position`, {
        method: 'POST',
        json: { fen, depth: 12 },
      });
      if (data.success && data.analysis) {
        setCurrentAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error analyzing position:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resignGame = async () => {
    if (!game) return;

    try {
      const data = await apiJson<any>(`/game/${game.id}/resign`, { method: 'POST' });
      if (data.success) {
        setGame(data.game);
      }
    } catch (error) {
      console.error('Error resigning:', error);
    }
  };

  const getGameResultText = (game: ChessGame): string => {
    if (game.status === 'active') return '';
    
    if (game.result === '1/2-1/2') return 'Draw';
    
    const playerWon = (game.result === '1-0' && game.playerColor === 'white') ||
                     (game.result === '0-1' && game.playerColor === 'black');
    
    if (game.status === 'resignation') {
      return playerWon ? 'Bot Resigned - You Win!' : 'You Resigned';
    }
    if (game.status === 'checkmate') {
      return playerWon ? 'Checkmate - You Win!' : 'Checkmate - You Lost';
    }
    return game.status;
  };

  const getDifficultyDisplay = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'Beginner (800-1200)';
      case 'intermediate': return 'Intermediate (1200-1800)';
      case 'advanced': return 'Advanced (1800+)';
      case 'stockfish': return 'Stockfish (2400+)';
      default: return difficulty;
    }
  };

  const getTimeDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-8">
        <div className="absolute inset-0 theme-bg"></div>
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading game...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-8">
        <div className="absolute inset-0 theme-bg"></div>
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Game not found</h1>
            <Button asChild>
              <Link to="/play">Back to Play</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-8">
      {/* Gaming Background */}
      <div className="absolute inset-0 theme-bg"></div>
      <div className="absolute inset-0 theme-overlay"></div>
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link to="/play">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chess Game</h1>
            <p className="text-muted-foreground">
              Playing as {game.playerColor} vs {getDifficultyDisplay(game.settings.difficulty)}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                {/* Player Info */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {getDifficultyDisplay(game.settings.difficulty)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {game.playerColor === 'white' ? 'Black' : 'White'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono">
                      {getTimeDisplay(game.settings.timeControl.initial)}
                    </span>
                  </div>
                </div>

                {/* Chess Board */}
                <div className="flex justify-center mb-4">
                  <InteractiveChessBoard
                    fen={game.currentPosition.fen}
                    playerColor={game.playerColor}
                    isPlayerTurn={isPlayerTurn}
                    onMove={makeMove}
                    size="lg"
                    disabled={game.status !== 'active'}
                  />
                </div>

                {/* Player Info */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">You</div>
                      <div className="text-sm text-muted-foreground">
                        {game.playerColor === 'white' ? 'White' : 'Black'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono">
                      {getTimeDisplay(game.settings.timeControl.initial)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info Sidebar */}
          <div className="space-y-4">
            {/* Game Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Game Status</CardTitle>
              </CardHeader>
              <CardContent>
                {gameResult ? (
                  <div className="text-center">
                    <Badge 
                      className={`text-sm mb-3 ${
                        gameResult.includes('Win') ? 'bg-green-100 text-green-700' :
                        gameResult.includes('Lost') ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {gameResult}
                    </Badge>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/play">New Game</Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/history">View History</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-4">
                      <Badge className={isPlayerTurn ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                        {isPlayerTurn ? 'Your Turn' : 'Bot Thinking...'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={resignGame}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Resign
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowShareModal(true)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Position
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Move History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Move History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {game.moves.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">
                      No moves yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {game.moves.map((move, index) => (
                        <div 
                          key={index}
                          className={`p-2 rounded ${
                            move.isPlayerMove ? 'bg-primary/10' : 'bg-muted'
                          }`}
                        >
                          <div className="font-mono text-xs">
                            {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move.san}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Live Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Analyzing...</p>
                  </div>
                ) : currentAnalysis ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-lg text-primary">
                          {currentAnalysis.evaluation.formatted}
                        </div>
                        <div className="text-xs text-muted-foreground">Eval</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-lg">
                          {currentAnalysis.bestMove.san}
                        </div>
                        <div className="text-xs text-muted-foreground">Best</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Depth: {currentAnalysis.depth} •
                      Confidence: {currentAnalysis.confidence}%
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => analyzeCurrentPosition(game.currentPosition.fen)}
                    >
                      Re-analyze
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => analyzeCurrentPosition(game.currentPosition.fen)}
                  >
                    Analyze Position
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Position Share Modal */}
      {showShareModal && (
        <PositionShare
          fen={game.currentPosition.fen}
          analysis={currentAnalysis}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
