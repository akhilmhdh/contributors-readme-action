const esbuild = require('esbuild');

// Automatically exclude all node_modules from the bundled version
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const args = process.argv;

const isWatchMode = process.argv.includes('--watch');

esbuild
    .build({
        entryPoints: ['./src-ts/index.ts'],
        outfile: 'dist/index.js',
        bundle: true,
        minify: true,
        platform: 'node',
        sourcemap: true,
        target: 'node14',
        plugins: [nodeExternalsPlugin()],
        watch: isWatchMode
    })
    .then(() => {
        console.log('⚡ Build completed');
    })
    .catch(() => process.exit(1));
