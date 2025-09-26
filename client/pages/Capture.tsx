import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, RotateCcw, Play, Eye, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ChessBoard from "@/components/ChessBoard";
import { ImageAnalysisRequest, ImageAnalysisResponse } from "@shared/api";
import { apiJson } from "@/lib/api";

export default function Capture() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        setShowCamera(false);
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePosition = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);

    try {
      const request: ImageAnalysisRequest = {
        imageData: capturedImage,
        options: { timeout: 10000 }
      };

      const data: ImageAnalysisResponse = await apiJson<ImageAnalysisResponse>(`/analysis/image`, {
        method: 'POST',
        json: request,
      });

      if (data.success && data.analysis) {
        setAnalysisResult({
          position: data.analysis.position.fen,
          evaluation: data.analysis.evaluation.formatted,
          bestMove: data.analysis.bestMove.san,
          confidence: data.confidence || data.analysis.confidence
        });
      } else {
        console.error('Analysis failed:', data.error);
        alert('Failed to analyze position: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error analyzing position:', error);
      alert('Failed to analyze position. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setShowCamera(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-8">
      {/* Dynamic Camera Background */}
      <div className="absolute inset-0 theme-bg"></div>
      <div className="absolute inset-0 theme-overlay"></div>

      {/* Animated Dots Pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="h-full w-full" style={{
          backgroundImage: `radial-gradient(circle, #000 2px, transparent 2px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      <div className="container mx-auto px-4 max-w-md relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Take Picture</h1>
            <p className="text-muted-foreground">Capture a chess position</p>
          </div>
        </div>

        {/* Camera View */}
        {showCamera && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-primary"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-primary"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-primary"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-primary"></div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={() => setShowCamera(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Captured Image */}
        {capturedImage && !showCamera && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Captured Position
                <Badge variant="secondary" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Ready to analyze
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <img
                  src={capturedImage}
                  alt="Captured chess position"
                  className="w-full rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={analyzePosition} 
                  disabled={isAnalyzing}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Analyze Position
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetCapture}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Analysis Results
                <Badge className="text-xs">
                  {analysisResult.confidence}% confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chess Board */}
              <div className="flex justify-center">
                <ChessBoard 
                  fen={analysisResult.position} 
                  size="md"
                  highlightSquares={[]}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {analysisResult.evaluation}
                  </div>
                  <div className="text-sm text-muted-foreground">Evaluation</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {analysisResult.bestMove}
                  </div>
                  <div className="text-sm text-muted-foreground">Best Move</div>
                </div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-sm font-medium mb-1">Position (FEN):</div>
                <div className="text-xs font-mono text-muted-foreground break-all">
                  {analysisResult.position}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Capture Options */}
        {!capturedImage && !showCamera && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Capture Chess Position</h3>
                    <p className="text-sm text-muted-foreground">
                      Take a photo of any chess board to analyze the position
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              <Button onClick={startCamera} size="lg" className="h-14">
                <Camera className="w-5 h-5 mr-3" />
                Take Photo
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 mr-3" />
                Upload Image
              </Button>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
