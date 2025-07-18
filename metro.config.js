// metro.config.js

const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const svgConfig = {
  transformer: {
    // tell Metro how to transform SVGs
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // exclude svg from assets so it's treated like code
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),

    // allow Metro to resolve SVG imports alongside your JS/TS files
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, svgConfig);
