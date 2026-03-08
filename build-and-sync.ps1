$nodePath = 'C:\Users\ajink\AppData\Local\nodejs\node-v20.18.0-win-x64'
$env:PATH = "$nodePath;$env:PATH"
Set-Location 'C:\Users\ajink\OneDrive\Documents\heist'
& "$nodePath\npm.cmd" run build
& "$nodePath\npx.cmd" cap sync
Write-Host "`nBuild + sync done!"
