/* eslint-disable */
const Path = require('path');
const Webpack = require('webpack');
const merge = require('webpack-merge');

const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');


const weblog = require('webpack-log');

const log = weblog({ name: 'wds' }); // webpack-dev-server

function FileListPlugin(/* options */) {}

FileListPlugin.prototype.apply = function (compiler) {
  compiler.plugin('emit', (compilation, callback) => {
    // Create a header string for the generated file:
    let filelist = 'In this build:\n\n';
    log.info('Server Starting!!!!!!');
    log.info(compiler);
    log.trace(compiler);
    // Loop through all compiled assets,
    // adding a new line item for each filename.
   
    for (let filename in compilation.assets) {
	    filelist += ('- '+ filename +'\n');
	  
    }
    
    // Insert this list into the Webpack build as a new file asset:
    compilation.assets['filelist.md'] = {
      source: function() {
        return filelist;
      },
      size: function() {
        return filelist.length;
      }
    };
	
    callback();
  });
};


const exec = require('child_process').exec;


function puts(error, stdout, stderr) {
  console.log(stdout);
}

class WebpackShellPlugin {
  constructor(options) {
    const defaultOptions = {
      onBuildStart: [],
      onBuildEnd: [],
    };

    this.options = Object.assign(defaultOptions, options);
  }

  apply(compiler) {
    const { options } = this;
    compiler.plugin('compilation', (/* compilation */) => {
      if (options.onBuildStart.length) {
        log.info('Executing pre-build scripts', options);
        log.trace('Executing pre-build scripts', options);
        options.onBuildStart.forEach((script) => {
          log.info('Server Starting!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
          return exec(script, puts);
        });
      }
    });

    compiler.plugin('emit', (compilation, callback) => {
      if (options.onBuildEnd.length) {
        console.log('Executing post-build scripts');
        options.onBuildEnd.forEach(script => exec(script, puts));
      }
      callback();
    });
  }
}

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  // output: {
  //   chunkFilename: 'js/[name].chunk.js',
  // },
  devServer: {
    inline: true,
    clientLogLevel:'error',
    before: function(app, server) {
      app.get(/\.wasm$/, function(req, res,next) {
        res.setHeader("Content-Type", 'application/wasm');
        next();
      });
    },
  },
  plugins: [
    new ErrorOverlayPlugin(),
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: Path.resolve(__dirname, '../src'),
        use: 'tslint-loader',
      },
      {
        test: /\.(js)$/,
        include: Path.resolve(__dirname, '../src'),
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          emitWarning: true,

        },
      },
      {
        test: /\.(js)$/,
        include: Path.resolve(__dirname, '../src'),
        loader: 'babel-loader',
      },
      {
        test: /\.s?css$/i,
        use: ['style-loader', 'css-loader?sourceMap=true', 'sass-loader'],
      },
      {
        test: /\.wasm$/,
        type: 'javascript/auto',
        loader: "file-loader",
      },
    ],
  },
});
