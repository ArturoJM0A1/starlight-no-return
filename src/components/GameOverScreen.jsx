import React, { useEffect, useState } from 'react';
import { getUserProfile, getTopPlayers } from '../firebase';
import ContactFooter from './ContactFooter';

const row = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem' };
const label = { color: '#b8c4d9' };
const value = { color: '#f6d365', fontWeight: 700, fontVariantNumeric: 'tabular-nums' };

export default function GameOverScreen({ stats, engine, onHome, user }) {
  const [userBest, setUserBest] = useState(null);
  const [globalBest, setGlobalBest] = useState(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((p) => {
        if (p) setUserBest(p.bestScore || 0);
      }).catch(() => {});
    }
    getTopPlayers(1).then((list) => {
      if (list.length > 0) setGlobalBest(list[0]);
    }).catch(() => {});
  }, [user]);

  return (
    <section id="gameOverScreen" className="screen">
      <div className="brand-row">
        <div className="mini-rocket" aria-hidden="true"></div>
        <span>Fin del viaje</span>
      </div>
      <h2>El cohete perdió estabilidad</h2>
      <p id="finalStats" className="lead">
        Puntuacion: {Math.round(stats.score)} · Mejor marca: {Math.round(stats.best)} · Distancia: {Math.round(stats.distance)} m
      </p>

      <div style={{ width: '100%', maxWidth: 300, margin: '16px auto 0' }}>
        {user && (
          <>
            <div style={row}>
              <span style={label}>Jugador</span>
              <span style={value}>{user.username}</span>
            </div>
            <div style={row}>
              <span style={label}>Tu mejor puntuación</span>
              <span style={value}>{userBest !== null ? userBest.toLocaleString('es-MX') : '...'}</span>
            </div>
          </>
        )}
        <div style={row}>
          <span style={label}>Puntuación de la sesión</span>
          <span style={value}>{Math.round(stats.score).toLocaleString('es-MX')}</span>
        </div>
        <div style={row}>
          <span style={label}>Mejor puntuación global</span>
          <span style={value}>
            {globalBest ? `${globalBest.username} — ${globalBest.bestScore.toLocaleString('es-MX')}` : '...'}
          </span>
        </div>
      </div>

      <div className="welcome-actions">
        <button
          id="restartButton"
          className="primary-button"
          onClick={() => { if (engine.current) engine.current.startGame(); }}
        >
          Reintentar
        </button>
        <button
          id="homeButton"
          className="ghost-button"
          onClick={() => {
            if (engine.current) engine.current.returnHome();
            if (onHome) onHome();
          }}
        >
          Instrucciones
        </button>
      </div>
      <ContactFooter />
    </section>
  );
}
