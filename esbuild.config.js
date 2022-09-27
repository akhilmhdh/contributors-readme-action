const esbuild = require('esbuild');

const isWatchMode = process.argv.includes('--watch');

esbuild
    .build({
        entryPoints: ['./src-ts/index.ts'],
        outfile: 'dist/index.js',
        bundle: true,
        minify: false,
        platform: 'node',
        sourcemap: true,
        target: 'node16',
        plugins: [],
        watch: isWatchMode
    })
    .then(() => {
        console.log('⚡ Build completed');
    })
    .catch(() => process.exit(1));
