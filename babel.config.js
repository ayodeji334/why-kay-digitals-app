module.exports = {
  presets: ["module:@react-native/babel-preset"],
  // Required by react-native-vision-camera's frame processors (used for the
  // face-detection liveness check) — must stay last in the plugins list.
  plugins: ["react-native-worklets-core/plugin"],
};
