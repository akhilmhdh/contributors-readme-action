const esbuild = require('esbuild');

const graphqlLoaderPlugin = require('@luckycatfactory/esbuild-graphql-loader');

const isWatchMode = process.argv.includes('--watch');

esbuild
    .build({
        entryPoints: ['./src-ts/index.ts'],
        outfile: 'dist/index.js',
        bundle: true,
        minify: true,
        platform: 'node',
        sourcemap: true,
        target: 'node16',
        plugins: [graphqlLoaderPlugin.default({ filterRegex: /\.gql$/ })],
        watch: isWatchMode
    })
    .then(() => {
        console.log('⚡ Build completed');
    })
    .catch(() => process.exit(1));
