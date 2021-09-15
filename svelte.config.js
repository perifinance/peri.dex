import preprocess from 'svelte-preprocess';
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import adapter from '@sveltejs/adapter-static';
/** @type {import('@sveltejs/kit').Config} */

const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess({
        postcss: {
            plugins: [
                tailwind, 
                autoprefixer    
            ]
        },
        babel: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        loose: true,
                        // No need for babel to resolve modules
                        modules: false,
                        targets: {
                            // ! Very important. Target es6+
                            esmodules: true,
                        },
                    },
                ],
            ],
            plugins: ['@babel/plugin-syntax-bigint'],
        },
    }),
    files: {
        template: 'src/app.html'
    },
    kit: {
        // hydrate the <div id="svelte"> element in src/app.html
        target: '#svelte',
        adapter: adapter({
            fallback: 'index.html'
        }),
    }
};

export default config;