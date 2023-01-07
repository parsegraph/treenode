const {webpackConfig, relDir} = require("./webpack.common");

module.exports = {
  entry: {
    index: relDir("src/index.ts"),
    demo: relDir("src/demo.ts"),
    basictree: relDir("src/basictree.ts"),
    wrapping: relDir("src/wrapping.ts"),
  },
  ...webpackConfig(false),
};
