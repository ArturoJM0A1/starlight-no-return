import React from 'react';

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
          <strong>🎮 Movimiento</strong>
          <span>Mouse.</span>
        </article>
        <article>
          <strong>🔫 Disparar</strong>
          <span>Tecla <kbd>Q</kbd>. Munición limitada (30 balas). Recoge más.</span>
        </article>
        <article>
          <strong>💨 Esquive inteligente</strong>
          <span>Espacio / doble toque. El cohete se desplaza rápidamente.</span>
        </article>
        <article>
          <strong>✨ Pulso Prisma</strong>
          <span>Tecla <kbd>E</kbd>. Gasta 1 carga de pulso (máx. 5). Destruye enemigos cercanos y empuja los magnéticos.</span>
        </article>
        <article>
          <strong>❤️ Corazón</strong>
          <span>Recupera 1 vida (máx. 6). Si estás lleno, da 80 puntos.</span>
        </article>
        <article>
          <strong>🌈 Cubo arcoíris</strong>
          <span>Otorga invisibilidad durante 4 segundos. Eres invulnerable y semitransparente.</span>
        </article>
        <article>
          <strong>🚀 Cohete verde (aliado)</strong>
          <span>Invoca un mini-cohete que te sigue y dispara a enemigos durante 6 segundos.</span>
        </article>
        <article>
          <strong>🌀 Remolino</strong>
          <span>Crea un campo de absorción durante 3 segundos. Elimina hasta 6 obstáculos cercanos uno por uno.</span>
        </article>
        <article>
          <strong>❄️ Hielo</strong>
          <span>Congela todos los obstáculos en pantalla durante 3 segundos. No se mueven ni cambian de posición.</span>
        </article>
        <article>
          <strong>⚡ Rayo</strong>
          <span>Tecla <kbd>G</kbd>. Inicias con 4 cargas (máx. 4). Al activarlo, un relámpago cae del cielo y golpea todos los enemigos. Destruye los débiles y aturde a los grandes.</span>
        </article>
        <article>
          <strong>🎯 Munición</strong>
          <span>Recarga 3 balas (máx. 30). Si estás lleno, suma 60 puntos.</span>
        </article>
        <article>
          <strong>💎 Cristal</strong>
          <span>Recarga 1 pulso (si falta). Si ya tienes el máximo, suma 120 puntos.</span>
        </article>
        <article>
          <strong>👹 Pacman caníbal</strong>
          <span>Enemigo rojo que te persigue. Desaparece tras 4.5 segundos. ¡Aléjate o destrúyelo!</span>
        </article>
        <article>
          <strong>🌀 Obstáculos</strong>
          <span>Cubos, piedras, anillos y fragmentos. Algunos tienen conexiones magnéticas.</span>
        </article>
        <article>
          <strong>🏆 Puntuación</strong>
          <span>Gana puntos por esquivar, destruir enemigos y recoger objetos. Las cadenas aumentan la bonificación.</span>
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
      <footer className="contact-footer">
        <a href="https://github.com/ArturoJM0A1" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://arturojuarezmonroy.vercel.app/" target="_blank" rel="noopener noreferrer">Web</a>
        <a href="https://x.com/juarez_mon84035" target="_blank" rel="noopener noreferrer">Twitter</a>
        <a href="https://api.whatsapp.com/send/?phone=5217736802105&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <span style={{ display: 'block', marginTop: 8, fontSize: '0.75rem', opacity: 0.6 }}>Arturo Juárez Monroy</span>
      </footer>
    </section>
  );
}
