#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const pythonScript = path.join(__dirname, 'lint-python.py');

try {
  const result = execSync(`python "${pythonScript}"`, { encoding: 'utf8', stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}
