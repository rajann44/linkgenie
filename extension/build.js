const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const buildConfig = {
  entryPoints: [
    'src/content.ts',
    'src/background.ts',
    'src/options.ts'
  ],
  bundle: true,
  outdir: 'dist',
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
  target: ['chrome100'],
  logLevel: 'info',
};

async function run() {
  if (isWatch) {
    let ctx = await esbuild.context(buildConfig);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(buildConfig);
    console.log('Build completed successfully.');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
