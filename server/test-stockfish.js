import { spawn } from 'child_process';
import * as path from 'path';

const stockfishPath = path.join(process.env.USERPROFILE || '', 'Documents', 'Stockfish', 'stockfish.exe');

console.log('Testing Stockfish at:', stockfishPath);

const stockfish = spawn(stockfishPath);

stockfish.stdout.on('data', (data) => {
  console.log(`Stockfish output: ${data}`);
});

stockfish.stderr.on('data', (data) => {
  console.error(`Stockfish error: ${data}`);
});

stockfish.on('close', (code) => {
  console.log(`Stockfish process exited with code ${code}`);
});

// Send a test command
stockfish.stdin.write('uci\n');
stockfish.stdin.write('isready\n');

// Wait for 5 seconds then exit
setTimeout(() => {
  stockfish.stdin.write('quit\n');
}, 5000);