import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../context/AuthContext.jsx';
import { getErrorMessage } from '../lib/api.js';

// Renders the real Google "Sign in with Google" button using Google Identity
// Services (loaded via the <script> tag in index.html), and exchanges the
// resulting credential (ID token) with our backend at POST /api/auth/google.
//
// IMPORTANT: Google's script injects its own DOM (an iframe) directly into
// `mountRef`'s div, completely outside React's control. That div must NEVER
// have React-rendered children of its own, or React's reconciler and Google's
// script will fight over the same DOM nodes and crash with a removeChild error
// (this bites people in React 18 StrictMode especially, since effects run twice
// in dev). All status text below is rendered in a *separate* sibling element.
export default function GoogleButton({ onSuccess }) {
  const mountRef = useRef(null);
  const initializedRef = useRef(false);
  const { loginWithGoogle } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | ready | unconfigured | failed
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || clientId === 'your_google_oauth_client_id') {
      setStatus('unconfigured');
      return;
    }

    let cancelled = false;

    const handleCredentialResponse = async (response) => {
      try {
        await loginWithGoogle(response.credential);
        toast.success('Logged in with Google!');
        onSuccess?.();
      } catch (err) {
        console.error('Google login exchange failed:', err);
        toast.error(getErrorMessage(err));
      }
    };

    const init = () => {
      if (cancelled || !window.google?.accounts?.id || !mountRef.current) return;
      // Guard against React StrictMode's dev-only double effect invocation —
      // only ever initialize/render the Google button once per real mount.
      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          ux_mode: 'popup',
          auto_select: false
        });
        window.google.accounts.id.renderButton(mountRef.current, {
          theme: 'outline', size: 'large', width: 320, text: 'continue_with', shape: 'pill'
        });
        setStatus('ready');
      } catch (err) {
        console.error('Google Identity Services failed to initialize:', err);
        setStatus('failed');
      }
    };

    // The GSI script (index.html) may still be loading — poll briefly for it.
    if (window.google?.accounts?.id) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          init();
        }
      }, 200);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!cancelled && !window.google?.accounts?.id) {
          console.error('Google Identity Services script never loaded (accounts.google.com/gsi/client). Check your network/ad-blocker.');
          setStatus('failed');
        }
      }, 8000);
      return () => {
        cancelled = true;
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => {
      cancelled = true;
      // Wipe whatever Google injected before React's own cleanup runs, so a
      // remount (StrictMode, or navigating away and back) starts clean instead
      // of leaving orphaned nodes for React to trip over.
      if (mountRef.current) mountRef.current.innerHTML = '';
      initializedRef.current = false;
    };
  }, [clientId, loginWithGoogle, onSuccess]);

  return (
    <div className="w-full">
      {/* This div is Google's exclusive territory — React never renders children into it. */}
      <div ref={mountRef} className="flex w-full justify-center min-h-[44px]" />

      {status === 'loading' && (
        <p className="py-3 text-center text-xs text-slate-400">Loading Google Sign-In...</p>
      )}
      {status === 'unconfigured' && (
        <div className="rounded-full border border-dashed border-slate-300 dark:border-white/10 px-4 py-3 text-center text-xs text-slate-400">
          Google Sign-In isn't configured — set VITE_GOOGLE_CLIENT_ID in client/.env
        </div>
      )}
      {status === 'failed' && (
        <div className="rounded-full border border-dashed border-red-300 dark:border-red-500/30 px-4 py-3 text-center text-xs text-red-500">
          Google Sign-In couldn't load. This usually means the current URL isn't added to
          "Authorized JavaScript origins" for your Google OAuth Client ID — check the browser
          console for details, or use email login below.
        </div>
      )}
    </div>
  );
}
