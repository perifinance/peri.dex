module.exports = {
    devServer: {
      proxy: {
        '/subgraphs': 'http://18.222.240.166:8000/',
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
  }