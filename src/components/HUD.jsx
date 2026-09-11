import React from 'react';

/*
  HUD (Heads-Up Display): capa de interfaz sobre el lienzo del juego.
  Este componente es un TIPO DE "contenedor tonto": todos sus elementos llevan
  id con los que el motor (engine.js) los localiza con getElementById y actualiza
  su contenido/visibilidad directamente por DOM — React no interviene en esas
  escrituras, por lo que el HUD no se re-renderiza con cada frame.

  aria-live="polite": un lector de pantalla anuncia los cambios de contenido
  sin interrumpir la lectura (accesibilidad).

  La clase `hidden` (definida en styles.css) los oculta vía display:none.
  Los paneles de power-ups inician ocultos y el motor los muestra sólo cuando
  el efecto está activo (textContent/.classList mutate directo).
*/
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
      {/* Paneles dinámicos: el engine.js busca estos ids y alterna la clase hidden. */}
      <div id="invisibleIndicator" className="hud-panel hidden" style={{ background: 'rgba(255, 215, 0, 0.3)', borderColor: '#ffd166' }}>
        <span>✨ INVISIBLE</span><strong id="invisTime">0s</strong>
      </div>
      <div id="allyIndicator" className="hud-panel hidden" style={{ background: 'rgba(140, 255, 178, 0.3)', borderColor: '#8cffb2' }}>
        <span>🚀 ALIADO</span><strong id="allyTime">0s</strong>
      </div>
      <div id="whirlpoolIndicator" className="hud-panel hidden" style={{ background: 'rgba(78, 231, 213, 0.3)', borderColor: '#4ee7d5' }}>
        <span>🌀 REMOLINO</span><strong id="wpTime">0s</strong><span style={{fontSize: '0.55rem'}}> restantes</span>
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
