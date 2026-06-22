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

export default function App() {
  const [mode, setMode] = useState('welcome');
  const [gameOverStats, setGameOverStats] = useState({ score: 0, best: 0, distance: 0 });
  const [user, setUser] = useState(null);
  const engineRef = useRef(null);
  const shellRef = useRef(null);
  const canvasRef = useRef(null);
  const userRef = useRef(null);

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
        <GameOverScreen
          stats={gameOverStats}
          engine={engineRef}
          onHome={() => setMode('instructions')}
          user={user}
        />
      )}

      {isPlaying && (
        <>
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
