Write-Host "=== Pushing ToldYa to GitHub ===" -ForegroundColor Cyan
Set-Location 'C:\Users\ajink\OneDrive\Documents\heist'

# Configure git identity (required for first commit)
git config --global user.email "ajkirat@github.com"
git config --global user.name "ajkirat"

# Initialize
git init
git branch -M main

# Stage all files
Write-Host "Staging files..." -ForegroundColor Yellow
git add .

# Show what's being committed
Write-Host "Files staged:" -ForegroundColor Yellow
git status --short

# Commit
Write-Host "Committing..." -ForegroundColor Yellow
git commit -m "Initial commit - ToldYa prediction market game"

# Link and push
git remote remove origin 2>$null
git remote add origin https://github.com/ajkirat/toldya.git
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "https://github.com/ajkirat/toldya" -ForegroundColor Cyan
