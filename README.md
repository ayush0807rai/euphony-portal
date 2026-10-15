# Euphony Portal & Download Hub 🎵

Official Spotify-style landing portal and multi-platform download center for **Euphony Music** (`https://euphony-music.vercel.app`).

## ✨ Features

- **Spotify-Inspired Experience**: Clean blue and white theme matching `euphony-music.vercel.app`, hero banner, choice cards, and feature highlights.
- **Dynamic Device Detection**: Automatically identifies if the visitor is browsing on **Windows**, **MacBook (macOS)**, **Android**, or **iPhone (iOS)**, surfacing a tailored 1-click download button.
- **User Choice**: Gives users the explicit choice to:
  1. **Open Web Player**: Launches `https://euphony-music.vercel.app` in their browser with 0 install required.
  2. **Install Native Apps**: Downloads the dedicated application for Windows, macOS, Android, or iOS.
- **Unified Supabase Authentication**: Shared login & signup with the web player. Users can sign in or create an account, view their profile in the header, and access their synced library and playlists.
- **Universal Multi-Platform Hub**:
  - 🪟 **Windows**: `Euphony-Setup.exe` (64-bit installer with audio acceleration & media keys)
  - 🤖 **Android**: `Euphony.apk` (Official standalone APK with background service & lock-screen player)
  - 🍏 **MacBook & Mac**: Universal macOS application for Apple Silicon (M1/M2/M3/M4) & Intel
  - 📱 **iPhone & iPad**: 1-tap Home Screen WebClip with standalone fullscreen mode & background audio

## 🚀 Running Locally

```bash
cd euphony-portal
npm install
npm run dev
```

Visit `http://localhost:5174` in your browser.

## 📦 Production Build & Vercel Deployment

```bash
npm run build
```

To deploy to Vercel:
```bash
# Using Vercel CLI:
vercel --prod

# Or import this repository into your Vercel Dashboard
```
