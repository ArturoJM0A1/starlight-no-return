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

// Detección de dispositivo móvil: combina el User-Agent (expresión regular sobre
// los nombres típicos de navegadores móviles) con el ancho de pantalla < 768px.
// typeof window === 'undefined' protege el SSR (en servidor no hay navigator).
function isMobile() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const mobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
  const smallScreen = window.innerWidth < 768;
  return mobileUA || smallScreen;
}

// Objetos de estilo (JS inline styles). position:fixed + inset:0 cubre toda la
// pantalla; zIndex:9999 garantiza que esta capa quede por encima de cualquier otro
// elemento y bloquee la interacción (advertencia de "solo PC").
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
  /*
    useState devuelve un array con dos elementos: [valorActual, funciónSetter].
    El destructuring `[mode, setMode]` extrae cada uno en una variable.
    mode controla qué pantalla se muestra ('welcome' | 'instructions' | 'playing' | 'gameover').
    Cada vez que setMode se ejecuta, React agenda un nuevo render del componente
    (el Virtual DOM se reconcilia contra el anterior y solo el DOM real cambia lo necesario).
  */
  const [mode, setMode] = useState('welcome');
  // isMobile() se evalúa una vez; como no se pasa setter, `blocked` nunca cambia.
  const [blocked] = useState(isMobile);

  // Render condicional temprano: si es móvil, React devuelve la pantalla de bloqueo
  // y NO llega a ejecutar el resto del componente (ni el motor, ni los efectos).
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

  // Guarda las estadísticas enviadas por el motor cuando termina la partida (prop 'data').
  const [gameOverStats, setGameOverStats] = useState({ score: 0, best: 0, distance: 0 });
  // Estado del usuario autenticado; null = no hay sesión.
  const [user, setUser] = useState(null);

  /*
    useRef crea un objeto { current } que persiste entre renders SIN provocar
    re-render al modificarse (a diferencia de useState).
    - engineRef.current guarda la instancia del motor (initGame) compartida por los hijos.
    - shellRef/canvasRef apuntan a nodos DOM reales para pasarlos al motor.
    - userRef guarda el user actual para que los callbacks del motor lean la versión
      más reciente y no una closure obsoleta del render en que se crearon.
  */
  const engineRef = useRef(null);
  const shellRef = useRef(null);
  const canvasRef = useRef(null);
  const userRef = useRef(null);

  // Mantiene una versión del usuario sincronizada con ref para callbacks del motor (evita closures obsoletas)
  // Actualiza la ref de inmediato (sincrónico) y el estado (que dispara re-render).
  function syncUser(u) {
    userRef.current = u;
    setUser(u);
  }

  /*
    useCallback memoiza la función: devuelve SIEMPRE la misma referencia de función
    mientras sus dependencias ([]) no cambien. Así el engine.js lo recibe estable
    y el useEffect que depende de él no se re-cree en cada render.
    newMode/data es el contrato de comunicación motor -> React.
  */
  const handleModeChange = useCallback((newMode, data) => {
    setMode(newMode);
    if (newMode === 'gameover' && data) {
      setGameOverStats(data);
      // IIFE asíncrona: se ejecuta al vuelo. Two-step: primero guardar el récord
      // (solo si supera el previo), luego re-leer el perfil para sincronizar bestScore.
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
              // Spread ({ ...u, bestScore }) copia el objeto anterior y sobrescribe bestScore.
              syncUser({ ...u, bestScore: profile.bestScore || 0 });
            }
          } catch (_) { /* silencioso */ }
        })();
      }
    }
  }, []);

  // Inicializa el motor al montar; destruye al desmontar (limpia todos los listeners)
  /*
    useEffect se ejecuta DESPUÉS del primer render (side effects). Aquí:
    1. Comprueba que el canvas existe (ref ya asignada al montar el DOM).
    2. Llama a initGame pasándole el nodo canvas y opciones; initGame registra
       listeners y arranca el bucle requestAnimationFrame, y devuelve la API pública.
    3. La función retornada es la "limpieza": React la ejecuta antes de desmontar
       (y en StrictMode justo después del primer montaje de prueba) para liberar
       listeners y cancelar el bucle, evitando memory leaks.
    Dependencia [handleModeChange]: como la función es estable (useCallback),
    el efecto corre una sola vez.
  */
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
  /*
    onAuthStateChanged registra un listener que Firebase invoca:
    - inmediatamente, con la sesión vigente (por el token almacenado localmente);
    - luego, cada vez que la sesión cambia (login/logout).
    Retorna una función `unsub` para desuscribirse (limpieza del efecto).
  */
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

  // Prop callback de los modales: sube el usuario autenticado al estado de App.
  function handleAuth(u) {
    syncUser(u);
  }

  // Booleano derivado: se recalcula en cada render sin estado extra.
  const isPlaying = mode === 'playing';

  return (
    <div className="game-shell" ref={shellRef}>
      {/* El canvas recibe una ref para que engine.js dibuje sobre él. */}
      <GameCanvas ref={canvasRef} />

      {/* Render condicional por modo: los componentes se montan y desmontan
          según el valor de `mode`, que cambia vía onModeChange del motor o
          por los botones de las pantallas. */}
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
          {/* HUD y toasts muestran contenedores (ids) que el motor actualiza por DOM. */}
          <HUD />
          <PhaseToast />
          <ComboToast />
          <TouchControls engine={engineRef} />
        </>
      )}
    </div>
  );
}
