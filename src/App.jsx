import React, { useState, useRef, useEffect, useCallback } from 'react';
import { initGame } from './game/engine';
import { saveBestScore, getUserProfile, auth, onAuthStateChanged } from './firebase';
import WelcomeScreen from './components/WelcomeScreen';
import InstructionsScreen from './components/InstructionsScreen';
import GameOverScreen from './components/GameOverScreen';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import PhaseToast from './components/PhaseToast';
import ComboToast from './components/ComboToast';
import TouchControls from './components/TouchControls';
import UserBadge from './components/UserBadge';
import StartMascot from './components/StartMascot';

function isMobile() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const mobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
  const smallScreen = window.innerWidth < 768;
  return mobileUA || smallScreen;
}

const mobileBlockStyle = {
  position: 'fixed', inset: 0, zIndex: 9999,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  background: 'linear-gradient(135deg, #0f0c29, #1a1145, #0d2137)',
  color: '#f8fbff', textAlign: 'center', padding: 32,
};

const mobileBlockTitle = {
  fontSize: '1.4rem', fontWeight: 700, marginBottom: 16,
  color: '#f6d365',
};

const mobileBlockText = {
  fontSize: '1rem', color: '#b8c4d9', lineHeight: 1.5, maxWidth: 320,
};

export default function App() {
  const [mode, setMode] = useState('welcome');
  const [blocked] = useState(isMobile);

  if (blocked) {
    return (
      <div style={mobileBlockStyle}>
        <div style={mobileBlockTitle}>Starlight No Return</div>
        <div style={mobileBlockText}>
          Lo sentimos, este juego solo está disponible para PC.<br /><br />
          Abre el juego desde una computadora para disfrutar la experiencia completa.
        </div>
      </div>
    );
  }
  const [gameOverStats, setGameOverStats] = useState({ score: 0, best: 0, distance: 0 });
  const [user, setUser] = useState(null);
  const engineRef = useRef(null);
  const shellRef = useRef(null);
  const canvasRef = useRef(null);
  const userRef = useRef(null);

  // Mantiene una versión del usuario sincronizada con ref para callbacks del motor (evita closures obsoletas)
  function syncUser(u) {
    userRef.current = u;
    setUser(u);
  }

  const handleModeChange = useCallback((newMode, data) => {
    setMode(newMode);
    if (newMode === 'gameover' && data) {
      setGameOverStats(data);
      const u = userRef.current;
      if (u) {
        (async () => {
          try {
            if (data.score > (u.bestScore || 0)) {
              await saveBestScore(u.uid, data.score);
            }
          } catch (_) { /* silencioso */ }
          try {
            const profile = await getUserProfile(u.uid);
            if (profile) {
              syncUser({ ...u, bestScore: profile.bestScore || 0 });
            }
          } catch (_) { /* silencioso */ }
        })();
      }
    }
  }, []);

  // Inicializa el motor al montar; destruye al desmontar (limpia todos los listeners)
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = initGame(canvasRef.current, {
      shellRef,
      onModeChange: handleModeChange,
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [handleModeChange]);

  // Persiste el estado de autenticación al recargar la página (Firebase onAuthStateChanged)
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        getUserProfile(firebaseUser.uid).then((profile) => {
          if (profile) {
            syncUser({
              uid: firebaseUser.uid,
              username: firebaseUser.displayName || profile.username,
              email: profile.email || firebaseUser.email,
              bestScore: profile.bestScore || 0,
            });
          }
        }).catch(() => {});
      }
    });
    return () => unsub();
  }, []);

  function handleAuth(u) {
    syncUser(u);
  }

  const isPlaying = mode === 'playing';

  return (
    <div className="game-shell" ref={shellRef}>
      <GameCanvas ref={canvasRef} />

      {mode === 'welcome' && (
        <WelcomeScreen
          onNext={() => setMode('instructions')}
          engine={engineRef}
          onAuth={handleAuth}
          user={user}
        />
      )}
      {mode === 'instructions' && (
        <InstructionsScreen
          onBack={() => setMode('welcome')}
          engine={engineRef}
        />
      )}
      {mode === 'gameover' && (
        <>
          <StartMascot user={user} variant="gameover" />
          <GameOverScreen
            stats={gameOverStats}
            engine={engineRef}
            onHome={() => setMode('instructions')}
            user={user}
          />
        </>
      )}

      {isPlaying && (
        <>
          <StartMascot user={user} />
          <UserBadge user={user} />
          <HUD />
          <PhaseToast />
          <ComboToast />
          <TouchControls engine={engineRef} />
        </>
      )}
    </div>
  );
}
