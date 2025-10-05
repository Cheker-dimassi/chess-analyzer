This project can use the official Stockfish engine for analysis and playing moves.

Overview

- The server will attempt to locate a Stockfish binary using the environment variable STOCKFISH_PATH or common in-repo locations (e.g. `server/stockfish/stockfish` or `server/bin/stockfish.exe`).
- If a binary is present, the app spawns Stockfish for analysis requests and to select bot moves. If missing, the project falls back to the simulated engine (less accurate).

How to build Stockfish (Windows - recommended)

1. Install dependencies: Visual Studio (with C++ workload) or Mingw-w64, and git.
2. Open PowerShell and run (from repo root):

```powershell
# Clone Stockfish into server/stockfish
git clone https://github.com/official-stockfish/Stockfish.git server\stockfish
# Build using MSYS2/make or Visual Studio - an example using make (mingw)
# Enter the src directory and build
cd server\stockfish\src
# For msys2/mingw environment:
# make -j4 build ARCH=x86-64
# After build, the binary will be at server\stockfish\src\stockfish.exe (or 'stockfish')
```

How to point the server to the binary

Set the STOCKFISH_PATH environment variable to the absolute path of the built Stockfish binary. Example (PowerShell):

```powershell
$env:STOCKFISH_PATH = 'C:\full\path\to\server\stockfish\src\stockfish.exe'
# For permanent setting, use setx:
setx STOCKFISH_PATH "C:\full\path\to\server\stockfish\src\stockfish.exe"
```

Server restart

After building Stockfish and setting STOCKFISH_PATH, restart the server so the service picks up the binary.

Notes

- The wrapper spawns a short-lived Stockfish process per analysis request. This is simple and reliable. For heavy usage you can extend it to maintain a persistent Stockfish process pool.
- Depth mapping: `beginner=4`, `intermediate=8`, `advanced=12`, `stockfish=18`.
- If you want deeper searches or longer analysis times, increase the `depth` argument in calls to `enhancedChessEngine.analyzeWithStockfish` or set longer timeouts.
