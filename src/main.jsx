import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

/*
  Punto de entrada de la aplicación React.
  ReactDOM.createRoot crea la "raíz" de React y la asocia al nodo del DOM
  con id="root" (definido en index.html). A partir de aquí React se hace cargo
  de montar y gestionar el árbol de componentes.

  .render(<App/>) monta el componente <App/> dentro de esa raíz: React ejecuta
  App y sus hijos, construye el Virtual DOM y lo sincroniza con el DOM real.

  <React.StrictMode> envuelve App en modo estricto de desarrollo:
  - Mounts, remounts y efectos de React se ejecutan dos veces para detectar
    efectos con limpieza incorrecta o código impuro.
  - Se usa para verificar que los componentes (y sus useEffect) sean seguros
    y no dependan de efectos secundarios no idempotentes.
*/
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
