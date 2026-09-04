# rantr — Mobile Deployment Guide

## Overview

```
Stage 1 (Done): PWA  → Share a URL → anyone installs from browser  ✓
Stage 2 (Next):  Capacitor → Google Play Store + Apple App Store
```

App ID (Play Store): `com.ajink.rantr`
Web URL: `https://rantr.vercel.app`

---

## STAGE 1 — PWA (Progressive Web App)

### What this gives you
- A shareable URL at `rantr.vercel.app`
- Users open the URL on their phone and tap "Add to Home Screen"
- Looks and feels exactly like a native app (full screen, no browser bar)
- Works offline (service worker caches everything)
- **No app stores needed**

### Deploy to Vercel (free, takes 5 minutes)

1. **Push code to GitHub**
   ```
   git add .
   git commit -m "rantr update"
   git push
   ```

2. **Connect to Vercel** (first time only)
   - Go to https://vercel.com → Sign up with GitHub (free)
   - Click "New Project" → Import your rantr GitHub repo
   - Build command: `npm run build`
   - Output directory: `dist`
   - Click Deploy → Done!

3. **Share the URL** — `https://rantr.vercel.app`

4. **On Android phone**: Open the URL in Chrome → tap ⋮ menu → "Add to Home Screen"
5. **On iPhone**: Open the URL in Safari → tap Share button → "Add to Home Screen"

### Every time you make code changes
```
git add .
git commit -m "your change description"
git push
# Vercel auto-deploys in ~30 seconds → rantr.vercel.app updated
```

---

## STAGE 2 — Android App (Google Play Store)

### One-time setup

1. **Install Android Studio**
   - Download: https://developer.android.com/studio
   - During install: accept all SDK licenses, install Android SDK

2. **Set ANDROID_HOME environment variable** (Windows)
   - Search "Environment Variables" in Start menu
   - Add: `ANDROID_HOME = C:\Users\ajink\AppData\Local\Android\Sdk`
   - Add to PATH: `%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools`

3. **Open the Android project**
   ```
   npx cap open android
   ```
   This opens Android Studio with the `android/` project.

### Building & testing
```powershell
npm run mobile:android
# Then in Android Studio: Run ▶ (or Shift+F10)
```

### Publishing to Google Play Store
1. In Android Studio: Build → Generate Signed Bundle/APK
2. Create a keystore (keep it safe — you'll need it forever)
3. Build a signed `.aab` file
4. Go to https://play.google.com/console → Create app → Upload AAB
5. App ID to use: `com.ajink.rantr`
6. Privacy Policy URL: `https://rantr.vercel.app/privacy.html`
7. Fill in store listing → Release to production
- **Cost**: $25 one-time developer fee

### Play Console checklist before submitting
- [ ] Upload signed AAB
- [ ] Store listing: icon, feature graphic, 2+ screenshots, description
- [ ] Content rating: complete IARC questionnaire
- [ ] Data safety: microphone (local only), username (local only), no data shared
- [ ] Privacy Policy URL: `https://rantr.vercel.app/privacy.html`
- [ ] Target audience: 18+
- [ ] App category: Entertainment

---

## STAGE 3 — iOS App (Apple App Store)

> Requires: a **Mac** + **Xcode** + **$99/year** Apple Developer Program

### Setup (on Mac)
```bash
npm install @capacitor/ios
npx cap add ios
npx cap open ios  # Opens Xcode
```

### Publishing
1. In Xcode: Product → Archive
2. Upload to App Store Connect (https://appstoreconnect.apple.com)
3. Submit for review (takes 1–3 days)
- **Cost**: $99/year Apple Developer Program

---

## Everyday dev workflow

```
1. Open Claude Code in the heist folder
2. Make your changes
3. Test locally: npm run dev → http://localhost:5173
4. Deploy:
   git add .
   git commit -m "description"
   git push
   → Vercel auto-deploys in ~30s → rantr.vercel.app updated
5. For Android native build:
   npm run mobile:android → open in Android Studio → test on device
```

---

## Key files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor settings (app ID: com.ajink.rantr, name: rantr) |
| `vite.config.ts` | PWA plugin — generates service worker + manifest |
| `public/privacy.html` | Privacy Policy (required for Play Store) |
| `public/icons/icon-192.png` | App icon for PWA home screen (Android) |
| `public/icons/icon-512.png` | App icon for PWA splash screen |
| `android/` | Native Android project (Capacitor generated) |

---

## Replacing the app icon

1. Create a 512×512 PNG with your design
2. Save as `public/icons/icon-512.png`
3. Save a 192×192 version as `public/icons/icon-192.png`
4. Run `npm run build` to rebuild

Useful tools:
- https://maskable.app (test if icon works as "maskable")
- https://realfavicongenerator.net (generate all icon sizes at once)
