// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports to fix module resolution for libraries like jspdf and fflate
config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts.push('mjs', 'cjs');
config.resolver.mainFields = ['browser', 'module', 'main'];

module.exports = config;
