module.exports = api => {
  const isProduction = api.env("production");

  return {
    presets: ["module:@react-native/babel-preset"],
    plugins: [
      // Strip console.* calls from release bundles so logged payloads never
      // ship in the JS at all (App.tsx also no-ops console at runtime).
      ...(isProduction ? ["transform-remove-console"] : []),
      // Required by react-native-vision-camera's frame processors (used for the
      // face-detection liveness check) — must stay last in the plugins list.
      "react-native-worklets-core/plugin",
    ],
  };
};
