import { useState } from "react";
import { useSkin } from "@/hooks/useSkin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Palette, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import SkinnedPiece from "./SkinnedPiece";

interface SkinSelectorProps {
  className?: string;
}

export default function SkinSelector({ className }: SkinSelectorProps) {
  const { currentSkin, setSkin, availableSkins, resetToDefault } = useSkin();
  const [isOpen, setIsOpen] = useState(false);

  const handleSkinSelect = (skin: typeof availableSkins[0]) => {
    setSkin(skin);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("gap-2", className)}
      >
        <Palette className="w-4 h-4" />
        {currentSkin.name}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Choose Chess Theme
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Theme Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Current Theme</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded border-2 border-primary flex items-center justify-center text-2xl">
                  {currentSkin.preview}
                </div>
                <div>
                  <div className="font-medium">{currentSkin.name}</div>
                  <div className="text-sm text-muted-foreground">{currentSkin.description}</div>
                </div>
              </div>
            </div>

            {/* Theme Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSkins.map((skin) => (
                <Card
                  key={skin.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-lg",
                    currentSkin.id === skin.id && "ring-2 ring-primary"
                  )}
                  onClick={() => handleSkinSelect(skin)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{skin.name}</CardTitle>
                      {currentSkin.id === skin.id && (
                        <Badge variant="default" className="gap-1">
                          <Check className="w-3 h-3" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{skin.description}</p>
                  </CardHeader>
                  <CardContent>
                    {/* Board Preview */}
                    <div className="mb-4">
                      <div className="text-xs font-medium mb-2">Board</div>
                      <div className="w-20 h-20 grid grid-cols-4 grid-rows-4 border-2 border-gray-300 rounded overflow-hidden">
                        {Array.from({ length: 16 }, (_, i) => {
                          const isLight = (Math.floor(i / 4) + (i % 4)) % 2 === 0;
                          return (
                            <div
                              key={i}
                              className="w-full h-full"
                              style={{
                                backgroundColor: isLight ? skin.board.lightSquare : skin.board.darkSquare
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Piece Preview */}
                    <div>
                      <div className="text-xs font-medium mb-2">Pieces ({skin.pieces.style})</div>
                      <div className="flex gap-1">
                        <div className="w-6 h-6 border rounded flex items-center justify-center text-sm bg-white">
                          <SkinnedPiece piece="K" size={16} />
                        </div>
                        <div className="w-6 h-6 border rounded flex items-center justify-center text-sm bg-gray-800">
                          <SkinnedPiece piece="k" size={16} />
                        </div>
                        <div className="w-6 h-6 border rounded flex items-center justify-center text-sm bg-white">
                          <SkinnedPiece piece="Q" size={16} />
                        </div>
                        <div className="w-6 h-6 border rounded flex items-center justify-center text-sm bg-gray-800">
                          <SkinnedPiece piece="q" size={16} />
                        </div>
                        <div className="w-6 h-6 border rounded flex items-center justify-center text-sm bg-white">
                          <SkinnedPiece piece="R" size={16} />
                        </div>
                        <div className="w-6 h-6 border rounded flex items-center justify-center text-sm bg-gray-800">
                          <SkinnedPiece piece="r" size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Theme Preview Icon */}
                    <div className="mt-3 text-center">
                      <div className="text-2xl">{skin.preview}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetToDefault}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
