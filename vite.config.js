import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/*
  defineConfig es un helper de Vite que solo agrega validación de tipos/intellisense
  a la configuración. El objeto retornado describe cómo Vite construye el proyecto.

  La propiedad `plugins` recibe un array de plugins; aquí se inyecta el plugin oficial
  de React, que habilita las transformaciones JSX y el Fast Refresh (HMR en desarrollo):
  cada plugin es un objeto con hooks (config, transform, etc.) que Vite invoca
  durante el ciclo de build/servidor.
*/
export default defineConfig({
  plugins: [react()],
});
