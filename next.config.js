const initConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config, { dir, defaultLoaders, webpack, dev, isServer }) => {
    const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
    const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
    const postcssNormalize = require('postcss-normalize');
    const loaderUtils = require('loader-utils');
    const path = require('path');

    const publicPath = !dev
      ? paths.servedPath
      : dev && '/';
    // Some apps do not use client-side routing with pushState.
    // For these, "homepage" can be set to "." to enable relative asset paths.
    const shouldUseRelativeAssetPaths = publicPath === './';
    let extractCssInitialized = false;
    // style files regexes
    const cssRegex = /\.css$/;
    const cssModuleRegex = /\.module\.css$/;
    const sassRegex = /\.(scss|sass)$/;
    const sassModuleRegex = /\.module\.(scss|sass)$/;

    const getCSSModuleLocalIdent = (
      context,
        localIdentName,
        localName,
        options
    ) => {
      // Use the filename or folder name, based on some uses the index.js / index.module.(css|scss|sass) project style
      const fileNameOrFolder = context.resourcePath.match(
        /index\.module\.(css|scss|sass)$/
      )
        ? '[folder]'
        : '[name]';
      // Create a hash based on a the file location and class name. Will be unique across a project, and close to globally unique.
      const hash = loaderUtils.getHashDigest(
        path.posix.relative(context.rootContext, context.resourcePath) + localName,
        'md5',
        'base64',
        5
      );
      // Use loaderUtils to find the file or folder name
      const className = loaderUtils.interpolateName(
        context,
        fileNameOrFolder + '_' + localName + '__' + hash,
        options
      );
      // remove the .module that appears in every classname when based on the file.
      return className.replace('.module_', '_');
    };

    // common function to get style loaders
    const getStyleLoaders = (cssOptions, preProcessor) => {
      const loaders = [
        dev && require.resolve('style-loader'),
        !dev && {
          loader: ExtractCssChunks.loader,
          options: Object.assign(
            {},
            shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined
          ),
        },
        {
          loader: require.resolve('css-loader'),
          options: cssOptions,
        },
        {
          // Options for PostCSS as we reference these options twice
          // Adds vendor prefixing based on your specified browser support in
          // package.json
          loader: require.resolve('postcss-loader'),
          options: {
            // Necessary for external CSS imports to work
            // https://github.com/facebook/create-react-app/issues/2677
            ident: 'postcss',
            plugins: () => [
              require('postcss-flexbugs-fixes'),
              require('postcss-preset-env')({
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              }),
              // Adds PostCSS Normalize as the reset css with default options,
              // so that it honors browserslist config in package.json
              // which in turn let's users customize the target behavior as per their needs.
              postcssNormalize(),
            ],
            sourceMap: !dev,
          },
        },
      ].filter(Boolean);
      if (preProcessor) {
        loaders.push({
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: !dev,
          },
        });
      }
      return loaders;
    };

    config.resolve.extensions.push('.ts', '.tsx');

    config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));

    // Backwards compatibility with older versions of Next.js.
    // Next.js will automatically apply hot-self-accept-loader for all extensions in `pageExtensions`
    // Which next-typescript adds itself to
    if (!defaultLoaders.hotSelfAccept) {
      if (dev && !isServer) {
        config.module.rules.push({
          test: /\.(ts|tsx)$/,
          loader: 'hot-self-accept-loader',
          include: [path.join(dir, 'pages')],
          options: {
            extensions: /\.(ts|tsx)$/
          }
        });
      }
    }

    if (!isServer && !extractCssInitialized) {
      config.plugins.push(
        new ExtractCssChunks({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: dev
            ? 'static/chunks/[name].css'
            : 'static/chunks/[name].[contenthash:8].css',
          chunkFilename: dev
            ? 'static/chunks/[name].chunk.css'
            : 'static/chunks/[name].[contenthash:8].chunk.css',
          hot: dev
        })
      );
      extractCssInitialized = true;
    }

    if (!dev) {
      if (!Array.isArray(config.optimization.minimizer)) {
        config.optimization.minimizer = [];
      }

      config.optimization.minimizer.push(
        new OptimizeCssAssetsWebpackPlugin({
          cssProcessorOptions: {
            annotation: true,
            discardComments: { removeAll: true },
            inline: false,
          }
        })
      );
    }

    config.module.rules.push({
      oneOf: [
        {
          test: /\.(ts|tsx)$/,
          include: [dir],
          exclude: /node_modules/,
          use: {
            ...defaultLoaders.babel,
            options: {
              ...defaultLoaders.babel.options,
              presets: [require('@babel/preset-typescript')]
            }
          }
        },
        {
          test: cssRegex,
          exclude: cssModuleRegex,
          use: getStyleLoaders({
            importLoaders: 1,
            sourceMap: !dev,
          }),
          // Don't consider CSS imports dead code even if the
          // containing package claims to have no side effects.
          // Remove this when webpack adds a warning or an error for this.
          // See https://github.com/webpack/webpack/issues/6571
          sideEffects: true,
        },
        // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
        // using the extension .module.css
        {
          test: cssModuleRegex,
          use: getStyleLoaders({
            importLoaders: 1,
            sourceMap: !dev,
            modules: true,
            getLocalIdent: getCSSModuleLocalIdent,
          }),
        },
        // Opt-in support for SASS (using .scss or .sass extensions).
        // By default we support SASS Modules with the
        // extensions .module.scss or .module.sass
        {
          test: sassRegex,
          exclude: sassModuleRegex,
          use: getStyleLoaders(
            {
              importLoaders: 2,
              sourceMap: !dev,
            },
            'sass-loader'
          ),
          // Don't consider CSS imports dead code even if the
          // containing package claims to have no side effects.
          // Remove this when webpack adds a warning or an error for this.
          // See https://github.com/webpack/webpack/issues/6571
          sideEffects: true,
        },
        // Adds support for CSS Modules, but using SASS
        // using the extension .module.scss or .module.sass
        {
          test: sassModuleRegex,
          use: getStyleLoaders(
            {
              importLoaders: 2,
              sourceMap: !dev,
              modules: true,
              getLocalIdent: getCSSModuleLocalIdent,
            },
            'sass-loader'
          ),
        },
      ]
    });

    if (process.env.ANALYZE_BUILD) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html'
        })
      );
    }

    return config;
  }
};

module.exports = initConfig;