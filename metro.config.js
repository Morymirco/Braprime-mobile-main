const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimisations pour réduire le temps de build
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Exclure les fichiers inutiles du bundle
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/react-native\/.*/,
  /.*\.test\.(js|ts|tsx)$/,
  /.*\.spec\.(js|ts|tsx)$/,
  /.*\.stories\.(js|ts|tsx)$/,
  /.*\.md$/,
  /.*\.txt$/,
  /.*\.json$/,
  /.*\.lock$/,
];

// Optimisation de la transformation
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Cache optimisé
config.cacheStores = [
  {
    name: 'filesystem',
    options: {
      cacheDirectory: '.metro-cache',
    },
  },
];

module.exports = config;
