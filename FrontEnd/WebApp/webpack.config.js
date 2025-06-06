
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Alias per usare react-native-web-maps al posto di react-native-maps
  config.resolve.alias['react-native-maps'] = '@teovilla/react-native-web-maps';

  return config;
};
