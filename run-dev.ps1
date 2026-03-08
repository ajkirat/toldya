$nodePath = "$env:USERPROFILE\AppData\Local\nodejs\node-v20.18.0-win-x64"
$env:PATH = "$nodePath;$env:PATH"

Set-Location "C:\Users\ajink\OneDrive\Documents\heist"

Write-Host "Installing dependencies..."
& "$nodePath\npm.cmd" install

Write-Host "Starting dev server..."
& "$nodePath\npm.cmd" run dev
