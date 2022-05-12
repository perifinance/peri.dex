module.exports = {
    devServer: {
      proxy: {
        '/graph': 'https://subgraph.peri.finance',
      }
    },
    style: {
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
    // webpack: {
    //   plugins: {
    //     add: [
    //       new webpack.DefinePlugin({
    //         process: {env: {}}
    //       })
    //     ]
    //   }
    // }
  }