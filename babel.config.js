module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-worklets-core/plugin",
      "nativewind/babel",
      [
        "react-native-reanimated/plugin",
        {
          globals: ["__scanOCR"],
        },
      ],
    ],
  };
};
