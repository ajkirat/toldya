$nodeDir = "$env:USERPROFILE\AppData\Local\nodejs"
$zipPath = "$env:TEMP\node.zip"
$url = "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip"

Write-Host "Creating directory: $nodeDir"
New-Item -ItemType Directory -Force -Path $nodeDir | Out-Null

Write-Host "Downloading Node.js v20..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
(New-Object Net.WebClient).DownloadFile($url, $zipPath)

Write-Host "Extracting..."
Expand-Archive -Path $zipPath -DestinationPath $nodeDir -Force

# Find the extracted folder
$extracted = Get-ChildItem $nodeDir -Directory | Select-Object -First 1
Write-Host "Extracted to: $($extracted.FullName)"

# List files
Get-ChildItem $extracted.FullName | Select-Object Name

Write-Host "Node path: $($extracted.FullName)\node.exe"
& "$($extracted.FullName)\node.exe" --version
& "$($extracted.FullName)\npm.cmd" --version
