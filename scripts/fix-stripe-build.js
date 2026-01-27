const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Monkey-patch the OpenNext build to copy Stripe files at the right time
const openNextPath = path.join(__dirname, '../node_modules/@opennextjs/cloudflare/dist/cli/build/index.js');
const openNextCode = fs.readFileSync(openNextPath, 'utf8');

// Find where bundling happens and inject our copy step
// This is a hack but necessary until OpenNext properly handles Stripe

const stripeSource = path.join(__dirname, '../node_modules/stripe');
const stripeDest = path.join(__dirname, '../.open-next/server-functions/default/node_modules/stripe');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Watch for .open-next creation and copy files immediately
const watchDir = path.join(__dirname, '../.open-next');
let watcher = null;

function setupWatcher() {
  if (watcher) return;
  
  const checkAndCopy = () => {
    const destDir = path.dirname(stripeDest);
    if (fs.existsSync(destDir) && fs.existsSync(stripeSource)) {
      if (!fs.existsSync(stripeDest) || !fs.existsSync(path.join(stripeDest, 'esm', 'stripe.esm.worker.js'))) {
        console.log('Copying Stripe files...');
        copyDir(stripeSource, stripeDest);
      }
    }
  };
  
  // Check immediately
  checkAndCopy();
  
  // Watch for directory creation
  if (fs.existsSync(path.dirname(watchDir))) {
    watcher = fs.watch(path.dirname(watchDir), { recursive: true }, (eventType, filename) => {
      if (filename && filename.includes('.open-next')) {
        setTimeout(checkAndCopy, 100);
      }
    });
  }
}

setupWatcher();

// Also set environment variables
process.env.WRANGLER_BUILD_CONDITIONS = 'workerd';
process.env.WRANGLER_BUILD_PLATFORM = 'node';

// Run the actual build
try {
  execSync('npx opennextjs-cloudflare build', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env
  });
  
  // Final copy check
  const destDir = path.dirname(stripeDest);
  if (fs.existsSync(destDir) && fs.existsSync(stripeSource)) {
    copyDir(stripeSource, stripeDest);
  }
} finally {
  if (watcher) watcher.close();
}
