module.exports = function(config) {
  config.set({

    files: [
      'test/index.js'
    ],

    frameworks: ['mocha'],

    preprocessors: {
      'test/index.js': ['webpack']
    },

    reporters: ['spec', 'coverage'],

    coverageReporter: {

      dir: 'coverage/',
      reporters: [
          { type: 'html' },
          { type: 'text' },
          { type: 'lcov', subdir: 'lcov' },
          { type: 'text-summary' }
      ]
    },

    webpack: {
      module: {
        postLoaders: [{
          test: /\.js/,
          exclude: /(test|node_modules|bower_components)/,
          loader: 'istanbul-instrumenter'
        }]
      }
    },

    webpackMiddleware: {
      noInfo: true
    },

    client: {
      useIframe: false
    },

    plugins: [
      require("karma-webpack"),
      require("istanbul-instrumenter-loader"),
      require("karma-mocha"),
      require("karma-coverage"),
      require("karma-chrome-launcher"),
      require("karma-phantomjs-launcher"),
      require("karma-spec-reporter")
    ],

    browsers: ['Chrome', 'PhantomJS']

  });
};