import React from 'react';

/*
  Botones táctiles (dash y pulso). Reciben `engine` (la ref del motor) como prop.
  onPointerDown es el callback del evento Pointer API (unifica mouse/touch);
  previene el comportamiento por defecto para que tocar no produzca scroll/focus.
  `engine.current` es la instancia del motor (API pública), y se llama su método
  triggerX solo si existe (operador de cortocircuito &&). Estos eventos ocurren
  fuera del sistema de eventos de React del motor: son un "puente" entre el
  DOM de React y el bucle imperativo del canvas.
*/
export default function TouchControls({ engine }) {
  return (
    <div id="touchControls" className="touch-controls" aria-hidden="false">
      <button
        id="dashTouch"
        className="touch-button"
        onPointerDown={(e) => {
          e.preventDefault();
          if (engine.current) engine.current.triggerDash();
        }}
      >
        Deslizar
      </button>
      <button
        id="pulseTouch"
        className="touch-button pulse"
        onPointerDown={(e) => {
          e.preventDefault();
          if (engine.current) engine.current.triggerPulse();
        }}
      >
        Pulso
      </button>
    </div>
  );
}
