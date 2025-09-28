import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AnalysisBoard from "@/components/AnalysisBoard";
import PositionEditor from "@/components/PositionEditor";
import { ArrowLeft, Upload, Edit, Brain, Share2, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Chess } from "chess.js";

export default function AnalysisBoardPage() {
  const [searchParams] = useSearchParams();
  const initialFen = searchParams.get('fen') || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  
  const [fenDialogOpen, setFenDialogOpen] = useState(false);
  const [fenInput, setFenInput] = useState(initialFen);
  const [currentFen, setCurrentFen] = useState(initialFen);
  const [positionEditorOpen, setPositionEditorOpen] = useState(false);
  
  const isFenValid = (() => {
    try {
      const c = new Chess();
      c.load(fenInput || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
      return true;
    } catch {
      return false;
    }
  })();

  const handleFenSubmit = () => {
    if (isFenValid) {
      setCurrentFen(fenInput);
      setFenDialogOpen(false);
    }
  };

  const sharePosition = () => {
    const url = `${window.location.origin}/analysis?fen=${encodeURIComponent(currentFen)}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-8">
      {/* Analysis Background */}
      <div className="absolute inset-0 theme-bg"></div>
      <div className="absolute inset-0 theme-overlay"></div>

      {/* Circuit Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0 0c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z' stroke='%23000' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/analyze">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Chess Analysis Board</h1>
              <p className="text-muted-foreground">Interactive position analysis with engine evaluation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPositionEditorOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Position
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFenDialogOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Load FEN
            </Button>
            <Button variant="outline" size="sm" onClick={sharePosition}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Analysis Board */}
        <Card>
          <CardContent className="p-6">
            <AnalysisBoard 
              initialFen={currentFen}
              size="lg"
              showCoordinates={true}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                Upload Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Upload an image of a chess position for automatic recognition
              </p>
              <Button className="w-full" asChild>
                <Link to="/capture">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-accent" />
                </div>
                Opening Explorer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Explore opening theory and master games
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/openings">
                  <Brain className="w-4 h-4 mr-2" />
                  Open Explorer
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-destructive" />
                </div>
                Position Editor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Set up custom positions for analysis
              </p>
              <Button variant="outline" className="w-full" onClick={() => setPositionEditorOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Position
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FEN Dialog */}
      <Dialog open={fenDialogOpen} onOpenChange={setFenDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Position from FEN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">FEN String</label>
              <Input
                placeholder="e.g. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            
            {isFenValid && (
              <div className="flex justify-center p-4 bg-muted rounded-lg">
                <div className="w-32 h-32">
                  <AnalysisBoard 
                    initialFen={fenInput} 
                    size="sm" 
                    showCoordinates={false}
                  />
                </div>
              </div>
            )}
            
            {!isFenValid && fenInput && (
              <p className="text-sm text-destructive">Invalid FEN. Please check and try again.</p>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFenDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleFenSubmit}
                disabled={!isFenValid}
              >
                Load Position
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Position Editor */}
      <PositionEditor
        initialFen={currentFen}
        onFenChange={setCurrentFen}
        isOpen={positionEditorOpen}
        onClose={() => setPositionEditorOpen(false)}
      />
    </div>
  );
}
