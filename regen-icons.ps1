$nodePath = 'C:\Users\ajink\AppData\Local\nodejs\node-v20.18.0-win-x64'
$env:PATH = "$nodePath;$env:PATH"
Set-Location 'C:\Users\ajink\OneDrive\Documents\heist'
& "$nodePath\node.exe" generate-icons-simple.mjs
