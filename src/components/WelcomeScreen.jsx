import React, { useState } from 'react';
import AuthModal from './AuthModal';
import TopGlobalModal from './TopGlobalModal';

const goldBtn = {
  marginTop: 20, padding: '12px 28px', fontSize: '0.95rem', fontWeight: 700,
  background: 'linear-gradient(135deg, #f6d365, #fda085, #f6d365)',
  backgroundSize: '200% auto',
  border: 0, borderRadius: 8, color: '#1a1025', cursor: 'pointer',
  boxShadow: '0 0 20px rgba(253, 160, 133, 0.4), 0 4px 15px rgba(0,0,0,0.3)',
  letterSpacing: '0.5px',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const ghostBtn = {
  marginLeft: 8, padding: '10px 22px', fontSize: '0.9rem', fontWeight: 700,
  background: 'linear-gradient(135deg, #0d7377, #14bdad)',
  border: 0, borderRadius: 8,
  color: '#f8fbff', cursor: 'pointer', letterSpacing: '0.5px',
  boxShadow: '0 0 18px rgba(20, 189, 173, 0.5), 0 4px 12px rgba(0,0,0,0.3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

export default function WelcomeScreen({ onNext, engine, onAuth, user }) {
  const [showAuth, setShowAuth] = useState(false);
  const [showTop, setShowTop] = useState(false);

  return (
    <section id="welcomeScreen" className="screen screen-welcome">
      <style>{`
        .bounce-btn {
          background: linear-gradient(135deg, #1a73e8, #4a90d9, #1a73e8) !important;
          background-size: 200% auto !important;
          animation: bounce 1.2s ease-in-out infinite !important;
          position: relative !important;
          overflow: hidden !important;
        }
        .bounce-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(253, 160, 133, 0.35), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-18px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes shimmerText {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="brand-row">
        <div className="mini-rocket" aria-hidden="true"></div>
        <span>Bienvenido, piloto</span>
      </div>
      <h1 style={{
        fontFamily: "'Euphorigenic', serif",
        fontSize: 'clamp(2rem, 6vw, 5rem)',
        padding: '14px 15px',
        letterSpacing: '0.08em',
        background: 'linear-gradient(135deg, #ffffff, #f8e8b0, #d4af37, #f8e8b0, #ffffff)',
        backgroundSize: '250% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 0 15px rgba(212,175,55,0.4)) drop-shadow(0 0 40px rgba(212,175,55,0.15)) drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
        animation: 'shimmerText 3s ease-in-out infinite',
      }}>
        Starlight: No Return
      </h1>
      <h3>By: Arturo Juárez Monroy</h3>
      <p style={{ marginTop: 2, fontSize: '0.8rem', color: 'rgba(246, 211, 101, 0.8)', textAlign: 'center' }}>
        Juego para computadora (no disponible en celular)
      </p>
      <div className="welcome-actions">
        <button id="nextButton" className="primary-button bounce-btn" onClick={onNext}>
          Continuar
        </button>
        <button
          id="muteButtonIntro"
          className="ghost-button"
          aria-pressed="false"
          onClick={() => { if (engine.current) engine.current.toggleMute(); }}
        >
          Sonido
        </button>
      </div>
      {user ? (
        <p style={{ marginTop: 18, fontSize: '0.8rem', color: '#b8c4d9', textAlign: 'center' }}>
          Hola <span style={{ color: '#f6d365', fontWeight: 600 }}>{user.username}</span>
        </p>
      ) : (
        <p style={{ marginTop: 18, fontSize: '0.8rem', color: '#b8c4d9', textAlign: 'center' }}>
          ¿No te has logeado? <span style={{ color: '#f6d365', fontWeight: 600 }}>Regístrate para competir 👇</span>
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <button
          style={goldBtn}
          onClick={() => setShowAuth(true)}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(253, 160, 133, 0.6), 0 6px 20px rgba(0,0,0,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(253, 160, 133, 0.4), 0 4px 15px rgba(0,0,0,0.3)'; }}
        >
          ✦ Iniciar sesión / Registrarse ✦
        </button>
        <button
          style={ghostBtn}
          onClick={() => setShowTop(true)}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(20, 189, 173, 0.7), 0 6px 18px rgba(0,0,0,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 18px rgba(20, 189, 173, 0.5), 0 4px 12px rgba(0,0,0,0.3)'; }}
        >
          Top
        </button>
      </div>
      <footer className="contact-footer">
        <a href="https://github.com/ArturoJM0A1" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://arturojuarezmonroy.vercel.app/" target="_blank" rel="noopener noreferrer">Web</a>
        <a href="https://x.com/juarez_mon84035" target="_blank" rel="noopener noreferrer">Twitter</a>
        <a href="https://api.whatsapp.com/send/?phone=5217736802105&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </footer>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={onAuth} />}
      {showTop && <TopGlobalModal onClose={() => setShowTop(false)} />}
    </section>
  );
}
