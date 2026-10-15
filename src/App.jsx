import React, { useState, useEffect, useMemo } from 'react';
import {
  Play, Download, ExternalLink, Smartphone, Monitor, Apple, Check,
  SlidersHorizontal, Sparkles, Layers, ShieldCheck, ChevronDown,
  LogOut, User, Music, ArrowRight, CheckCircle2, QrCode, Copy,
  Headphones, Disc, Flame, Star, Menu, X, Radio
} from 'lucide-react';
import { supabase } from './supabase';
import AuthModal from './AuthModal';

const WEB_PLAYER_URL = 'https://euphony-music.vercel.app';

export default function App() {
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState('signin');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePlatformModal, setActivePlatformModal] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Detect User Device
  const detectedDevice = useMemo(() => {
    if (typeof navigator === 'undefined') return { os: 'windows', label: 'Windows', icon: Monitor };
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return { os: 'android', label: 'Android', icon: Smartphone };
    if (/iPhone|iPad|iPod/i.test(ua)) return { os: 'ios', label: 'iOS (iPhone)', icon: Apple };
    if (/Macintosh|Mac OS X/i.test(ua)) return { os: 'mac', label: 'macOS (MacBook)', icon: Apple };
    return { os: 'windows', label: 'Windows', icon: Monitor };
  }, []);

  // Listen for Supabase Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setAuthModalOpen(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setAuthModalOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Prevent text selection and image dragging globally
  useEffect(() => {
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    const handleContextMenu = (e) => {
      if (e.target?.tagName === 'IMG' || e.target?.closest?.('img')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('dragstart', handleDragStart, { passive: false });
    document.addEventListener('selectstart', handleSelectStart, { passive: false });
    document.addEventListener('contextmenu', handleContextMenu, { passive: false });

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Handle open web player (with seamless cross-domain SSO)
  const handleOpenWebPlayer = async () => {
    if (!user) {
      setRedirectAfterLogin(true);
      setAuthDefaultTab('signin');
      setAuthModalOpen(true);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session?.refresh_token) {
        const ssoUrl = `${WEB_PLAYER_URL}/#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}&token_type=bearer`;
        window.open(ssoUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    } catch (e) {
      console.warn("Could not retrieve session tokens for SSO:", e);
    }
    window.open(WEB_PLAYER_URL, '_blank', 'noopener,noreferrer');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowProfileMenu(false);
  };

  const handleCopyLink = (url) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const platforms = [
    {
      id: 'windows',
      name: 'Windows',
      tagline: 'Windows 10, 11 (64-bit)',
      icon: Monitor,
      filename: 'Euphony-Setup.exe',
      size: '125 MB',
      version: 'v1.0.0',
      downloadUrl: '/downloads/Euphony-Setup.exe',
      description: 'Native installer with hardware audio acceleration, system media hotkeys, and desktop shortcut.',
      features: ['Hardware-accelerated audio', 'Full stem separation engine', 'System tray & background playback', 'Auto-launch on startup']
    },
    {
      id: 'mac',
      name: 'MacBook & Mac',
      tagline: 'macOS 11+ (Apple Silicon & Intel)',
      icon: Apple,
      filename: 'Euphony-mac.zip',
      size: 'Universal',
      version: 'v1.0.0',
      downloadUrl: 'https://github.com/ayush0807rai/music-app/releases',
      description: 'Tailored for macOS with support for Touch Bar, Apple Silicon (M1/M2/M3/M4), and macOS media keys.',
      features: ['Apple Silicon native speed', 'CoreAudio ultra-low latency', 'Now Playing widget support', 'Zero system bloat']
    },
    {
      id: 'android',
      name: 'Android',
      tagline: 'Android 7.0 and up',
      icon: Smartphone,
      filename: 'Euphony.apk',
      size: '16.4 MB',
      version: 'v1.0.0',
      downloadUrl: '/downloads/Euphony.apk',
      description: 'Official standalone Android package (.apk) with lock-screen notification player and background audio.',
      features: ['Direct APK installation', 'Lock-screen media controller', 'Offline audio cache', 'Battery-optimized backgrounding']
    },
    {
      id: 'ios',
      name: 'iPhone & iPad',
      tagline: 'iOS 15.0 and up',
      icon: Apple,
      filename: 'Euphony iOS App',
      size: 'Instant',
      version: 'v1.0.0',
      downloadUrl: WEB_PLAYER_URL,
      description: 'Native iOS package generated via Xcode & instant 1-tap Home Screen WebClip with full offline playback.',
      features: ['Full screen native feel', 'Background audio playback', 'Haptic feedback support', 'Dynamic island now-playing']
    }
  ];

  const primaryPlatform = platforms.find(p => p.id === detectedDevice.os) || platforms[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ===================== TOP NAVIGATION ===================== */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 100, height: '72px', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo & Brand */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)', border: '1.5px solid #E2E8F0' }}>
              <img src="/logo.png" alt="Euphony" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
              Euphony
            </span>
          </a>

          {/* Desktop Navigation Links (Spotify Style) */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            <a href="#choice" style={{ fontSize: '15px', fontWeight: '600', color: '#475569', transition: 'color 0.2s' }}>
              Overview
            </a>
            <a href="#why-euphony" style={{ fontSize: '15px', fontWeight: '600', color: '#475569', transition: 'color 0.2s' }}>
              Why Euphony?
            </a>
            <a href="#download" style={{ fontSize: '15px', fontWeight: '600', color: '#475569', transition: 'color 0.2s' }}>
              Download
            </a>
            <span style={{ height: '20px', width: '1px', backgroundColor: '#CBD5E1' }} />
            <button
              onClick={handleOpenWebPlayer}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '15px',
                fontWeight: '700',
                color: '#0066FF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Web Player</span>
              <ExternalLink size={15} />
            </button>
          </nav>

          {/* Auth / Profile Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 14px 6px 8px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0066FF, #38BDF8)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '13px'
                  }}>
                    {user.email ? user.email.charAt(0).toUpperCase() : <User size={16} />}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} color="#64748B" />
                </button>

                {showProfileMenu && (
                  <div
                    className="modal-pop"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '220px',
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.15)',
                      border: '1px solid #E2E8F0',
                      padding: '8px',
                      zIndex: 200
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Signed in as</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                    </div>
                    <button
                      onClick={handleOpenWebPlayer}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#0066FF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Play size={14} /> Open Web Player
                    </button>
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => { setAuthDefaultTab('signin'); setAuthModalOpen(true); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#1E293B',
                    cursor: 'pointer',
                    padding: '8px 16px'
                  }}
                >
                  Log in
                </button>
                <button
                  onClick={() => { setAuthDefaultTab('signup'); setAuthModalOpen(true); }}
                  className="btn-primary"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '20px',
                    fontSize: '14px'
                  }}
                >
                  Sign up free
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '10px',
                width: '40px',
                height: '40px',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1E293B',
                cursor: 'pointer'
              }}
              className="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '72px',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
          }}>
            <a href="#choice" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Overview</a>
            <a href="#why-euphony" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Why Euphony?</a>
            <a href="#download" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Download Apps</a>
            <button
              onClick={() => { setMobileMenuOpen(false); handleOpenWebPlayer(); }}
              className="btn-primary"
              style={{ padding: '12px', borderRadius: '12px', fontSize: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Play size={16} /> Open Web Player
            </button>
          </div>
        )}
      </header>

      {/* ===================== HERO SECTION ===================== */}
      <section style={{
        position: 'relative',
        padding: '70px 24px 90px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(235, 243, 255, 0.9) 0%, #FFFFFF 100%)',
        overflow: 'hidden'
      }}>
        {/* Decorative background glow rings */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 102, 255, 0.12) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Device Detection Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '24px',
            background: 'rgba(0, 102, 255, 0.08)',
            border: '1px solid rgba(0, 102, 255, 0.2)',
            color: '#0066FF',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '28px'
          }}>
            <Sparkles size={15} />
            <span>Detected your device: {detectedDevice.label} • Official v1.0 Ready</span>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: '800',
            color: '#0F172A',
            letterSpacing: '-1.5px',
            lineHeight: 1.15,
            marginBottom: '20px'
          }}>
            Play millions of songs.<br />
            <span style={{
              background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 50%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Unchained & 100% Free.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(16px, 2.2vw, 20px)',
            color: '#475569',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 36px'
          }}>
            Experience real-time 4-stem isolation, personalized smart playlists, and seamless listening on your browser or native apps.
          </p>

          {/* Dual Action Buttons (Spotify Style Choice) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}>
            {/* Primary Choice: Web Player */}
            <button
              onClick={handleOpenWebPlayer}
              className="btn-primary"
              style={{
                padding: '16px 32px',
                borderRadius: '30px',
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Play size={18} fill="#FFFFFF" />
              <span>Open Web Player</span>
            </button>

            {/* Secondary Choice: Install Native App */}
            <a
              href="#download"
              className="btn-secondary"
              style={{
                padding: '16px 28px',
                borderRadius: '30px',
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Download size={18} color="#0066FF" />
              <span>Download for {detectedDevice.label}</span>
            </a>
          </div>

          {/* Quick Metrics / Assurance Badges */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '13px',
            color: '#64748B',
            fontWeight: '600'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10B981" /> No credit card required
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#0066FF" /> Verified clean & safe
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#F59E0B" /> Studio AI stem separator
            </span>
          </div>
        </div>
      </section>

      {/* ===================== SPOTIFY-STYLE CHOICE SECTION ===================== */}
      <section id="choice" style={{ padding: '70px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px', marginBottom: '12px' }}>
            Choose how you want to listen
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '580px', margin: '0 auto' }}>
            Enjoy the full Euphony studio suite instantly in your browser, or install the native standalone app for maximum hardware acceleration.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Card 1: Web Player */}
          <div className="glass-card" style={{ padding: '36px', borderRadius: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Radio size={24} color="#0066FF" />
            </div>
            <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', alignSelf: 'flex-start' }}>
              Instant • Zero Install
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>
              Euphony Web Player
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>
              Start streaming immediately from Chrome, Safari, Edge, or Firefox. Features real-time multi-stem isolation, keyboard shortcuts, and full account synchronization.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', fontSize: '13px', color: '#334155' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0066FF" /> Works in any modern web browser
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0066FF" /> Full 4-stem real-time separation
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0066FF" /> Synced listening history & favorites
              </li>
            </ul>
            <button
              onClick={handleOpenWebPlayer}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Continue on Web Player</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Native App */}
          <div className="glass-card" style={{ padding: '36px', borderRadius: '24px', display: 'flex', flexDirection: 'column', position: 'relative', border: '2px solid rgba(0, 102, 255, 0.4)' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'linear-gradient(135deg, #0066FF, #0052CC)', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recommended
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0, 102, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Download size={24} color="#0066FF" />
            </div>
            <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '8px', background: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', alignSelf: 'flex-start' }}>
              Best Performance
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>
              Euphony Native App
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>
              Download the official desktop or mobile application for your device. Enjoy hardware audio acceleration, system hotkeys, lock-screen notifications, and offline caching.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', fontSize: '13px', color: '#334155' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#10B981" /> System media keys & lock-screen player
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#10B981" /> Dedicated background audio process
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#10B981" /> Available for Windows, Mac, Android, iOS
              </li>
            </ul>
            <a
              href="#download"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Download Native App</span>
              <Download size={16} />
            </a>
          </div>

        </div>
      </section>

      {/* ===================== WHY EUPHONY? (SPOTIFY STYLE) ===================== */}
      <section id="why-euphony" style={{ padding: '80px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1px' }}>Pure Sound. No Compromises.</span>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.8px', marginTop: '8px' }}>
              Why choose Euphony?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px' }}>
            
            {/* Feature 1 */}
            <div className="glass-card" style={{ padding: '28px', borderRadius: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <SlidersHorizontal size={22} color="#0066FF" />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>AI Stem Separator</h4>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                Isolate vocals, mute drums, crank the bass, or create your own karaoke backing track in real-time on any track.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card" style={{ padding: '28px', borderRadius: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Sparkles size={22} color="#10B981" />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>Ultra-Fluid Playback</h4>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                Engineered with hardware compositing and zero-latency audio pipelines so scrolling and playback never skip a beat.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card" style={{ padding: '28px', borderRadius: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Layers size={22} color="#EF4444" />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>Cloud Synced Library</h4>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                Create custom playlists and mark favorite tracks. Your listening history and stats stay synchronized on all your devices.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card" style={{ padding: '28px', borderRadius: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <ShieldCheck size={22} color="#D97706" />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>100% Ad-Free & Private</h4>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                No paywalls, no audio ads between songs, and no invasive trackers. Just pure, uninterrupted musical bliss.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== DOWNLOAD FOR ALL DEVICES ===================== */}
      <section id="download" style={{ padding: '90px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1px' }}>Universal Compatibility</span>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.8px', marginTop: '8px', marginBottom: '12px' }}>
            Download Euphony for your device
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>
            Choose your operating system below to download the official standalone package.
          </p>
        </div>

        {/* 4 Platforms Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {platforms.map(p => {
            const Icon = p.icon;
            const isCurrent = p.id === detectedDevice.os;

            return (
              <div
                key={p.id}
                className="glass-card"
                style={{
                  padding: '28px 24px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: isCurrent ? '2px solid #0066FF' : '1px solid #E2E8F0'
                }}
              >
                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#0066FF',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    whiteSpace: 'nowrap'
                  }}>
                    Your Device
                  </div>
                )}

                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: isCurrent ? '#0066FF' : '#F1F5F9',
                  color: isCurrent ? '#FFFFFF' : '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}>
                  <Icon size={26} />
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                  {p.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                  {p.tagline}
                </span>

                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
                  {p.description}
                </p>

                <div style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: '10px', marginBottom: '20px', fontSize: '11px', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{p.version}</span>
                  <span>{p.size}</span>
                </div>

                {p.id === 'windows' && (
                  <a
                    href={p.downloadUrl}
                    download="Euphony-Setup.exe"
                    className="btn-primary"
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Download size={16} /> Download .exe
                  </a>
                )}

                {p.id === 'android' && (
                  <a
                    href={p.downloadUrl}
                    download="Euphony.apk"
                    className="btn-primary"
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Download size={16} /> Download .apk
                  </a>
                )}

                {p.id === 'mac' && (
                  <a
                    href={p.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <ExternalLink size={16} /> Get for Mac
                  </a>
                )}

                {p.id === 'ios' && (
                  <button
                    onClick={() => setActivePlatformModal(p)}
                    className="btn-secondary"
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Smartphone size={16} /> Install on iOS
                  </button>
                )}

              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer style={{ marginTop: 'auto', background: '#0F172A', color: '#94A3B8', padding: '60px 24px 36px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '30px' }}>
            
            {/* Brand column */}
            <div style={{ maxWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <img src="/logo.png" alt="Euphony" draggable={false} style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>Euphony</span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#64748B' }}>
                The open studio music player. Stream tracks, isolate stems in real-time, and sync music across Windows, Mac, Android, iOS, and the web.
              </p>
            </div>

            {/* Links column */}
            <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>Player</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <button onClick={handleOpenWebPlayer} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: '#94A3B8', transition: 'color 0.2s', cursor: 'pointer', fontSize: '13px' }}>Open Web Player</button>
                  <a href="#download" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Windows App (.exe)</a>
                  <a href="#download" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Android App (.apk)</a>
                  <a href="#download" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>macOS & iOS</a>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>Features</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <a href="#why-euphony" style={{ color: '#94A3B8' }}>AI Stem Separation</a>
                  <a href="#why-euphony" style={{ color: '#94A3B8' }}>Hardware Composited Audio</a>
                  <a href="#why-euphony" style={{ color: '#94A3B8' }}>Smart Playlists</a>
                  <a href="#why-euphony" style={{ color: '#94A3B8' }}>Listening Analytics</a>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>Account</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <button onClick={() => { setAuthDefaultTab('signin'); setAuthModalOpen(true); }} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: '#94A3B8', cursor: 'pointer', fontSize: '13px' }}>Sign In</button>
                  <button onClick={() => { setAuthDefaultTab('signup'); setAuthModalOpen(true); }} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: '#94A3B8', cursor: 'pointer', fontSize: '13px' }}>Sign Up</button>
                  <a href="https://github.com/ayush0807rai/music-app" target="_blank" rel="noreferrer" style={{ color: '#94A3B8' }}>GitHub Repository</a>
                </div>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '12px' }}>
            <span>© {new Date().getFullYear()} Euphony Music Inc. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span>Verified Safe</span>
              <span>100% Free & Open Source</span>
              <span>Powered by Supabase & Vercel</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ===================== AUTH MODAL ===================== */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setRedirectAfterLogin(false);
        }}
        defaultTab={authDefaultTab}
        onAuthSuccess={async (authedUser) => {
          setUser(authedUser);
          setAuthModalOpen(false);
          if (redirectAfterLogin) {
            setRedirectAfterLogin(false);
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.access_token && session?.refresh_token) {
                const ssoUrl = `${WEB_PLAYER_URL}/#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}&token_type=bearer`;
                window.open(ssoUrl, '_blank', 'noopener,noreferrer');
                return;
              }
            } catch (e) {
              console.warn("Could not retrieve session for SSO:", e);
            }
            window.open(WEB_PLAYER_URL, '_blank', 'noopener,noreferrer');
          }
        }}
      />

      {/* ===================== PLATFORM DETAIL MODAL (iOS / Info) ===================== */}
      {activePlatformModal && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setActivePlatformModal(null)}
        >
          <div
            className="modal-pop"
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePlatformModal(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#0066FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Apple size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Install on iPhone / iPad</h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>1-Tap Home Screen App Experience</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0066FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0 }}>1</span>
                <span>Open <strong>Safari</strong> on your iPhone or iPad and navigate to <strong>euphony-music.vercel.app</strong>.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0066FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0 }}>2</span>
                <span>Tap the <strong>Share</strong> button (box with an arrow pointing up) at the bottom of the screen.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0066FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0 }}>3</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong> in the top right.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0066FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0 }}>4</span>
                <span>Launch Euphony directly from your home screen. It will run in full-screen standalone mode with background audio!</span>
              </div>
            </div>

            <button
              onClick={() => { setActivePlatformModal(null); handleOpenWebPlayer(); }}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '15px' }}
            >
              Open Web Player on iOS →
            </button>
          </div>
        </div>
      )}

      {/* Media query styling for responsive header */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
