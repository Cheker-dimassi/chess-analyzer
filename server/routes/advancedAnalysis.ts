import { RequestHandler } from "express";
import { AdvancedChessEngine } from "../services/advancedChessEngine";

const advancedEngine = new AdvancedChessEngine();

export interface AdvancedAnalysisRequest {
  fen: string;
  depth?: number;
  multiPv?: number; // Number of principal variations to return
}

export interface AdvancedAnalysisResponse {
  success: boolean;
  analysis?: any;
  error?: string;
}

/**
 * Advanced position analysis with multiple AI models and deep evaluation
 */
export const advancedAnalysis: RequestHandler = async (req, res) => {
  try {
    const { fen, depth = 15, multiPv = 5 }: AdvancedAnalysisRequest = req.body;

    if (!fen) {
      return res.status(400).json({
        success: false,
        error: 'FEN is required'
      } as AdvancedAnalysisResponse);
    }

    // Perform advanced analysis
    const analysis = advancedEngine.analyzePosition(fen, depth);

    // Enhance with additional AI insights
    const enhancedAnalysis = {
      ...analysis,
      insights: {
        tactical: generateTacticalInsights(analysis),
        strategic: generateStrategicInsights(analysis),
        recommendations: generateRecommendations(analysis)
      },
      engine: {
        name: 'Advanced Chess AI',
        version: '2.0',
        strength: 2800
      }
    };

    res.json({
      success: true,
      analysis: enhancedAnalysis
    } as AdvancedAnalysisResponse);

  } catch (error) {
    console.error('Advanced analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed'
    } as AdvancedAnalysisResponse);
  }
};

/**
 * Generate tactical insights from analysis
 */
function generateTacticalInsights(analysis: any): string[] {
  const insights = [];

  // Check for tactical opportunities
  if (analysis.bestMoves.length > 0) {
    const bestMove = analysis.bestMoves[0];
    
    if (bestMove.tactical.includes('Check')) {
      insights.push('Strong attacking opportunity with check');
    }
    
    if (bestMove.tactical.includes('Capture')) {
      insights.push('Material gain available');
    }
    
    if (bestMove.evaluation > 200) {
      insights.push('Significant advantage can be gained');
    }
    
    if (bestMove.evaluation < -200) {
      insights.push('Position is critical - defensive measures needed');
    }
  }

  // Check position features
  if (analysis.position.tactical.length > 0) {
    insights.push(...analysis.position.tactical.map((t: string) => `Tactical: ${t}`));
  }

  return insights;
}

/**
 * Generate strategic insights from analysis
 */
function generateStrategicInsights(analysis: any): string[] {
  const insights = [];

  // Material balance
  const materialDiff = analysis.position.material.white - analysis.position.material.black;
  if (Math.abs(materialDiff) > 2) {
    insights.push(materialDiff > 0 ? 'Material advantage' : 'Material disadvantage');
  }

  // King safety
  const kingSafetyDiff = analysis.position.kingSafety.white - analysis.position.kingSafety.black;
  if (Math.abs(kingSafetyDiff) > 0.3) {
    insights.push(kingSafetyDiff > 0 ? 'Better king safety' : 'King safety concerns');
  }

  // Center control
  const centerDiff = analysis.position.centerControl.white - analysis.position.centerControl.black;
  if (Math.abs(centerDiff) > 0.2) {
    insights.push(centerDiff > 0 ? 'Center control advantage' : 'Need to fight for center');
  }

  // Development
  const devDiff = analysis.position.development.white - analysis.position.development.black;
  if (Math.abs(devDiff) > 0.2) {
    insights.push(devDiff > 0 ? 'Better development' : 'Need to develop pieces');
  }

  return insights;
}

/**
 * Generate move recommendations
 */
function generateRecommendations(analysis: any): string[] {
  const recommendations = [];

  if (analysis.bestMoves.length > 0) {
    const bestMove = analysis.bestMoves[0];
    
    recommendations.push(`Best move: ${bestMove.san} - ${bestMove.explanation}`);
    
    if (analysis.bestMoves.length > 1) {
      const secondBest = analysis.bestMoves[1];
      const evalDiff = Math.abs(bestMove.evaluation - secondBest.evaluation);
      
      if (evalDiff < 50) {
        recommendations.push(`Alternative: ${secondBest.san} - ${secondBest.explanation}`);
      }
    }
  }

  // Position-specific recommendations
  if (analysis.evaluation.value > 100) {
    recommendations.push('Maintain the advantage with solid moves');
  } else if (analysis.evaluation.value < -100) {
    recommendations.push('Look for counterplay and tactical opportunities');
  } else {
    recommendations.push('Position is balanced - focus on piece activity');
  }

  return recommendations;
}
