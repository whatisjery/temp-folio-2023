/* eslint-disable no-undef */
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { SIZES } from './src/constant';

import autoprefixer from 'autoprefixer';
import imports from 'postcss-import';
import mixins from 'postcss-mixins';
import nested from 'postcss-nested';
import simpleVars from 'postcss-simple-vars';
import glsl from 'vite-plugin-glsl';
import gltf from 'vite-plugin-gltf';
import postHtml from './plugin-post-html';

export default defineConfig({
    plugins: [glsl(), gltf(), postHtml()],

    css: {
        devSourcemap: true,
        postcss: {
            plugins: [
                imports(),
                simpleVars({ variables: SIZES }),
                mixins(),
                nested(),
                autoprefixer()
            ]
        }
    },

    build: {
        sourcemap: true,
        rollupOptions: {
            input: {
                app: resolve(__dirname, 'index.html'),
                404: resolve(__dirname, '404.html')
            }
        }
    },

    server: {
        port: 3000,
        host: '0.0.0.0'
    }
});
