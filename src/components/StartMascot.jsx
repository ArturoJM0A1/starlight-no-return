import React, { useEffect, useState } from 'react';

let shown = false;

export default function StartMascot({ user }) {
  const [visible, setVisible] = useState(!shown);

  useEffect(() => {
    if (shown) return;
    shown = true;
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const name = user ? user.username : null;

  return (
    <div style={{
      position: 'absolute',
      left: 12,
      bottom: 12,
      zIndex: 20,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 2,
      pointerEvents: 'none',
      userSelect: 'none',
    }}>
      <div style={{
        background: '#cc2233',
        borderRadius: '30% 30% 20% 20% / 40% 40% 30% 30%',
        width: 48,
        height: 52,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 -4px 0 rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)',
        position: 'relative',
      }}>
        <div style={{
          width: 22, height: 10,
          background: '#aa1a2a',
          borderRadius: '30% 30% 0 0',
          marginTop: -8,
          boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.25)',
        }} />
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <div style={{
            width: 8, height: 10,
            background: '#fff',
            borderRadius: '50%',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
          }} />
          <div style={{
            width: 8, height: 10,
            background: '#fff',
            borderRadius: '50%',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
          }} />
        </div>
        <div style={{
          width: 12, height: 4,
          background: '#881122',
          borderRadius: 4,
          marginTop: 4,
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
        }} />
      </div>
      <div style={{
        background: '#f8e8b0',
        border: '2px solid #d4af37',
        borderRadius: '0 6px 6px 6px',
        padding: '5px 10px',
        fontSize: '0.75rem',
        fontWeight: 800,
        color: '#1a1025',
        whiteSpace: 'nowrap',
        boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
        marginBottom: 8,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -2, left: -2,
          width: 8, height: 8,
          background: '#f8e8b0',
          borderLeft: '2px solid #d4af37',
          borderTop: '2px solid #d4af37',
          transform: 'rotate(45deg)',
          left: 6,
        }} />
        Suerte{name ? `, ${name}` : ''}
      </div>
    </div>
  );
}
