module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'], // ✅ TO JEST KLUCZOWE
      plugins: [
        ['module:react-native-dotenv', {
          moduleName: '@env',
          path: '.env',
        }],
        'react-native-reanimated/plugin'
      ],
    };
  };
  