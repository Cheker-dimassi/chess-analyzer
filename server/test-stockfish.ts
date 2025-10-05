import { enhancedChessEngine } from './services/stockfishEngine';

async function run() {
  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  try {
    console.log('Requesting bot move (stockfish difficulty)...');
    const mv = await enhancedChessEngine.getStockfishMove(startFen, 'stockfish');
    console.log('Bot move result:', mv);
  } catch (e) {
    console.error('Bot move failed:', e);
  }

  try {
    console.log('Requesting analysis (depth 18)...');
    const an = await enhancedChessEngine.analyzeWithStockfish(startFen, 18);
    console.log('Analysis:', an);
  } catch (e) {
    console.error('Analysis failed:', e);
  }
}

run().then(()=>process.exit()).catch(e=>{console.error(e); process.exit(1);});
