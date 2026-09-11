import React from 'react';

/*
  Contenedor vacío para el "toast" de combos. El texto y la visibilidad los
  controla engine.js directamente (showComboToast): escribe en textContent,
  quita/añade la clase `hidden` y programa un setTimeout para ocultarlo.
  Por eso este componente no tiene estado ni props: solo debe existir en el DOM
  en el momento de la partida para que el motor lo encuentre por id="comboToast".
*/
export default function ComboToast() {
  return <div id="comboToast" className="combo-toast hidden"></div>;
}
