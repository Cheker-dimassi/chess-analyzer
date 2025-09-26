import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChessBoard from "@/components/ChessBoard";
import { ArrowLeft, Upload, Edit, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { Chess } from "chess.js";

export default function Analyze() {
  const [fenDialogOpen, setFenDialogOpen] = useState(false);
  const [fenInput, setFenInput] = useState("");
  const isFenValid = (() => {
    try {
      const c = new Chess();
      c.load(fenInput || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
      return true;
    } catch {
      return false;
    }
  })();

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
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analyze Position</h1>
            <p className="text-muted-foreground">Deep chess engine analysis</p>
          </div>
        </div>

        {/* Analysis Options */}
        <div className="grid gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                Upload Chess Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Upload an image of a chess position for automatic recognition and analysis
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
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-accent" />
                </div>
                Manual Position Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Set up a chess position manually using an interactive board editor
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/play">
                  <Edit className="w-4 h-4 mr-2" />
                  Setup Position
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-destructive" />
                </div>
                Analyze from FEN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Enter a FEN string directly for instant position analysis
              </p>
              <Button variant="outline" className="w-full" onClick={() => setFenDialogOpen(true)}>
                <Brain className="w-4 h-4 mr-2" />
                Enter FEN
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" size="lg" className="h-16" onClick={() => { setFenInput("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"); setFenDialogOpen(true); }}>
              Starting Position
            </Button>
            <Button variant="outline" size="lg" className="h-16" asChild>
              <Link to="/openings">Famous Games</Link>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={fenDialogOpen} onOpenChange={setFenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter FEN</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="e.g. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              value={fenInput}
              onChange={(e) => setFenInput(e.target.value)}
            />
            {isFenValid && (
              <div className="flex justify-center">
                <ChessBoard fen={fenInput} size="sm" />
              </div>
            )}
            {!isFenValid && fenInput && (
              <p className="text-sm text-destructive">Invalid FEN. Please check and try again.</p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFenDialogOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
