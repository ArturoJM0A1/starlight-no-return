import React, { useEffect, useState } from 'react';

let startShown = false;

export default function StartMascot({ user, variant = 'start' }) {
  const oneTime = variant === 'start' ? !startShown : true;
  const [visible, setVisible] = useState(oneTime);

  useEffect(() => {
    if (variant === 'start') {
      if (startShown) return;
      startShown = true;
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [variant]);

  if (!visible) return null;

  const name = user ? user.username : null;
  const isGameOver = variant === 'gameover';
  const isWelcome = variant === 'welcome';
  const isInstructions = variant === 'instructions';

  const msg = isGameOver
    ? 'upss, F :('
    : isWelcome
    ? 'Llega lo más lejos posible y romper tu propio récord'
    : isInstructions
    ? 'Guía de vuelo'
    : `Suerte${name ? `, ${name}` : ''}`;

  return (
    <div style={{
      position: 'fixed',
      left: 12,
      bottom: isInstructions ? 'auto' : 12,
      top: isInstructions ? 12 : 'auto',
      zIndex: 20,
      display: 'flex',
      flexDirection: isInstructions ? 'column' : 'row',
      alignItems: 'flex-start',
      gap: 4,
      pointerEvents: 'none',
      userSelect: 'none',
      maxWidth: isWelcome ? 280 : 'none',
    }}>
      <svg width="72" height="84" viewBox="0 0 72 84" fill="none">
        <defs>
          <radialGradient id="bodyGlow" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#88d0cc" />
            <stop offset="60%" stopColor="#60b8b0" />
            <stop offset="100%" stopColor="#40a098" />
          </radialGradient>
          <radialGradient id="headGlow" cx="40%" cy="25%" r="65%">
            <stop offset="0%" stopColor="#94dcd8" />
            <stop offset="50%" stopColor="#6cc4be" />
            <stop offset="100%" stopColor="#4caca4" />
          </radialGradient>
          <radialGradient id="chestGlow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f0f2f5" />
            <stop offset="100%" stopColor="#d0d4dc" />
          </radialGradient>
          <radialGradient id="eyeGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#88ddff" />
            <stop offset="50%" stopColor="#33aaff" />
            <stop offset="100%" stopColor="#0066cc" />
          </radialGradient>
          <linearGradient id="armGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78ccc6" />
            <stop offset="100%" stopColor="#40a098" />
          </linearGradient>
          <linearGradient id="antennaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>

        {/* shadow */}
        <ellipse cx="36" cy="80" rx="22" ry="4" fill="rgba(0,0,0,0.25)" />

        {/* left arm */}
        <rect x="6" y="38" width="8" height="16" rx="4" fill="url(#armGrad)" stroke="#309088" strokeWidth="0.5" />
        <circle cx="10" cy="56" r="6" fill="#60b8b0" stroke="#309088" strokeWidth="0.5" />
        <circle cx="10" cy="56" r="2.5" fill="#40a098" />

        {/* right arm */}
        <rect x="58" y="38" width="8" height="16" rx="4" fill="url(#armGrad)" stroke="#309088" strokeWidth="0.5" />
        <circle cx="62" cy="56" r="6" fill="#60b8b0" stroke="#309088" strokeWidth="0.5" />
        <circle cx="62" cy="56" r="2.5" fill="#40a098" />

        {/* body */}
        <rect x="16" y="32" width="40" height="34" rx="12" fill="url(#bodyGlow)" stroke="#309088" strokeWidth="0.8" />
        {/* body highlight */}
        <rect x="20" y="34" width="16" height="6" rx="3" fill="rgba(255,255,255,0.25)" />

        {/* chest panel */}
        <rect x="24" y="44" width="24" height="16" rx="6" fill="url(#chestGlow)" stroke="#b0b4bc" strokeWidth="0.6" />
        {/* chest detail */}
        <circle cx="36" cy="51" r="3" fill="#33aaff" opacity="0.6" />
        <rect x="30" y="55" width="12" height="2" rx="1" fill="#c0c4cc" />

        {/* neck joint */}
        <rect x="28" y="28" width="16" height="6" rx="3" fill="#50b0a8" stroke="#309088" strokeWidth="0.5" />
        <rect x="31" y="29" width="10" height="4" rx="2" fill="#6cc4be" />

        {/* head */}
        <rect x="14" y="4" width="44" height="28" rx="14" fill="url(#headGlow)" stroke="#50b0a8" strokeWidth="0.8" />
        {/* head highlight */}
        <ellipse cx="28" cy="10" rx="14" ry="6" fill="rgba(255,255,255,0.2)" />

        {/* face plate */}
        <rect x="18" y="8" width="36" height="20" rx="10" fill="#f0f2f5" stroke="#d0d4dc" strokeWidth="0.6" />
        <rect x="18" y="8" width="36" height="12" rx="10" fill="rgba(255,255,255,0.5)" />

        {/* left eye */}
        <circle cx="29" cy="17" r="5" fill="url(#eyeGlow)" stroke="#0055aa" strokeWidth="0.5" />
        <circle cx="28" cy="16" r="2" fill="rgba(255,255,255,0.6)" />

        {/* right eye */}
        <circle cx="43" cy="17" r="5" fill="url(#eyeGlow)" stroke="#0055aa" strokeWidth="0.5" />
        <circle cx="42" cy="16" r="2" fill="rgba(255,255,255,0.6)" />

        {/* smile */}
        <path d="M31 24 Q36 28 41 24" stroke="#309088" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* antenna */}
        <rect x="33" y="0" width="6" height="6" rx="2" fill="url(#antennaGrad)" stroke="#b8860b" strokeWidth="0.5" />
        <circle cx="36" cy="0" r="4" fill="#ffd166" stroke="#d4af37" strokeWidth="0.5" />
        <circle cx="35" cy="-1" r="1.5" fill="rgba(255,255,255,0.5)" />

        {/* feet */}
        <rect x="20" y="64" width="14" height="8" rx="4" fill="#50b0a8" stroke="#309088" strokeWidth="0.5" />
        <rect x="38" y="64" width="14" height="8" rx="4" fill="#50b0a8" stroke="#309088" strokeWidth="0.5" />
        <rect x="22" y="66" width="10" height="4" rx="2" fill="#6cc4be" />
        <rect x="40" y="66" width="10" height="4" rx="2" fill="#6cc4be" />
      </svg>

      <div style={{
        background: isGameOver
          ? 'linear-gradient(135deg, #f0d0d0, #e8b8b8)'
          : 'linear-gradient(135deg, #f8e8b0, #f0d890)',
        border: `2px solid ${isGameOver ? '#cc6666' : '#d4af37'}`,
        borderRadius: isInstructions ? '8px 8px 8px 0' : '0 8px 8px 8px',
        padding: '6px 12px',
        fontSize: isWelcome ? '0.7rem' : '0.8rem',
        fontWeight: 800,
        color: '#1a1025',
        whiteSpace: isWelcome ? 'normal' : 'nowrap',
        lineHeight: 1.3,
        boxShadow: '0 3px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
        marginBottom: isInstructions ? 0 : 14,
        marginTop: isInstructions ? 4 : 0,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: isInstructions ? 'auto' : -2,
          bottom: isInstructions ? -2 : 'auto',
          width: 8, height: 8,
          background: isGameOver ? '#e8b8b8' : '#f0d890',
          borderLeft: `2px solid ${isGameOver ? '#cc6666' : '#d4af37'}`,
          borderTop: `2px solid ${isGameOver ? '#cc6666' : '#d4af37'}`,
          transform: isInstructions ? 'rotate(-135deg)' : 'rotate(45deg)',
          left: 10,
        }} />
        {msg}
      </div>
    </div>
  );
}
