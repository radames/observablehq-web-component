// rollup.config.js
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';

export default [
  {
    input: 'index.js',
    plugins: [resolve(), json(), babel()],
    output: {
      extend: true,
      file: 'dist/observablehq-web-component.js',
      format: 'umd',
    },
  },
  {
    input: 'index.js',
    plugins: [resolve(), json(), babel(), terser()],
    output: {
      extend: true,
      file: 'dist/observablehq-web-component.min.js',
      format: 'umd',
    },
  }
];
