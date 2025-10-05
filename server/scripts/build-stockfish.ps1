<#
Simple helper to clone and build Stockfish on Windows using msys2/mingw or Visual Studio.
This script only documents steps and runs the basic git clone.
#>

param(
    [string]$TargetDir = "$(Split-Path -Parent $PSScriptRoot)\stockfish"
)

Write-Host "Cloning Stockfish into: $TargetDir"
if (-Not (Test-Path $TargetDir)) {
    git clone https://github.com/official-stockfish/Stockfish.git $TargetDir
} else {
    Write-Host "Target exists. Pulling latest changes..."
    Push-Location $TargetDir
    git pull
    Pop-Location
}

Write-Host "Next steps:"
Write-Host "  - Open MSYS2/mingw shell or Visual Studio developer prompt"
Write-Host "  - Build the engine in $TargetDir\src according to the Stockfish README"
Write-Host "  - Set environment variable STOCKFISH_PATH to the built binary (full path)"
Write-Host "Example (PowerShell): setx STOCKFISH_PATH \"C:\\path\\to\\stockfish.exe\""
