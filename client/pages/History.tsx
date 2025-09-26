import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, RotateCcw, Trash2, Trophy, Target } from "lucide-react";
import { Link } from "react-router-dom";
import ChessBoard from "@/components/ChessBoard";
import PositionShare from "@/components/PositionShare";
import { GetHistoryResponse, AnalysisHistory, GameHistory } from "@shared/api";
import { apiJson } from "@/lib/api";

export default function History() {
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([]);
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analyses' | 'games'>('analyses');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data: GetHistoryResponse = await apiJson<GetHistoryResponse>(`/user/history?analysisLimit=10&gameLimit=10`);
      
      if (data.success) {
        setAnalyses(data.analyses || []);
        setGames(data.games || []);
      } else {
        console.error('Failed to load history:', data.error);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const data = await apiJson<any>(`/analysis/${id}`, { method: 'DELETE' });
      
      if (data.success) {
        setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      } else {
        console.error('Failed to delete analysis:', data.error);
        alert('Failed to delete analysis');
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      alert('Failed to delete analysis');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      camera: 'bg-blue-100 text-blue-700',
      upload: 'bg-green-100 text-green-700',
      manual: 'bg-purple-100 text-purple-700'
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  };

  const getGameResultBadge = (game: GameHistory) => {
    if (!game.game.result) return null;
    
    const playerWon = (game.game.result === '1-0' && game.game.playerColor === 'white') ||
                     (game.game.result === '0-1' && game.game.playerColor === 'black');
    
    if (game.game.result === '1/2-1/2') {
      return <Badge className="bg-blue-100 text-blue-700">Draw</Badge>;
    }
    
    return playerWon ? 
      <Badge className="bg-green-100 text-green-700">Won</Badge> :
      <Badge className="bg-red-100 text-red-700">Lost</Badge>;
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-8">
      {/* History Background */}
      <div className="absolute inset-0 theme-bg"></div>
      <div className="absolute inset-0 theme-overlay"></div>
      
      {/* Timeline Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='80' viewBox='0 0 20 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23000'/%3E%3Cline x1='10' y1='12' x2='10' y2='68' stroke='%23000' stroke-width='1'/%3E%3Ccircle cx='10' cy='70' r='2' fill='%23000'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '20px 80px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">History</h1>
          <p className="text-muted-foreground">
            Review your chess analyses and games
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'analyses' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('analyses')}
              className="px-6"
            >
              Analyses ({analyses.length})
            </Button>
            <Button
              variant={activeTab === 'games' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('games')}
              className="px-6"
            >
              Games ({games.length})
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading history...</p>
          </div>
        ) : activeTab === 'analyses' ? (
          analyses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No Analysis History</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start analyzing chess positions to see your history here
                </p>
                <Button asChild>
                  <Link to="/capture">
                    <Eye className="w-4 h-4 mr-2" />
                    Analyze Position
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Position Analysis
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getSourceBadge(analysis.source)}>
                          {analysis.source}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {analysis.analysis.confidence}% confidence
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(analysis.timestamp)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <ChessBoard 
                        fen={analysis.position.fen} 
                        size="sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-primary">
                          {analysis.analysis.evaluation.formatted}
                        </div>
                        <div className="text-xs text-muted-foreground">Evaluation</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-xl font-bold">
                          {analysis.analysis.bestMove.san}
                        </div>
                        <div className="text-xs text-muted-foreground">Best Move</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedAnalysis(analysis)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAnalysis(analysis.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          games.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No Game History</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Play games against the bot to see your history here
                </p>
                <Button asChild>
                  <Link to="/play">
                    <Target className="w-4 h-4 mr-2" />
                    Play Game
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {games.map((gameHistory) => (
                <Card key={gameHistory.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        vs {gameHistory.game.settings.difficulty} Bot
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getGameResultBadge(gameHistory)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(gameHistory.game.startTime)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <ChessBoard 
                        fen={gameHistory.game.currentPosition.fen} 
                        size="sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">
                          {gameHistory.game.moves.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Moves</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">
                          {gameHistory.game.playerColor}
                        </div>
                        <div className="text-xs text-muted-foreground">Your Color</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {gameHistory.ratingChange > 0 ? '+' : ''}{gameHistory.ratingChange}
                        </div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to={`/game/${gameHistory.game.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Game
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to="/play">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Rematch
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
      {selectedAnalysis && (
        <PositionShare
          fen={selectedAnalysis.position.fen}
          analysis={selectedAnalysis.analysis}
          onClose={() => setSelectedAnalysis(null)}
        />
      )}
    </div>
  );
}
