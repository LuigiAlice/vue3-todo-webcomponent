import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { terser } from 'rollup-plugin-terser';

export default defineConfig({
  plugins: [vue({ customElement: true })],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: './src/todo-component.js',
      name: 'todo-component',
      fileName: () => 'todo-component.mjs',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        plugins: [terser({
          compress: {
            passes: 3
          },
          format: {
            comments: false,
            beautify: false
          }
        })]
      }
    },
    minify: false  // Kein esbuild Minifier, da terser Rollup-Plugin verwendet
  },
});
