import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Brain, Gamepad2, Upload, Zap, Target, Trophy, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-24 md:pt-28 md:pb-8">
      {/* Animated Chess Background */}
      <div className="absolute inset-0 theme-bg"></div>
      <div className="absolute inset-0 theme-overlay"></div>
      
      {/* Chess Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Crect x='0' y='0' width='30' height='30'/%3E%3Crect x='30' y='30' width='30' height='30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Floating Chess Pieces - Responsive positioning */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-4 sm:top-10 sm:left-10 text-4xl sm:text-5xl md:text-6xl text-chess-dark/10 animate-pulse">♔</div>
        <div className="absolute top-24 right-8 sm:top-32 sm:right-20 text-3xl sm:text-4xl text-chess-board-dark/15 animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}>♛</div>
        <div className="absolute bottom-32 left-8 sm:bottom-40 sm:left-16 text-4xl sm:text-5xl text-chess-dark/8 animate-pulse" style={{animationDelay: '2s'}}>♝</div>
        <div className="absolute bottom-16 right-6 sm:bottom-20 sm:right-12 text-2xl sm:text-3xl text-chess-board-dark/12 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4s'}}>♞</div>
        <div className="absolute top-1/2 left-2 sm:left-4 text-3xl sm:text-4xl text-chess-dark/10 animate-pulse" style={{animationDelay: '1.5s'}}>♜</div>
        <div className="absolute top-1/3 right-4 sm:right-8 text-xl sm:text-2xl text-chess-board-dark/20 animate-bounce" style={{animationDelay: '2.5s', animationDuration: '2.5s'}}>♟</div>
      </div>
      
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <div className="grid grid-cols-2 gap-0.5 sm:gap-1">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-primary-foreground rounded-sm"></div>
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-primary-foreground/50 rounded-sm"></div>
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-primary-foreground/50 rounded-sm"></div>
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-primary-foreground rounded-sm"></div>
              </div>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">ChessVision</h1>
          </div>
          <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-[280px] xs:max-w-xs sm:max-w-md md:max-w-lg mx-auto px-2">
            Your AI-powered chess companion
          </p>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 max-w-[250px] xs:max-w-xs sm:max-w-md mx-auto px-2">
            Analyze positions, capture boards, or play against AI
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid gap-3 xs:gap-4 sm:gap-6 mb-6 sm:mb-8 lg:grid-cols-1 xl:grid-cols-1">
          {/* Take Picture */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
            <Link to="/capture">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base xs:text-lg sm:text-xl">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Camera className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  Take Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs xs:text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  Capture any chess board with your camera and get instant position analysis
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Live camera detection</span>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Analyze Position */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
            <Link to="/analyze">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base xs:text-lg sm:text-xl">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-accent/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <Brain className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  Analyze Position
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs xs:text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  Upload an image or set up a position manually for deep engine analysis
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">AI-powered evaluation</span>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Play vs Bot */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
            <Link to="/play">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base xs:text-lg sm:text-xl">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-destructive/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                    <Gamepad2 className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-destructive" />
                  </div>
                  Play vs Bot
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs xs:text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  Challenge our chess engine in a full game with adjustable difficulty
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-muted-foreground">Multiple skill levels</span>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button variant="outline" size="lg" className="h-10 xs:h-12 sm:h-14 md:h-16 text-xs xs:text-sm sm:text-base" asChild>
            <Link to="/tournament">
              <Trophy className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-1.5 sm:mr-2" />
              Tournament
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-10 xs:h-12 sm:h-14 md:h-16 text-xs xs:text-sm sm:text-base" asChild>
            <Link to="/openings">
              <BookOpen className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-1.5 sm:mr-2" />
              Openings
            </Link>
          </Button>
        </div>

        {/* Stats or Recent Activity */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold mb-3 sm:mb-4">Your Chess Journey</h3>
              <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-primary">12</div>
                  <div className="text-xs text-muted-foreground">Positions<span className="hidden xs:inline"> Analyzed</span></div>
                </div>
                <div className="text-center">
                  <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-accent">5</div>
                  <div className="text-xs text-muted-foreground">Games<span className="hidden xs:inline"> Played</span></div>
                </div>
                <div className="text-center">
                  <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-destructive">1247</div>
                  <div className="text-xs text-muted-foreground"><span className="hidden xs:inline">Current </span>Rating</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            Powered by Stockfish engine and advanced computer vision
          </p>
        </div>
      </div>
    </div>
  );
}
