const {webpackConfig, relDir} = require("./webpack.common");

module.exports = {
  entry: {
    index: relDir("src/index.ts"),
    demo: relDir("src/demo.ts"),
    wrapping: relDir("src/wrapping.ts"),
  },
  ...webpackConfig(false),
};
