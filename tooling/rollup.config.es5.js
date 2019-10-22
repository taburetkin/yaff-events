const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
module.exports = {
  input: ['./index.js'],
  output: {
    file: './lib/yaff.events.es5.umd.js',
    format: 'umd',
    name: 'yaffEvents'
  },
  plugins: [
    commonjs(),
    resolve(),
    babel({
      babelrc: false,
      exclude: /node_modules/,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            spec: true,
            forceAllTransforms: true,
            useBuiltIns: 'usage',
            corejs: 3
          }
        ]
      ]
    })
  ]
};
