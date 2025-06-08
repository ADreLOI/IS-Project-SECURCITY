module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@config": "./config.js", // alias 
            "@": "./", // alias generico se si usa "@/..."
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
