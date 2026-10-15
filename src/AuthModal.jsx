import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from './supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultTab = 'signin', onRedirectToWebPlayer }) {
  const [tab, setTab] = useState(defaultTab); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://euphony-music.vercel.app'
        });
        if (error) throw error;
        setSuccessMsg('Password reset instructions sent! Please check your email inbox.');
      } else if (tab === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        setSuccessMsg('Account created! Welcome to Euphony.');
        if (data?.session) {
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess(data.session.user);
          }, 800);
        } else {
          setSuccessMsg('Account created! If confirmation is enabled, check your email to verify.');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        setSuccessMsg('Successfully signed in!');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(data.user);
        }, 600);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="modal-pop"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 102, 255, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          padding: '36px 32px',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748B',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            margin: '0 auto 14px',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0, 102, 255, 0.25)',
            border: '2px solid #E2E8F0'
          }}>
            <img src="/logo.png" alt="Euphony Logo" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {tab === 'signin' && 'Welcome back to Euphony'}
            {tab === 'signup' && 'Create your free account'}
            {tab === 'forgot' && 'Reset your password'}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            {tab === 'signin' && 'Sign in to access your library, playlists, and stem player.'}
            {tab === 'signup' && 'Join free to sync listening history and stream without ads.'}
            {tab === 'forgot' && "Enter your account email and we'll send a recovery link."}
          </p>
        </div>

        {/* Tab Switcher */}
        {tab !== 'forgot' && (
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => { setTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: tab === 'signin' ? '700' : '600',
                color: tab === 'signin' ? '#0066FF' : '#64748B',
                background: tab === 'signin' ? '#FFFFFF' : 'transparent',
                boxShadow: tab === 'signin' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: tab === 'signup' ? '700' : '600',
                color: tab === 'signup' ? '#0066FF' : '#64748B',
                background: tab === 'signup' ? '#FFFFFF' : 'transparent',
                boxShadow: tab === 'signup' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Status Messages */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '12px',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '18px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '12px',
            background: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#15803D',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '18px'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={e => { e.target.style.borderColor = '#0066FF'; e.target.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                  Password
                </label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      color: '#0066FF',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#0066FF'; e.target.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-animate" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {tab === 'signin' && 'Sign In to Euphony'}
                  {tab === 'signup' && 'Create Free Account'}
                  {tab === 'forgot' && 'Send Recovery Email'}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {tab !== 'forgot' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px 0', width: '100%' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
              <span style={{ margin: '0 12px', color: '#94A3B8', fontSize: '13px', fontWeight: '600' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '14px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#0F172A',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#94A3B8';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

        {tab === 'forgot' && (
          <div style={{ textAlign: 'center', marginTop: '18px' }}>
            <button
              type="button"
              onClick={() => { setTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0066FF',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#94A3B8', lineHeight: '1.5' }}>
          By continuing, you agree to Euphony's Terms and Privacy Policy. Account credentials sync automatically across Web, Windows, Mac, Android, and iOS.
        </div>
      </div>
    </div>
  );
}
