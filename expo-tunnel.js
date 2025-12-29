const { spawn } = require('child_process');

const expo = spawn('npx', ['expo', 'start', '--tunnel', '--port', '5000'], {
  stdio: 'inherit',
  shell: true
});

expo.on('close', (code) => {
  process.exit(code);
});
