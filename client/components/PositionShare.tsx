import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Copy, 
  Download, 
  FileText, 
  Image as ImageIcon,
  Link as LinkIcon,
  Check 
} from "lucide-react";
import { ChessAnalysis } from "@shared/api";

interface PositionShareProps {
  fen: string;
  analysis?: ChessAnalysis;
  onClose: () => void;
}

export default function PositionShare({ fen, analysis, onClose }: PositionShareProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generatePGN = (): string => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    let pgn = `[Event "ChessVision Analysis"]
[Site "ChessVision App"]
[Date "${date}"]
[Round "1"]
[White "Analysis"]
[Black "Position"]
[Result "*"]
[FEN "${fen}"]
[SetUp "1"]

`;

    if (analysis && includeAnalysis) {
      pgn += `{Position Analysis: ${analysis.evaluation.formatted}, Best move: ${analysis.bestMove.san}} *`;
    } else {
      pgn += '*';
    }

    return pgn;
  };

  const generateShareableLink = (): string => {
    const encodedFen = encodeURIComponent(fen);
    return `${window.location.origin}/analyze?fen=${encodedFen}`;
  };

  const generateLichessLink = (): string => {
    const encodedFen = encodeURIComponent(fen);
    return `https://lichess.org/analysis/${encodedFen.replace(/%20/g, '_')}`;
  };

  const generateChesscomLink = (): string => {
    const encodedFen = encodeURIComponent(fen);
    return `https://www.chess.com/analysis?fen=${encodedFen}`;
  };

  const downloadPGN = () => {
    const pgnContent = generatePGN();
    const blob = new Blob([pgnContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess_position_${new Date().toISOString().split('T')[0]}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const exportData = {
      fen,
      analysis: includeAnalysis ? analysis : null,
      timestamp: new Date().toISOString(),
      source: 'ChessVision'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess_analysis_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chess Position - ChessVision',
          text: `Check out this chess position: FEN ${fen}`,
          url: generateShareableLink()
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share & Export Position
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analysis Toggle */}
          {analysis && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeAnalysis"
                checked={includeAnalysis}
                onChange={(e) => setIncludeAnalysis(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="includeAnalysis">Include analysis data</Label>
              {includeAnalysis && (
                <Badge variant="secondary">
                  {analysis.evaluation.formatted} • {analysis.bestMove.san}
                </Badge>
              )}
            </div>
          )}

          {/* FEN String */}
          <div className="space-y-2">
            <Label>FEN Notation</Label>
            <div className="flex gap-2">
              <Input value={fen} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(fen, 'fen')}
              >
                {copied === 'fen' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Shareable Links */}
          <div className="space-y-3">
            <Label>Quick Share</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Native Share */}
              {navigator.share && (
                <Button variant="outline" onClick={shareNative} className="justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share via Device
                </Button>
              )}

              {/* ChessVision Link */}
              <Button
                variant="outline"
                onClick={() => copyToClipboard(generateShareableLink(), 'link')}
                className="justify-start"
              >
                {copied === 'link' ? <Check className="w-4 h-4 mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                Copy ChessVision Link
              </Button>

              {/* Lichess */}
              <Button
                variant="outline"
                onClick={() => window.open(generateLichessLink(), '_blank')}
                className="justify-start"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Open in Lichess
              </Button>

              {/* Chess.com */}
              <Button
                variant="outline"
                onClick={() => window.open(generateChesscomLink(), '_blank')}
                className="justify-start"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Open in Chess.com
              </Button>
            </div>
          </div>

          {/* PGN Export */}
          <div className="space-y-2">
            <Label>PGN Format</Label>
            <Textarea
              value={generatePGN()}
              readOnly
              className="font-mono text-sm h-32"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(generatePGN(), 'pgn')}
              >
                {copied === 'pgn' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy PGN
              </Button>
              <Button variant="outline" onClick={downloadPGN}>
                <Download className="w-4 h-4 mr-2" />
                Download PGN
              </Button>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label>Export Data</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" onClick={downloadJSON}>
                <FileText className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
              <Button variant="outline" onClick={downloadPGN}>
                <Download className="w-4 h-4 mr-2" />
                Export as PGN
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
