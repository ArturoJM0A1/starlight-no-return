import React from 'react';

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
  if (!user) return null;
  return (
    <div style={style}>
      <div>{user.username}</div>
    </div>
  );
}
