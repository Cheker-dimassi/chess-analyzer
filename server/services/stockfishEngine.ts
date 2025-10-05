import { Chess } from 'chess.js';
import { ChessAnalysis, ChessPosition } from '@shared/api';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { createRequire } from 'module';

// We'll lazy-load a JS/WASM Stockfish package at runtime if no native binary
// is available. Avoid requiring it at module import time because some
// WASM bundles assume a browser/worker environment (they call postMessage)
// which would crash the Node process during module initialization. Instead
// we load it inside spawnEngine and provide a small global postMessage shim
// so the WASM bundle can call postMessage safely and we can forward those
// messages into the engine instance handlers.
let JsStockfish: any = null;

// UCI Stockfish wrapper that spawns the Stockfish binary per-request.
// Binary location is configurable via environment variable STOCKFISH_PATH.
// If binary is not available, code falls back to the previous simulated engine.
class StockfishEngine {
  private stockfishPath: string | null = null;
  private poolSize: number;
  private pool: Array<{ proc: ChildProcessWithoutNullStreams; busy: boolean; id: number }> = [];
  private queue: Array<{
    fen: string;
    depth?: number;
    movetime?: number;
    timeout?: number;
    resolve: (v: any) => void;
    reject: (e: any) => void;
  }> = [];
  private shuttingDown = false;

  constructor() {
    this.stockfishPath = this.locateStockfishBinary();
    this.poolSize = Number(process.env.STOCKFISH_POOL_SIZE || '1') || 1;

    console.log('Stockfish path:', this.stockfishPath);
    console.log('STOCKFISH_PATH env:', process.env.STOCKFISH_PATH);

    if (!this.stockfishPath) {
      // Do not require the JS package at construction time to avoid executing
      // the WASM bundle in the main process. spawnEngine will lazy-load the
      // package when needed and provide the necessary runtime shims.
      if (JsStockfish) {
        console.log('JS Stockfish package will be used when an engine instance is spawned');
      } else {
        console.warn('Stockfish binary not found. JS package will be lazy-loaded if installed; otherwise falling back to simulated engine.');
      }
    }

    // Only start the engine pool automatically if a native binary exists or
    // the environment explicitly requests JS-based engines. Otherwise keep
    // the pool empty so we don't require browser/worker-targeted WASM bundles
    // during server startup (which can crash Node).
    if (this.stockfishPath || (process.env.STOCKFISH_FORCE_JS || '').toLowerCase() === 'true') {
      this.startPool();
    } else {
      console.log('Engine pool not started: no native Stockfish binary found. Using simulated fallback. Set STOCKFISH_PATH or set STOCKFISH_FORCE_JS=true to enable JS engine.');
    }
    // graceful shutdown
    process.on('exit', () => this.shutdown());
    process.on('SIGINT', () => { this.shutdown(); process.exit(); });
    process.on('SIGTERM', () => { this.shutdown(); process.exit(); });
  }

  private locateStockfishBinary(): string | null {
    const envPath = process.env.STOCKFISH_PATH;
    if (envPath) return envPath;

    const candidates: string[] = [];
    // __dirname isn't defined in ESM; compute from import.meta.url when needed
    let base: string;
    try {
      // @ts-ignore
      base = path.resolve(typeof __dirname !== 'undefined' ? __dirname : path.dirname(new URL(import.meta.url).pathname), '..');
    } catch (e) {
      base = path.resolve(process.cwd(), '..');
    }
    candidates.push(path.join(base, 'stockfish', 'src', 'stockfish'));
    candidates.push(path.join(base, 'stockfish', 'stockfish'));
    candidates.push(path.join(base, 'bin', 'stockfish'));
    candidates.push(path.join(base, 'bin', 'stockfish.exe'));
    candidates.push(path.join(base, 'stockfish', 'stockfish.exe'));

    for (const c of candidates) {
      try {
        const fs = require('fs');
        if (fs.existsSync(c)) return c;
      } catch {}
    }
    return null;
  }

  private startPool() {
    for (let i = 0; i < this.poolSize; i++) {
      this.spawnEngine(i);
    }
  }

  private spawnEngine(id: number) {
    // If native binary is available, spawn that process
    if (this.stockfishPath) {
      try {
        const proc = spawn(this.stockfishPath, [], { stdio: 'pipe' });
        proc.stdin.setDefaultEncoding('utf8');
        this.pool.push({ proc, busy: false, id });
        // initialize UCI
        proc.stdin.write('uci\n');
        proc.stdin.write('isready\n');
        // ignore global output; per-request handlers will attach when a job is assigned
        proc.stdout.on('data', () => {});
        proc.stderr.on('data', (d) => console.warn(`[stockfish ${id} stderr]`, d.toString()));
        proc.on('exit', (code, sig) => {
          console.warn(`Stockfish process ${id} exited: code=${code} sig=${sig}`);
          // remove from pool and respawn unless shutting down
          this.pool = this.pool.filter(p => p.id !== id);
          if (!this.shuttingDown) setTimeout(() => this.spawnEngine(id), 500);
        });
      } catch (err) {
        console.warn('Failed to spawn Stockfish process', err);
      }
      return;
    }

    // Otherwise try to use the stockfish.js npm package (WASM build).
    // We lazy-load it here to avoid top-level require-time crashes
    // (the WASM bundle expects postMessage in some builds).
    const tryStartJs = async () => {
      try {
        if (!JsStockfish) {
          try {
            const req = createRequire(import.meta.url);
            // attempt both 'stockfish' and 'stockfish.js' package names
            try {
              JsStockfish = req('stockfish');
            } catch (e) {
              try { JsStockfish = req('stockfish.js'); } catch (e2) { JsStockfish = null; }
            }

            // If package main didn't expose a usable export, try to require a
            // Node-friendly build file directly from node_modules/stockfish/src.
            // Some distributions ship multiple builds (no-Worker, single, etc.).
            if (!JsStockfish) {
              try {
                const fs = require('fs');
                const nmPath = path.join(process.cwd(), 'node_modules', 'stockfish', 'src');
                if (fs.existsSync(nmPath)) {
                  const files: string[] = fs.readdirSync(nmPath);
                  const preferred = files.find(f => /no-Worker\.js$/.test(f))
                    || files.find(f => /single\.js$/.test(f))
                    || files.find(f => /nnue.*\.js$/.test(f))
                    || files.find(f => /stockfish.*\.js$/.test(f));
                  if (preferred) {
                    const abs = path.join(nmPath, preferred);
                    JsStockfish = req(abs);
                  }
                }
              } catch (e) {
                // fallthrough to null
                JsStockfish = JsStockfish || null;
              }
            }
          } catch (e) {
            JsStockfish = null;
          }
        }

        if (!JsStockfish) return;

        // Some builds call postMessage at top-level; provide a temporary shim.
        const originalPostMessage = (globalThis as any).postMessage;
        try {
          (globalThis as any).postMessage = (msg: any) => {
            // no-op by default; the engine instance will receive messages via onmessage
            // when we wire it below. Emscripten modules sometimes use postMessage to
            // print lines; we ignore top-level calls here.
            return undefined;
          };

          // Instantiate engine. The package may export a factory function or a Module object.
          let engineInstance: any = null;
          if (typeof JsStockfish === 'function') {
            engineInstance = JsStockfish();
          } else if (JsStockfish && typeof JsStockfish.default === 'function') {
            engineInstance = JsStockfish.default();
          } else if (JsStockfish && typeof JsStockfish.Module !== 'undefined') {
            // Some packages export an Emscripten Module; call it or use as-is.
            try { engineInstance = JsStockfish(); } catch { engineInstance = JsStockfish.Module; }
          }

          if (!engineInstance) {
            console.warn('stockfish package loaded but engine instance could not be created');
            return;
          }

          // The engineInstance typically expects postMessage(msg) to be called to send commands
          // and calls postMessage/out/Module.print to communicate. We'll provide a small adapter
          // so runOnEngine can attach an onmessage handler.
          // If the instance is a function, calling it sends commands.
          const procLike: any = engineInstance;

          // Ensure there is an onmessage handler slot
          procLike.onmessage = procLike.onmessage || null;
          // Provide postMessage if missing
          if (typeof procLike.postMessage !== 'function') {
            procLike.postMessage = (m: any) => {
              try { if (typeof procLike === 'function') procLike(m); }
              catch (e) { /* ignore */ }
            };
          }

          this.pool.push({ proc: procLike as any as ChildProcessWithoutNullStreams, busy: false, id });
          console.log(`Spawned JS stockfish instance ${id}`);
        } finally {
          // restore global
          (globalThis as any).postMessage = originalPostMessage;
        }
      } catch (err) {
        console.warn('Failed to start JS Stockfish instance', err);
      }
    };

    void tryStartJs();
  }

  private getAvailableEngine() {
    return this.pool.find(p => !p.busy) || null;
  }

  private enqueueRequest(req: any) {
    this.queue.push(req);
    this.maybeProcessQueue();
  }

  private maybeProcessQueue() {
    if (this.queue.length === 0) return;
    const engine = this.getAvailableEngine();
    if (!engine) return;
    const req = this.queue.shift();
    if (!req) return;
    this.runOnEngine(engine, req).catch(req.reject);
  }

  private runOnEngine(engineEntry: { proc: ChildProcessWithoutNullStreams; busy: boolean; id: number }, req: any): Promise<void> {
    return new Promise((resolveOuter, rejectOuter) => {
      const { proc, id } = engineEntry;
      engineEntry.busy = true;

      let stdout = '';
      let lastInfo: any = {};
      const onData = (data: Buffer | string) => {
        const text = typeof data === 'string' ? data : data.toString('utf8');
        stdout += text;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          if (line.startsWith('info')) {
            const mDepth = /depth (\d+)/.exec(line);
            const mCp = /score cp (-?\d+)/.exec(line);
            const mMate = /score mate (-?\d+)/.exec(line);
            const mPv = /pv (.+)$/.exec(line);
            const mNodes = /nodes (\d+)/.exec(line);
            const mTime = /time (\d+)/.exec(line);
            const mNps = /nps (\d+)/.exec(line);
            if (mDepth) lastInfo.depth = parseInt(mDepth[1], 10);
            if (mCp) lastInfo.score = { type: 'cp', value: parseInt(mCp[1], 10) };
            if (mMate) lastInfo.score = { type: 'mate', value: parseInt(mMate[1], 10) };
            if (mPv) lastInfo.pv = mPv[1];
            if (mNodes) lastInfo.nodes = parseInt(mNodes[1], 10);
            if (mTime) lastInfo.time = parseInt(mTime[1], 10);
            if (mNps) lastInfo.nps = parseInt(mNps[1], 10);
          }
          if (line.startsWith('bestmove')) {
            const bm = /bestmove (\S+)(?: ponder (\S+))?/.exec(line);
            const bestmove = bm ? bm[1] : null;
            const ponder = bm ? bm[2] : undefined;
            cleanup();
            const result = { bestmove, ponder, info: lastInfo, raw: stdout };
            try { req.resolve(result); } catch (e) {}
            engineEntry.busy = false;
            this.maybeProcessQueue();
            resolveOuter();
            return;
          }
        }
      };

      const onErr = (d: Buffer) => console.warn(`[stockfish ${id} stderr]`, d.toString());

      const cleanup = () => {
        try { proc.stdout.removeListener('data', onData); } catch {}
        try { proc.stderr.removeListener('data', onErr); } catch {}
      };

      // Determine if this is a native child process or a JS engine
      const isNative = !!(proc as any).stdin && typeof (proc as any).stdin.write === 'function';

      if (isNative) {
        proc.stdout.on('data', onData);
        proc.stderr.on('data', onErr);

        // Build commands
        proc.stdin.write('ucinewgame\n');
        proc.stdin.write(`position fen ${req.fen}\n`);
        if (typeof req.movetime === 'number') {
          proc.stdin.write(`go movetime ${Math.max(1, Math.floor(req.movetime))}\n`);
        } else {
          proc.stdin.write(`go depth ${Math.max(1, Math.floor(req.depth || 1))}\n`);
        }
      } else {
        // JS Stockfish instance: use postMessage/onmessage style
        const jsEngine: any = proc as any;
        const jsOnMessage = (event: any) => {
          const line = (event && (event.data ?? event)) || event;
          onData(String(line));
        };
        // attach handler
        try {
          if (typeof jsEngine.onmessage === 'function' || typeof jsEngine.onmessage === 'undefined') {
            // some builds expect assignment
            (jsEngine as any).onmessage = jsOnMessage;
          }
          if (typeof jsEngine.addEventListener === 'function') {
            jsEngine.addEventListener('message', jsOnMessage);
          }
        } catch (e) {}

        // send commands via postMessage or by calling the returned function
        const send = (cmd: string) => {
          try {
            if (typeof jsEngine.postMessage === 'function') jsEngine.postMessage(cmd);
            else if (typeof jsEngine === 'function') jsEngine(cmd);
          } catch (e) {
            // ignore
          }
        };

        send('uci');
        send('isready');
        send('ucinewgame');
        send(`position fen ${req.fen}`);
        if (typeof req.movetime === 'number') {
          send(`go movetime ${Math.max(1, Math.floor(req.movetime))}`);
        } else {
          send(`go depth ${Math.max(1, Math.floor(req.depth || 1))}`);
        }
      }

      // Timeout
      const to = setTimeout(() => {
        try { proc.stdin.write('stop\n'); } catch {}
        setTimeout(() => {
          cleanup();
          engineEntry.busy = false;
          this.maybeProcessQueue();
          try { req.reject(new Error('Stockfish request timed out')); } catch (e) {}
          rejectOuter(new Error('Stockfish request timed out'));
        }, 250);
      }, Math.max(1000, req.timeout || 5000));

      // Ensure to clear timeout when resolved
      const origResolve = req.resolve;
      req.resolve = (v: any) => { clearTimeout(to); origResolve(v); };
      const origReject = req.reject;
      req.reject = (e: any) => { clearTimeout(to); origReject(e); };
    });
  }

  async analyzePosition(fen: string, depth: number = Number(process.env.STOCKFISH_DEFAULT_DEPTH || 18), timeout: number = 5000): Promise<any> {
    if (!this.stockfishPath || this.pool.length === 0) {
      return this.simulatedAnalysis(fen, Math.min(depth, 4));
    }

    return new Promise((resolve, reject) => {
      this.enqueueRequest({ fen, depth, timeout, resolve, reject });
    });
  }

  async getStockfishMove(fen: string, difficulty: 'beginner' | 'intermediate' | 'advanced' | 'stockfish'): Promise<any> {
    const depthMap: Record<string, number> = {
      beginner: 4,
      intermediate: 8,
      advanced: 12,
      stockfish: Number(process.env.STOCKFISH_DEFAULT_DEPTH || 18)
    } as any;

    const useMovetime = (process.env.STOCKFISH_USE_MOVETIME || 'false').toLowerCase() === 'true';
    const movetime = Number(process.env.STOCKFISH_DEFAULT_MOVETIME_MS || '2000');

    const depth = depthMap[difficulty] || 8;

    if (!this.stockfishPath || this.pool.length === 0) {
      // fallback simulated
      const chess = new Chess(fen);
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) return null;
      switch (difficulty) {
        case 'stockfish':
        case 'advanced':
          return this.makeMoveFromVerbose(chess, moves[0]);
        case 'intermediate':
          return this.makeMoveFromVerbose(chess, moves[Math.floor(Math.random() * Math.min(3, moves.length))]);
        default:
          return this.makeMoveFromVerbose(chess, moves[Math.floor(Math.random() * moves.length)]);
      }
    }

    const timeout = 1000 + (useMovetime ? movetime * 2 : depth * 200);
    const promise = new Promise<any>((resolve, reject) => {
      this.enqueueRequest({ fen, depth: useMovetime ? undefined : depth, movetime: useMovetime ? movetime : undefined, timeout, resolve, reject });
    });

    const res: any = await promise;
    const best = res.bestmove;
    if (!best) return null;
    const from = best.slice(0,2);
    const to = best.slice(2,4);
    const promotion = best.length > 4 ? best.slice(4) : undefined;
    const chess = new Chess(fen);
    const move = chess.move({ from, to, promotion } as any);
    if (!move) return { from, to, san: best, fen };
    return { from: move.from, to: move.to, san: move.san, fen: chess.fen(), promotion: move.promotion, info: res.info };
  }

  private simulatedAnalysis(fen: string, depth: number = 4): any {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) {
      return { depth, evaluation: { type: 'cp', value: 0, formatted: '0.00' }, bestMove: { from: '', to: '', san: 'Game Over' }, principalVariation: [] };
    }
    const bestMove = moves[0];
    const evalVal = Math.round((Math.random() - 0.5) * 400);
    return { depth, evaluation: { type: 'cp', value: evalVal, formatted: evalVal > 0 ? `+${(evalVal/100).toFixed(2)}` : `${(evalVal/100).toFixed(2)}` }, bestMove: { from: bestMove.from, to: bestMove.to, san: bestMove.san }, principalVariation: [bestMove.san] };
  }

  private makeMoveFromVerbose(chess: Chess, move: any) {
    chess.move(move);
    return { from: move.from, to: move.to, san: move.san, fen: chess.fen(), promotion: move.promotion };
  }

  shutdown() {
    this.shuttingDown = true;
    for (const e of this.pool) {
      try { if (!e.proc.killed) e.proc.kill(); } catch {}
    }
    this.pool = [];
  }
}

export class EnhancedChessEngineService {
  private chess: Chess;
  private stockfish: StockfishEngine;

  constructor() {
    this.chess = new Chess();
    this.stockfish = new StockfishEngine();
  }

  /**
   * Analyze position using Stockfish
   */
  async analyzeWithStockfish(fen: string, depth: number = 15, timeout: number = 5000): Promise<ChessAnalysis> {
    try {
      this.chess.load(fen);
      
      const stockfishResult = await this.stockfish.analyzePosition(fen, depth);
      
      const analysis: ChessAnalysis = {
        position: {
          fen,
          turn: this.chess.turn(),
          pgn: this.chess.pgn()
        },
        evaluation: stockfishResult.evaluation,
        bestMove: stockfishResult.bestMove,
        principalVariation: stockfishResult.principalVariation,
        depth: stockfishResult.depth,
        confidence: Math.min(98, 85 + depth), // Higher confidence with Stockfish
        analysisTime: stockfishResult.time
      };

      return analysis;
    } catch (error) {
      throw new Error(`Stockfish analysis failed: ${error.message}`);
    }
  }

  /**
   * Get best move using Stockfish
   */
  async getStockfishMove(fen: string, difficulty: 'beginner' | 'intermediate' | 'advanced' | 'stockfish'): Promise<any> {
    this.chess.load(fen);
    const moves = this.chess.moves({ verbose: true });
    
    if (moves.length === 0) {
      return null;
    }

    let selectedMove;
    
    switch (difficulty) {
      case 'stockfish':
        // Use full Stockfish analysis
        const analysis = await this.stockfish.analyzePosition(fen, 18);
        selectedMove = moves.find(move => 
          move.from === analysis.bestMove.from && 
          move.to === analysis.bestMove.to
        ) || moves[0];
        break;
        
      case 'advanced':
        // Use medium depth Stockfish
        const advancedAnalysis = await this.stockfish.analyzePosition(fen, 12);
        selectedMove = moves.find(move => 
          move.from === advancedAnalysis.bestMove.from && 
          move.to === advancedAnalysis.bestMove.to
        ) || moves[0];
        break;
        
      case 'intermediate':
        // Use shallow Stockfish with some randomness
        const intAnalysis = await this.stockfish.analyzePosition(fen, 8);
        const topMoves = moves.slice(0, 3);
        selectedMove = Math.random() < 0.7 ? 
          moves.find(move => 
            move.from === intAnalysis.bestMove.from && 
            move.to === intAnalysis.bestMove.to
          ) || topMoves[0] :
          topMoves[Math.floor(Math.random() * topMoves.length)];
        break;
        
      case 'beginner':
        // Random move with occasional good moves
        if (Math.random() < 0.3) {
          const begAnalysis = await this.stockfish.analyzePosition(fen, 4);
          selectedMove = moves.find(move => 
            move.from === begAnalysis.bestMove.from && 
            move.to === begAnalysis.bestMove.to
          ) || moves[0];
        } else {
          selectedMove = moves[Math.floor(Math.random() * moves.length)];
        }
        break;
        
      default:
        selectedMove = moves[0];
    }

    const move = this.chess.move(selectedMove);
    return {
      from: move.from,
      to: move.to,
      san: move.san,
      fen: this.chess.fen(),
      promotion: move.promotion
    };
  }

  /**
   * Regular analysis (fallback)
   */
  async analyzePosition(fen: string, depth: number = 15, timeout: number = 5000): Promise<ChessAnalysis> {
    // Use Stockfish if available, otherwise fallback to basic analysis
    try {
      return await this.analyzeWithStockfish(fen, depth, timeout);
    } catch (error) {
      // Fallback to basic analysis if Stockfish fails
      return this.basicAnalysis(fen, depth);
    }
  }

  private async basicAnalysis(fen: string, depth: number): Promise<ChessAnalysis> {
    this.chess.load(fen);
    
    const moves = this.chess.moves({ verbose: true });
    if (moves.length === 0) {
      const evaluation = this.chess.isCheckmate() ? 
        (this.chess.turn() === 'w' ? -30000 : 30000) : 0;
      
      return {
        position: { fen, turn: this.chess.turn(), pgn: this.chess.pgn() },
        evaluation: {
          type: this.chess.isCheckmate() ? 'mate' : 'cp',
          value: evaluation,
          formatted: this.chess.isCheckmate() ? 
            (this.chess.turn() === 'w' ? 'M-1' : 'M1') : '0.00'
        },
        bestMove: { from: '', to: '', san: 'Game Over' },
        principalVariation: [],
        depth,
        confidence: 100,
        analysisTime: 100
      };
    }

    const bestMove = moves[0]; // Simple fallback
    const evaluation = Math.random() * 200 - 100; // Random evaluation

    return {
      position: { fen, turn: this.chess.turn(), pgn: this.chess.pgn() },
      evaluation: {
        type: 'cp',
        value: Math.round(evaluation * 100),
        formatted: evaluation > 0 ? `+${evaluation.toFixed(2)}` : evaluation.toFixed(2)
      },
      bestMove: {
        from: bestMove.from,
        to: bestMove.to,
        san: bestMove.san,
        promotion: bestMove.promotion
      },
      principalVariation: [bestMove.san],
      depth,
      confidence: 70,
      analysisTime: 500
    };
  }

  // Re-export other methods from original service
  isLegalMove(fen: string, move: { from: string; to: string; promotion?: string }): boolean {
    try {
      this.chess.load(fen);
      const result = this.chess.move(move);
      return result !== null;
    } catch {
      return false;
    }
  }

  makeMove(fen: string, move: { from: string; to: string; promotion?: string }): any {
    this.chess.load(fen);
    const result = this.chess.move(move);
    if (result) {
      return {
        move: result,
        fen: this.chess.fen(),
        isGameOver: this.chess.isGameOver(),
        isCheck: this.chess.isCheck(),
        isCheckmate: this.chess.isCheckmate(),
        isStalemate: this.chess.isStalemate(),
        isDraw: this.chess.isDraw()
      };
    }
    return null;
  }

  getGameStatus(fen: string): string {
    this.chess.load(fen);
    
    if (this.chess.isCheckmate()) {
      return this.chess.turn() === 'w' ? '0-1' : '1-0';
    }
    if (this.chess.isStalemate() || this.chess.isDraw()) {
      return '1/2-1/2';
    }
    return 'active';
  }
}

export const enhancedChessEngine = new EnhancedChessEngineService();
