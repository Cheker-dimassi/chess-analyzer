/**
 * Simple API testing utility for development
 * Run with: npx tsx server/test-api.ts
 */

const API_BASE = 'http://localhost:8080/api';

async function testAPI() {
  console.log('🧪 Testing Chess API endpoints...\n');

  try {
    // Test ping
    console.log('1. Testing ping endpoint...');
    const pingResponse = await fetch(`${API_BASE}/ping`);
    const pingData = await pingResponse.json();
    console.log('✅ Ping:', pingData.message);

    // Test position analysis
    console.log('\n2. Testing position analysis...');
    const analysisResponse = await fetch(`${API_BASE}/analysis/position`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        depth: 10
      })
    });
    const analysisData = await analysisResponse.json();
    if (analysisData.success) {
      console.log('✅ Analysis successful');
      console.log(`   Evaluation: ${analysisData.analysis.evaluation.formatted}`);
      console.log(`   Best move: ${analysisData.analysis.bestMove.san}`);
      console.log(`   Confidence: ${analysisData.analysis.confidence}%`);
    } else {
      console.log('❌ Analysis failed:', analysisData.error);
    }

    // Test game creation
    console.log('\n3. Testing game creation...');
    const gameResponse = await fetch(`${API_BASE}/game/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          timeControl: { initial: 600, increment: 5 },
          difficulty: 'intermediate',
          color: 'white'
        }
      })
    });
    const gameData = await gameResponse.json();
    if (gameData.success) {
      console.log('✅ Game created successfully');
      console.log(`   Game ID: ${gameData.game.id}`);
      console.log(`   Player color: ${gameData.game.playerColor}`);
      
      // Test making a move
      console.log('\n4. Testing move...');
      const moveResponse = await fetch(`${API_BASE}/game/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameData.game.id,
          move: { from: 'e2', to: 'e4' }
        })
      });
      const moveData = await moveResponse.json();
      if (moveData.success) {
        console.log('✅ Move successful');
        console.log(`   Player move: ${moveData.game.moves[moveData.game.moves.length - 2]?.san || 'e4'}`);
        console.log(`   Bot move: ${moveData.botMove?.san || 'No bot move'}`);
      } else {
        console.log('❌ Move failed:', moveData.error);
      }
    } else {
      console.log('❌ Game creation failed:', gameData.error);
    }

    // Test user stats
    console.log('\n5. Testing user stats...');
    const statsResponse = await fetch(`${API_BASE}/user/stats`);
    const statsData = await statsResponse.json();
    if (statsData.success) {
      console.log('✅ Stats retrieved');
      console.log(`   Total analyses: ${statsData.stats.totalAnalyses}`);
      console.log(`   Total games: ${statsData.stats.totalGames}`);
      console.log(`   Current rating: ${statsData.stats.currentRating}`);
    } else {
      console.log('❌ Stats failed:', statsData.error);
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAPI();
}

export { testAPI };
