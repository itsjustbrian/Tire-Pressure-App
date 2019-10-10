const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, { mode }) => ({
  entry: './src/index.ts',
  devtool: (mode !== 'production') ? 'inline-source-map' : 'source-map',
  output: {
    filename: (mode !== 'production') ? 'bundle.js' : 'bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({
      cssProcessorOptions: {
        map: {
          inline: false,
          annotation: true,
        }
      }
    })],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: (mode !== 'production') ? 'index.css' : 'index.css',
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/template.html",
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          { loader: 'css-loader', options: { sourceMap: (mode !== 'production') } },
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              disable: (mode !== 'production'),
            },
          },
        ],
      },
      { test: /\.html$/, loader: 'html-loader' }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
});