import { ChessAnalysis } from '@shared/api';
import { apiJson } from './api';

export async function analyzeChessPosition(fen: string): Promise<ChessAnalysis> {
  console.log('Sending analysis request for position:', fen);
  
  try {
    const request = {
      fen,
      depth: 18,
      multiPv: 3  // Get multiple principal variations
    };

    const response = await apiJson<{ success: boolean; analysis: ChessAnalysis }>('/api/analysis/position', {
      method: 'POST',
      json: request
    });

    if (!response.success || !response.analysis) {
      throw new Error('Analysis failed');

    console.log('Analysis response:', response);
    return response;
  } catch (error) {
    console.error('Analysis request failed:', error);
    throw error;
  }
}