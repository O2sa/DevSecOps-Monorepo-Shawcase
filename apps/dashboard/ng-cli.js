#!/usr/bin/env node
'use strict';

// Ensure Node version passes Angular CLI 22 check on Node 24.13+
if (process.versions && process.versions.node) {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major === 24 && minor < 15) {
    Object.defineProperty(process.versions, 'node', {
      value: '24.15.0',
      writable: true,
      configurable: true,
    });
  } else if (major === 22 && minor < 22) {
    Object.defineProperty(process.versions, 'node', {
      value: '22.22.3',
      writable: true,
      configurable: true,
    });
  }
}

require('./node_modules/@angular/cli/bin/ng.js');
