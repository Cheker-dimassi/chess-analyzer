import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Camera, Monitor, Smartphone, Palette, Zap, Brain, Volume2 } from "lucide-react";
import { useTheme } from "next-themes";

export default function Settings() {
  const [autoCapture, setAutoCapture] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [analysisDepth, setAnalysisDepth] = useState([15]);
  const [cameraQuality, setCameraQuality] = useState("hd");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("settings");
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.autoCapture === "boolean") setAutoCapture(s.autoCapture);
        if (typeof s.soundEnabled === "boolean") setSoundEnabled(s.soundEnabled);
        if (typeof s.analysisDepth === "number") setAnalysisDepth([s.analysisDepth]);
        if (typeof s.cameraQuality === "string") setCameraQuality(s.cameraQuality);
        if (typeof s.theme === "string") setTheme(s.theme);
      }
    } catch {}
  }, [setTheme]);

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-8">
      {/* Settings Background */}
      <div className="absolute inset-0 theme-bg"></div>
      <div className="absolute inset-0 theme-overlay"></div>

      {/* Gear Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M25 2.5L30 7.5L35 2.5L42.5 10L47.5 15L42.5 20L47.5 25L42.5 30L47.5 35L42.5 40L47.5 45L35 47.5L30 42.5L25 47.5L20 42.5L15 47.5L7.5 40L2.5 35L7.5 30L2.5 25L7.5 20L2.5 15L7.5 10L2.5 5L15 2.5L20 7.5z' stroke='%23000' stroke-width='1'/%3E%3Ccircle cx='25' cy='25' r='8' stroke='%23000' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your chess analysis experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Camera Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camera Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-capture</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically capture when a board is detected
                  </p>
                </div>
                <Switch
                  checked={autoCapture}
                  onCheckedChange={setAutoCapture}
                />
              </div>

              <div className="space-y-2">
                <Label>Camera Quality</Label>
                <Select value={cameraQuality} onValueChange={setCameraQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sd">Standard (720p)</SelectItem>
                    <SelectItem value="hd">HD (1080p)</SelectItem>
                    <SelectItem value="4k">4K (2160p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Analysis Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Analysis Depth</Label>
                  <Badge variant="secondary">{analysisDepth[0]} moves</Badge>
                </div>
                <Slider
                  value={analysisDepth}
                  onValueChange={setAnalysisDepth}
                  max={25}
                  min={5}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Higher depth provides more accurate analysis but takes longer
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(v) => setTheme(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for captures and analysis completion
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About ChessVision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engine</span>
                  <span>Stockfish 16</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Model</span>
                  <span>ChessVision v2.1</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Powered by advanced computer vision and chess engine analysis
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              const payload = {
                autoCapture,
                soundEnabled,
                analysisDepth: analysisDepth[0],
                cameraQuality,
                theme,
              };
              try {
                localStorage.setItem("settings", JSON.stringify(payload));
                alert("Settings saved");
              } catch {}
            }}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
