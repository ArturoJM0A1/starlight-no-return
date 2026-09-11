import React from 'react';

/*
  React.forwardRef permite que un componente funcional reciba una `ref` y la
  reenvíe a un elemento hijo. Sin forwardRef, las refs solo funcionaban en
  componentes de clase. Aquí reenvía la ref pasada por App hacia el <canvas>,
  de modo que App obtiene el nodo DOM real del canvas vía canvasRef.current
  (necesario para que el motor obtenga el contexto 2D con getContext).

  el segundo argumento `ref` del callback es la ref recibida. Las props
  (primer argumento) no se usan, pero React exige declararlas igual.
*/
const GameCanvas = React.forwardRef(function GameCanvas(props, ref) {
  // id="gameCanvas" coincide con el selector que usa el motor (canvas).
  return <canvas ref={ref} id="gameCanvas" />;
});

export default GameCanvas;
