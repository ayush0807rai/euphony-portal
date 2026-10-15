# True Native App Deployment Guide (Android, iOS, macOS, Windows)

This document serves as the master engineering and deployment specification for compiling, packaging, and distributing **Euphony** as a genuine standalone native application across all supported operating systems without requiring paid store accounts (Google Play Console or Apple Developer Program).

---

## 1. Multi-Platform Architectural Overview

| Platform | Native Technology | Output Binary | Standalone Engine | Offline Capable |
| :--- | :--- | :--- | :--- | :--- |
| **Android** | Android SDK / Capacitor Bridge / Media3 ExoPlayer | `Euphony.apk` | Native WebView + Media3 Service | Yes (Local Assets) |
| **Windows** | Electron 44 / Chromium Native Core / Node.js | `Euphony-Setup.exe` | Standalone Chromium + V8 Runtime | Yes (Fully Bundled) |
| **macOS** | Electron 44 / CoreAudio / Cocoa Bridge | `Euphony-mac.zip` / `Euphony.app` | Standalone Chromium + macOS Audio | Yes (Fully Bundled) |
| **iOS** | Xcode Project / Capacitor iOS / WebClip Profile | `ios/App` / `Euphony.mobileconfig` | WebKit Standalone Container | Yes (Offline Cache) |

---

## 2. Elimination of Chrome / External Browser Redirection

Previous builds experienced redirection into Google Chrome when handling Google OAuth or external domain links. This was caused by two default behaviors:
1. Capacitor's internal `launchIntent()` triggered `Intent.ACTION_VIEW` whenever navigation did not match `localhost`.
2. Supabase OAuth redirected back to `https://euphony-music.vercel.app` by default.

### The Fix Applied:
- **`capacitor.config.json`**: Configured `server.allowNavigation: ["*"]` with explicit auth hosts (`*.supabase.co`, `accounts.google.com`, `euphony-music.vercel.app`).
- **`MainActivity.java`**: Implemented a custom `BridgeWebViewClient` that overrides `shouldOverrideUrlLoading()`. All authentication, Google login, and deep links are intercepted and kept **strictly inside the native Android WebView**.
- **Deep Linking Protocol**: Configured intent filters for `euphony://` and `https://euphony-music.vercel.app` in `AndroidManifest.xml`. OAuth tokens are passed directly to `App.jsx` via the `euphony:deep_link` custom event.
- **Chrome Never Opens**: The entire lifecycle (onboarding, login, playback, background playback) executes inside the native app window.

---

## 3. Platform Build & Deployment Procedures

### A. Android (APK Native Package)
- **Directory**: `android/`
- **Native Permissions**: `INTERNET`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `POST_NOTIFICATIONS`.
- **Media Engine**: `androidx.media3:media3-exoplayer:1.5.1` & `androidx.media3:media3-session:1.5.1`.

#### Build Commands:
```powershell
# 1. Compile web assets
npm run build

# 2. Sync to Android project
npx cap sync android

# 3. Compile Standalone APK
cd android
./gradlew assembleDebug
cd ..

# 4. Binary output location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

#### Sideloading Instructions:
1. Transfer `Euphony.apk` to the Android device.
2. In Android Settings, ensure *Allow from this source* is enabled for your file manager.
3. Tap **Install** -> Tap **Open**.
4. The app launches with its official native launcher icon, fullscreen UI, and lock-screen playback controls.

---

### B. Windows (x64 Standalone Desktop Installer)
- **Framework**: Electron + Electron Builder
- **Output**: `dist-electron/Euphony Setup 1.0.0.exe` (125 MB full Chromium + Node runtime)
- **Features**: Native window controls, hardware audio acceleration, system tray minimization, system media keys (`Play/Pause`, `Next`, `Previous`).

#### Build Command:
```powershell
# Compile production web files and build NSIS Windows Installer
npm run build
npm run electron:build:win
```
The resulting installer is saved to `dist-electron/Euphony Setup 1.0.0.exe` and copied to `public/downloads/Euphony-Setup.exe`.

---

### C. macOS (Apple Silicon & Intel Universal App)
- **Framework**: Electron for macOS
- **Output**: `Euphony-mac.zip` / `dist-electron/Euphony-1.0.0.dmg`
- **Bypassing macOS Gatekeeper**:
  Because the app is distributed directly from the portal without an annual $99 Apple Developer subscription:
  ```bash
  # When macOS displays "Euphony is damaged and cannot be opened":
  xattr -cr /Applications/Euphony.app
  # Or right-click Euphony.app -> Open -> Click "Open" in dialog
  ```

#### Build Command:
```powershell
npm run build
npm run electron:build:mac
```

---

### D. iOS (iPhone & iPad Native App)
- **Directory**: `ios/App`
- **Deployment Paths**:
  1. **Option 1: Xcode Local Direct Install (Free)**
     Connect iPhone via USB, open `ios/App/App.xcworkspace` in Xcode, select your personal free Apple ID team, and tap **Run**. The app installs permanently on your device.
  2. **Option 2: AltStore / Sideloadly (Free IPA sideloading)**
     Sign the compiled `.ipa` with your free Apple ID every 7 days without jailbreak.
  3. **Option 3: Signed WebClip Profile (`Euphony.mobileconfig`)**
     Download the official `.mobileconfig` payload from the portal. It creates a dedicated home screen native icon with fullscreen WebKit rendering, bypassing App Store review.

---

## 4. Automated Deployment Script

To build and package all native binaries in one command, run:
```powershell
node scripts/deploy_native_apps.cjs --all
```
Or for specific targets:
```powershell
node scripts/deploy_native_apps.cjs --android
node scripts/deploy_native_apps.cjs --windows
```
