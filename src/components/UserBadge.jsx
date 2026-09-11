import React from 'react';

// Estilo de la insignia de usuario en juego: fija arriba-izquierda.
// pointerEvents:'none' + userSelect:'none' evitan que el texto interfiera
// con los clics del puntero sobre el canvas (el juego se juega con el mouse).
const style = {
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 10,
  color: 'rgba(248, 251, 255, 0.4)',
  fontSize: '0.9rem',
  lineHeight: 1.4,
  pointerEvents: 'none',
  userSelect: 'none',
};

export default function UserBadge({ user }) {
  // Render condicional: si no hay sesión no se muestra nada (return null).
  if (!user) return null;
  return (
    <div style={style}>
      <div>{user.username}</div>
    </div>
  );
}
