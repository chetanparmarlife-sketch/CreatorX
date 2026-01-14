const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.resolver.blockList = [
  /brand-dashboard\/.*/,
  /backend\/.*/,
  // Exclude test files from bundling (they're only for Jest)
  /.*\/__tests__\/.*/,
  /.*\.test\.(ts|tsx|js|jsx)$/,
  /.*\.spec\.(ts|tsx|js|jsx)$/,
];

module.exports = config;

