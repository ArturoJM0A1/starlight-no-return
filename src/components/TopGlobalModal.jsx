import React, { useEffect, useState } from 'react';
import { getTopPlayers } from '../firebase';

const overlay = {
  position: 'absolute', inset: 0, zIndex: 20,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
};

const card = {
  background: 'linear-gradient(135deg, #0a2a2f, #0d3d40, #062025)',
  border: '1px solid rgba(253, 160, 133, 0.25)',
  borderRadius: 16, padding: '24px 28px', width: 820,
  maxWidth: 'calc(100% - 32px)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(253, 160, 133, 0.15)',
  display: 'flex', flexDirection: 'column',
};

const title = {
  fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', color: '#f6d365',
  marginBottom: 16,
};

const bodyRow = {
  display: 'flex', gap: 48, flex: 1, minHeight: 0,
};

const listWrap = {
  flex: 1, overflowY: 'auto', maxHeight: '55vh',
};

const list = {
  listStyle: 'none', padding: 0, margin: 0,
};

const row = (i, isMe) => ({
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '8px 12px',
  background: isMe ? '#0a2d5c' : (i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'),
  borderRadius: 6, marginBottom: 2,
});

const rank = {
  width: 28, fontSize: '0.8rem', fontWeight: 700, color: '#b8c4d9', textAlign: 'center',
};

const nameCell = {
  flex: 1, fontSize: '0.85rem', color: '#f8fbff', marginLeft: 8,
};

const scoreCell = {
  fontSize: '0.8rem', color: '#f6d365', fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
};

const empty = {
  textAlign: 'center', color: '#b8c4d9', fontSize: '0.85rem', padding: 20,
};

const closeBtn = {
  position: 'absolute', top: 10, right: 14,
  background: 'none', border: 0, color: '#ff6b6b',
  fontSize: '2.4rem', cursor: 'pointer', lineHeight: 1,
};

const rightPanel = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'flex-start', width: 240, flexShrink: 0,
};

const champImg = {
  width: '100%', height: '36vh', objectFit: 'cover',
  borderRadius: 10,
  filter: 'contrast(1.1) brightness(1.05) saturate(1.15)',
};

const champMsg = {
  fontSize: '1rem', color: '#f6d365', textAlign: 'center',
  marginTop: 12, lineHeight: 1.3, fontWeight: 600,
};

export default function TopGlobalModal({ user, onClose }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopPlayers()
      .then(setPlayers)
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, []);

  const champ = players.length > 0 ? players[0] : null;

  return (
    <div style={overlay}>
      <style>{`
        .champ-msg {
          animation: champGlow 2s ease-in-out infinite;
        }
        @keyframes champGlow {
          0%, 100% { opacity: 0.7; text-shadow: 0 0 4px rgba(253,160,133,0.3); }
          50% { opacity: 1; text-shadow: 0 0 16px rgba(253,160,133,0.8), 0 0 32px rgba(246,211,101,0.4); }
        }
        .list-wrap::-webkit-scrollbar {
          width: 5px;
        }
        .list-wrap::-webkit-scrollbar-track {
          background: transparent;
        }
        .list-wrap::-webkit-scrollbar-thumb {
          background: rgba(78, 231, 213, 0.4);
          border-radius: 4px;
        }
        .list-wrap::-webkit-scrollbar-thumb:hover {
          background: rgba(78, 231, 213, 0.6);
        }
      `}</style>
      <div style={card}>
        <button style={closeBtn} onClick={onClose} aria-label="Cerrar">&times;</button>
        <div style={title}>Top Global</div>

        {loading ? (
          <div style={empty}>Cargando...</div>
        ) : players.length === 0 ? (
          <div style={empty}>Aún no hay puntuaciones</div>
        ) : (
          <div style={bodyRow}>
            <div style={listWrap} className="list-wrap">
              <ul style={list}>
                {players.map((p, i) => (
                  <li key={p.uid} style={row(i, user && p.username === user.username)}>
                    <span style={rank}>#{i + 1}</span>
                    <span style={nameCell}>{p.username}</span>
                    <span style={scoreCell}>{p.bestScore.toLocaleString('es-MX')}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={rightPanel}>
              <img src="/elnumero1.png" alt="#1" style={champImg} />
              <div style={champMsg} className="champ-msg">Felicidades {champ.username} eres el número 1 🏆</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
