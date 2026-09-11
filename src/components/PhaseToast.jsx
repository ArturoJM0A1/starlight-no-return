import React from 'react';

/*
  Contenedor del aviso de cambio de fase. Al igual que ComboToast, es un
  contenedor "tonto": el motor (showPhaseToast) llena su textContent y alterna
  la clase .hidden con un timeout de 1.9s. React solo asegura que el <div>
  exista durante la partida.
*/
export default function PhaseToast() {
  return <div id="phaseToast" className="phase-toast hidden"></div>;
}
