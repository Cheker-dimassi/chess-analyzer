import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Chess app route imports
import { 
  analyzeImage, 
  analyzePosition, 
  getAnalysisHistory, 
  deleteAnalysis 
} from "./routes/analysis";
import { 
  createGame, 
  makeMove, 
  getGame, 
  resignGame, 
  getGameHistory 
} from "./routes/game";
import { 
  getUserStats, 
  getHistory, 
  clearUserData, 
  exportUserData, 
  updatePreferences 
} from "./routes/user";
import { 
  uploadAndAnalyzeImage, 
  uploadMiddleware, 
  handleUploadError 
} from "./routes/upload";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Chess Analysis Routes
  app.post("/api/analysis/image", analyzeImage);
  app.post("/api/analysis/position", analyzePosition);
  app.get("/api/analysis/history", getAnalysisHistory);
  app.delete("/api/analysis/:id", deleteAnalysis);

  // File Upload Route
  app.post("/api/upload/image", uploadMiddleware, handleUploadError, uploadAndAnalyzeImage);

  // Chess Game Routes
  app.post("/api/game/create", createGame);
  app.post("/api/game/move", makeMove);
  app.get("/api/game/:gameId", getGame);
  app.post("/api/game/:gameId/resign", resignGame);
  app.get("/api/game/history", getGameHistory);

  // User Data Routes
  app.get("/api/user/stats", getUserStats);
  app.get("/api/user/history", getHistory);
  app.post("/api/user/clear", clearUserData);
  app.get("/api/user/export", exportUserData);
  app.post("/api/user/preferences", updatePreferences);

  // Error handling middleware
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.path}`
    });
  });

  return app;
}
