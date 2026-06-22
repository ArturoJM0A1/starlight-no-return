import React from 'react';
import ContactFooter from './ContactFooter';

const s = (d) => ({ __html: `<svg viewBox="0 0 20 20" width="20" height="20" style="flex-shrink:0">${d}</svg>` });

const ICONS = {
  heart: s('<path d="M10 17.5S3 12.5 3 8a4 4 0 0 1 7-2.5A4 4 0 0 1 17 8c0 4.5-7 9.5-7 9.5z" fill="#ff4b6e"/>'),
  ammo: s('<rect x="3" y="6" width="14" height="8" rx="1" fill="#ffd166"/><rect x="6" y="8" width="8" height="4" fill="#f8fbff"/>'),
  rainbow: s('<defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff0000"/><stop offset=".16" stop-color="#ff8800"/><stop offset=".33" stop-color="#ffff00"/><stop offset=".5" stop-color="#00ff00"/><stop offset=".66" stop-color="#0088ff"/><stop offset=".83" stop-color="#4400ff"/><stop offset="1" stop-color="#ff00ff"/></linearGradient></defs><rect x="2" y="2" width="16" height="16" rx="2" fill="url(#rg)" stroke="white" stroke-width="1.5"/>'),
  greenRocket: s('<polygon points="10,2 3,17 17,17" fill="#6fbf4c" stroke="#8cffb2" stroke-width="1"/><circle cx="10" cy="12" r="3" fill="#f8fbff"/><rect x="8" y="15" width="4" height="2" fill="#ff6f91"/>'),
  whirlpool: s('<circle cx="10" cy="10" r="8" fill="rgba(78,231,213,0.3)" stroke="#4ee7d5" stroke-width="1.5"/><circle cx="10" cy="10" r="4" fill="white"/><circle cx="10" cy="10" r="2" fill="#071022"/>'),
  ice: s('<polygon points="10,1 17,7 17,15 10,19 3,15 3,7" fill="#88ccff" stroke="white" stroke-width="1"/><polygon points="10,4 13,7 13,13 10,16 7,13 7,7" fill="white"/>'),
  lightning: s('<polygon points="12,1 4,11 8,11 6,19 16,9 12,9 14,1" fill="#ffe066" stroke="#b8f4ff" stroke-width="0.5"/><circle cx="9" cy="5" r="2" fill="white"/>'),
  arrow: s('<polygon points="16,10 6,3 6,7 2,7 2,13 6,13 6,17" fill="#c8a45c"/><rect x="4" y="8" width="4" height="4" fill="#f8e8b0"/>'),
  crystal: s('<defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="white"/><stop offset=".38" stop-color="#4ee7d5"/><stop offset="1" stop-color="#9b7dff"/></linearGradient></defs><polygon points="10,2 16,10 10,18 4,10" fill="url(#cg)" stroke="rgba(255,255,255,0.8)" stroke-width="1"/>'),
  cannibal: s('<circle cx="10" cy="10" r="9" fill="#ff4b6e" stroke="white" stroke-width="1.5"/><circle cx="7" cy="8" r="2" fill="white"/><circle cx="13" cy="8" r="2" fill="white"/>'),
  coin: s('<circle cx="10" cy="10" r="9" fill="#ffd700" stroke="#daa520" stroke-width="1"/><circle cx="10" cy="10" r="6" fill="#ffec8a"/><text x="10" y="13" text-anchor="middle" fill="#b8860b" font-size="11" font-weight="bold">$</text>'),
};

const Icon = ({ type }) => <span dangerouslySetInnerHTML={ICONS[type]} />;

export default function InstructionsScreen({ onBack, engine }) {
  return (
    <section id="instructionsPage" className="screen screen-instructions">
      <div className="brand-row">
        <div className="mini-rocket" aria-hidden="true"></div>
        <span>Guía de vuelo</span>
      </div>
      <h2>Instrucciones</h2>
      <p className="lead">
        Sobrevive el mayor tiempo posible. Esquiva, dispara y recoge mejoras. Cada fase es más letal.
      </p>

      <div className="instruction-grid" aria-label="Mecánicas del juego">
        <article>
          <strong>Movimiento</strong>
          <span>Mouse.</span>
        </article>
        <article>
          <strong>Pausa</strong>
          <span>Tecla <kbd>Esc</kbd> o presiona <kbd>0</kbd> dos veces.</span>
        </article>
        <article>
          <strong>🔫 Disparar</strong>
          <span>Tecla <kbd>Q</kbd>. Munición limitada (30 balas). Recoge más.</span>
        </article>
        <article>
          <strong>Esquive inteligente</strong>
          <span>Espacio / doble toque. El cohete se desplaza rápidamente.</span>
        </article>
        <article>
          <strong>✨ Pulso Prisma</strong>
          <span>Tecla <kbd>E</kbd>. Gasta 1 carga de pulso (máx. 5). Destruye enemigos cercanos y empuja los magnéticos.</span>
        </article>
        <article>
          <strong><Icon type="heart" /> Corazón</strong>
          <span>Recupera 1 vida (máx. 6). Si estás lleno, da 80 puntos.</span>
        </article>
        <article>
          <strong><Icon type="rainbow" /> Cubo arcoíris</strong>
          <span>Otorga invisibilidad durante 4 segundos. Eres invulnerable y semitransparente.</span>
        </article>
        <article>
          <strong><Icon type="greenRocket" /> Cohete verde (aliado)</strong>
          <span>Invoca un mini-cohete que te sigue y dispara a enemigos durante 10 segundos.</span>
        </article>
        <article>
          <strong><Icon type="whirlpool" /> Remolino</strong>
          <span>Crea un campo de absorción durante 3 segundos. Elimina hasta 6 obstáculos cercanos uno por uno.</span>
        </article>
        <article>
          <strong><Icon type="ice" /> Hielo</strong>
          <span>Congela todos los obstáculos en pantalla durante 3 segundos. No se mueven ni cambian de posición.</span>
        </article>
        <article>
          <strong><Icon type="lightning" /> Rayo</strong>
          <span>Tecla <kbd>G</kbd>. Inicias con 4 cargas (máx. 4). Al activarlo, un relámpago cae del cielo y golpea todos los enemigos. Destruye los débiles y aturde a los grandes.</span>
        </article>
        <article>
          <strong><Icon type="arrow" /> Lluvia de flechas</strong>
          <span>Tecla <kbd>R</kbd>. Inicias con 5 cargas. Una lluvia de flechas golpea una zona cercana. Cada flecha daña a cualquier enemigo.</span>
        </article>
        <article>
          <strong><Icon type="ammo" /> Munición</strong>
          <span>Recarga 3 balas (máx. 30). Si estás lleno, suma 60 puntos.</span>
        </article>
        <article>
          <strong><Icon type="crystal" /> Cristal</strong>
          <span>Recarga 1 pulso (si falta). Si ya tienes el máximo, suma 120 puntos.</span>
        </article>
        <article>
          <strong><Icon type="cannibal" /> Pacman caníbal</strong>
          <span>Enemigo rojo que te persigue. Desaparece tras 4.5 segundos. ¡Aléjate o destrúyelo!</span>
        </article>
        <article>
          <strong>Obstáculos</strong>
          <span>Cubos, piedras, anillos y fragmentos. Algunos tienen conexiones magnéticas.</span>
        </article>
        <article>
          <strong>Puntuación</strong>
          <span>Gana puntos por esquivar, destruir enemigos y recoger objetos. Las cadenas aumentan la bonificación.</span>
        </article>
        <article>
          <strong><Icon type="coin" /> Bonus +10000</strong>
          <span>Aparece una moneda dorada en pantalla cada 2 minutos. Acércate para sumar 10000 puntos.</span>
        </article>
      </div>

      <div className="welcome-actions">
        <button id="backButton" className="ghost-button" onClick={onBack}>
          ← Volver
        </button>
        <button
          id="startButton"
          className="primary-button"
          onClick={() => { if (engine.current) engine.current.startGame(); }}
        >
          Iniciar viaje
        </button>
      </div>
      <ContactFooter />
    </section>
  );
}
