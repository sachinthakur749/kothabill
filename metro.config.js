const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase 10.x ships both browser and React Native builds.
// Without this, Metro's package exports resolver picks the browser build,
// which does NOT register the auth component for React Native →
// "Component auth has not been registered yet"
config.resolver.unstable_enablePackageExports = false;

// Allow Firebase's CJS files to be bundled
config.resolver.sourceExts.push('cjs');

module.exports = config;
