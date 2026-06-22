import React from 'react';

export default function HUD() {
  return (
    <div id="hud" className="hud" aria-live="polite">
      <div className="hud-panel">
        <span>Puntos</span>
        <strong id="scoreValue">0</strong>
      </div>
      <div className="hud-panel">
        <span>Fase</span>
        <strong id="phaseValue">Calma</strong>
      </div>
      <div className="hud-panel energy-panel">
        <span>Pulso</span>
        <strong id="energyValue">5</strong>
      </div>
      <div className="hud-panel ammo-panel">
        <span>Balas</span>
        <strong id="ammoValue">30</strong>
      </div>
      <div className="hud-panel health-panel">
        <span>Vidas</span>
        <strong id="healthValue">6</strong>
      </div>
      <div id="invisibleIndicator" className="hud-panel hidden" style={{ background: 'rgba(255, 215, 0, 0.3)', borderColor: '#ffd166' }}>
        <span>✨ INVISIBLE</span><strong id="invisTime">0s</strong>
      </div>
      <div id="allyIndicator" className="hud-panel hidden" style={{ background: 'rgba(140, 255, 178, 0.3)', borderColor: '#8cffb2' }}>
        <span>🚀 ALIADO</span><strong id="allyTime">0s</strong>
      </div>
      <div id="whirlpoolIndicator" className="hud-panel hidden" style={{ background: 'rgba(78, 231, 213, 0.3)', borderColor: '#4ee7d5' }}>
        <span>🌀 REMOLINO</span><strong id="wpTime">0s</strong><span style={{fontSize: '0.7rem'}}> restantes</span>
      </div>
      <div id="frozenIndicator" className="hud-panel hidden" style={{ background: 'rgba(136, 204, 255, 0.3)', borderColor: '#88ccff' }}>
        <span>❄️ HIELO</span><strong id="iceTime">0s</strong>
      </div>
      <div id="lightningIndicator" className="hud-panel hidden" style={{ background: 'rgba(184, 244, 255, 0.3)', borderColor: '#b8f4ff' }}>
        <span>⚡ RAYO</span><strong id="lightningCount">4</strong>
      </div>
      <div id="arrowIndicator" className="hud-panel hidden" style={{ background: 'rgba(200, 164, 92, 0.3)', borderColor: '#c8a45c' }}>
        <span>🏹 FLECHAS</span><strong id="arrowCount">5</strong>
      </div>
    </div>
  );
}
