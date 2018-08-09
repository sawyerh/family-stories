const path = require("path");
const webpack = require("webpack");

const config = {
  context: __dirname,
  entry: {
    global: "./assets/src/scripts/global.coffee"
  },
  output: {
    path: __dirname,
    publicPath: "/",
    filename: "assets/dist/scripts/[name].js"
  },
  module: {
    rules: [
      {
        test: /\.(coffee)$/,
        use: [
          {
            loader: "coffee-loader",
            options: {
              transpile: {
                presets: ["env"]
              }
            }
          }
        ]
      }
    ]
  }
};

if (process.env.NODE_ENV === "production") {
  const uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  });

  config.plugins = [uglifyPlugin];
}

module.exports = config;
