# 🌌 Starlight: No Return

> *"Cada órbita eventualmente se cierra… excepto aquella de la que no hay retorno."*

**Starlight: No Return** es un frenético juego arcade espacial donde cada segundo cuenta. Pilota un cohete metamórfico a través de un universo hostil, esquiva anomalías cósmicas, administra tus recursos y sobrevive el mayor tiempo posible antes de alcanzar el punto de no retorno.

---

## 🎮 **Juega ahora:** https://starlightnoreturn.vercel.app/

---

## 🚀 Sobre el juego

Juego arcade construido con **React 18**, **HTML5 Canvas** y **Vite 6**. El motor de juego mantiene la esencia de los clásicos arcade con un bucle de renderizado imperativo sobre canvas, mientras que la interfaz se maneja con componentes React. Incluye **Firebase Auth** para registro de usuarios y **Firestore** para persistencia de puntuaciones y tabla de líderes global.

---

## ✨ Características principales

* 🌌 Fondo espacial dinámico con estrellas y nebulosas animadas.
* 🚀 Nave metamórfica con efectos visuales avanzados (humo gris, llama pulsante, destello de daño).
* 🖱️ Control por **mouse** — el cohete sigue el cursor sin necesidad de mantener clic.
* 💨 **Dash** para realizar maniobras evasivas (Espacio / doble clic).
* ⚡ **Pulso Prisma** (`E`) — destruye enemigos cercanos y empuja obstáculos magnéticos.
* 🔗 Obstáculos conectados mediante enlaces magnéticos.
* 👹 **Pacman caníbal** — enemigo rojo que te persigue.
* 🤝 **Cohete verde (aliado)** — mini-cohete que dispara a enemigos.
* 🌈 **Cubo arcoíris** — invisibilidad e invulnerabilidad temporal.
* 🌀 **Remolino** — absorbe hasta 12 obstáculos cercanos.
* ❄️ **Hielo** — congela todos los obstáculos en pantalla.
* ⚡ **Rayo** (`G`) — relámpago que golpea todos los enemigos.
* 🏹 **Lluvia de flechas** (`R`) — 250–349 flechas golpean una zona.
* 💰 **Bonus +10000** — moneda dorada que aparece cada 2 minutos.
* 🎵 Música procedural infinita con **Tone.js** (4 fases, 3 melodías, intensidad variable).
* 🔊 Sonido configurable solo desde la pantalla de bienvenida.
* 🏆 **Top Global** — tabla de líderes multiplataforma con Firebase.
* 🔐 **Registro e inicio de sesión** con @usuario.

---

## 🎮 Controles

| Acción              | Tecla                          |
| ------------------- | ------------------------------ |
| Movimiento          | Mouse                          |
| Disparar            | `Q`                            |
| Dash                | `Espacio` / `Shift` / doble clic |
| Pulso Prisma        | `E`                            |
| Rayo                | `G`                            |
| Lluvia de flechas   | `R`                            |
| Pausar              | `Esc` o presiona `0` dos veces |
| Iniciar partida     | `Enter`                        |

---

## 🌠 Ciclos del universo

### Calma

Fase introductoria con menor densidad de amenazas y abundancia de recursos.

### Ascenso

La dificultad aumenta progresivamente y comienzan a aparecer nuevas mecánicas.

### Tormenta

El caos domina el espacio: enemigos impredecibles y obstáculos enlazados.

### Respiro

Breve tregua para reorganizar recursos antes del siguiente desafío.

Cada ciclo completo incrementa ligeramente la intensidad de la música.

---

## ⚡ Mecánicas especiales

### Dash

Desplázate instantáneamente para evitar colisiones.

* Fundamental para sobrevivir en dificultades altas.
* Recompensas por esquivas precisas (cadenas de combo).

### Pulso Prisma

Libera una onda expansiva consumiendo una carga de pulso.

* Destruye obstáculos cercanos y rompe conexiones magnéticas.
* Sin límite máximo de cargas — se acumulan sin restricción.

### Remolino

Crea un campo de absorción de 4 segundos que elimina hasta 12 obstáculos en un radio de 350px.

### Hielo

Congela todos los obstáculos en pantalla durante 3 segundos.

### Rayo

Golpea todos los enemigos con un relámpago celestial.

* Destruye débiles al instante, aturde a los grandes.
* Sin límite máximo de cargas.

### Lluvia de flechas

Invocas 250–349 flechas que caen del cielo dañando a cualquier enemigo en la zona.

### Bonus +10000

Moneda dorada que aparece al inicio y cada 2 minutos. Debes recogerla físicamente con el cohete.

---

## 💎 Recursos y potenciadores

| Objeto                | Efecto                                    |
| --------------------- | ----------------------------------------- |
| ❤️ Corazón            | Suma una vida (sin límite máximo).        |
| 🎯 Munición           | Recarga 8 balas (sin límite máximo).      |
| 🌈 Cubo Arcoíris      | Invisibilidad e invulnerabilidad 4s.      |
| 🚀 Cohete Verde       | Invoca aliado por 10s.                    |
| 🌀 Remolino           | Absorbe obstáculos cercanos.              |
| ❄️ Hielo              | Congela todos los obstáculos.             |
| ⚡ Rayo                | Suma una carga de rayo.                   |
| 🏹 Flechas            | Suma una carga de lluvia de flechas.      |
| 💎 Cristal            | Suma una carga de pulso.                  |
| 💰 Bonus +10000       | Suma 10000 puntos al recogerlo.           |

Ningún recurso tiene límite máximo — puedes acumular vidas, balas, pulsos, rayos y flechas sin restricción.

---

## 🏆 Sistema de puntuación

* Distancia recorrida y tiempo de supervivencia.
* Eliminación de amenazas.
* Recolección de recursos.
* Esquivas perfectas (*Near Miss*) y cadenas de combos.

La mejor puntuación se sincroniza con **Firestore** y se muestra en el ranking **Top Global**.

---

## 🎯 Objetivo

Sobrevive el mayor tiempo posible.

Domina el Dash. Aprovecha el Pulso. Gestiona tus recursos. Aprende a leer el comportamiento del universo.

Y descubre cuánto tiempo puedes mantener tu órbita…

…antes de que ya no exista retorno.

---

## 🛠️ Tecnologías utilizadas

* **React 18**
* **Vite 6**
* **HTML5 Canvas**
* **CSS3**
* **JavaScript ES6+**
* **Web Audio API + Tone.js v15**
* **Firebase Auth + Firestore**
* **LocalStorage**
* **Vibration API**

---

## 📦 Desarrollo local

```bash
npm install
npm run dev
```

Se requiere un archivo `.env` con las credenciales de Firebase para el registro de usuarios y la tabla de líderes.

---

## 📜 Licencia

Este repositorio se publica con fines de exhibición y portafolio.

El código fuente y los recursos del proyecto son propiedad de su autor. No está permitida su redistribución, modificación o uso comercial sin autorización expresa.

© Arturo Juárez Monroy. Todos los derechos reservados.
