const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Плагин для работы с хтмл в вебпаке
const CopyPlugin = require('copy-webpack-plugin'); // Плагин для копирования файлов

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'utm-collector.min.js',
  },
  resolve: {
    // Такой список нужен для резолва всех необходимых разрешений файлов
    extensions: ['.wasm', '.ts', '.tsx', '.mjs', '.cjs', '.js', '.json', '.html'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Чат', // Кастомный тайтл у хтмл файла
      template: './src/index.html', // Входной файл
      filename: 'index.html', // Файл на выходе
      favicon: './src/favicon.ico',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
      },
    }),

    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/favicon.ico'), to: 'docs' },
      ],
    }),
  ],
  module: {
    rules: [
      // Typescript
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader', // Обработчик яваскриптов
            options: { // Пришлось добавить эту часть в сборщик, потому что иначе сыпало ошибками о неподдерживаемом синтаксисе
              presets: [
                {
                  plugins: ['@babel/plugin-proposal-class-properties'], // включает поддержку продвинутого синтаксиса яваскрипта
                },
              ],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
              // transpileOnly: true, // Только транспиляция
            },
          },
        ],
        exclude: /(node_modules)/,
      },
      // ХТМЛ файлы
      {
        test: /\.html$/,
        loader: 'html-loader', // при обработке этих файлов нужно использовать html-loader
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'build'),
    },
    compress: true,
    port: 9000,
  },
};
