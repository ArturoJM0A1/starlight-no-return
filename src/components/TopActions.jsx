import React from 'react';

export default function TopActions({ engine }) {
  return (
    <div className="top-actions">
      <button
        id="muteButton"
        className="icon-button"
        title="Activar o silenciar sonido"
        aria-label="Sonido"
        onClick={() => { if (engine.current) engine.current.toggleMute(); }}
      >
        ♪
      </button>
    </div>
  );
}
