module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      ['babel-preset-expo', {
        lazyImports: true,
        web: { useTransformReactJSXExperimental: true }
      }]
    ],
    plugins: [
      // Optimisations pour réduire la taille du bundle
      ['transform-remove-console', { exclude: ['error', 'warn'] }],
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: [
          // Supprimer les console.log en production
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
          // Optimiser les imports
          ['import', {
            libraryName: '@expo/vector-icons',
            libraryDirectory: '',
            camel2DashComponentName: false
          }]
        ]
      }
    }
  };
};
