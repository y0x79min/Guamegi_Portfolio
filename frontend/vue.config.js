const fs = require('fs');
const localDev = process.env.GUAMEGI_LOCAL_DEV === '1';
const backendUrl = process.env.GUAMEGI_BACKEND_URL || 'http://localhost:3000';
const frontendPort = Number(process.env.GUAMEGI_FRONTEND_PORT || 8080);

module.exports = {
  devServer: { //① api 요청이 있을때 어디에서 처리할지를 설정
    https: localDev ? false : {
      key: fs.readFileSync('../https/rootca.key'),
      cert: fs.readFileSync('../https/rootca.crt'),
    },
    allowedHosts: 'all',
    port: localDev ? frontendPort : 443,
    proxy: localDev ? {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/socket.io': {
        target: backendUrl,
        changeOrigin: true,
        ws: true,
      },
    } : {
      '/api': {
        target: 'https://localhost:443/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },

  //② 배포 파일의 위치를 지정
  outputDir: '../backend/public',

  chainWebpack: config=>{
    config.plugins.delete('prefetch');
  },

  pluginOptions: {
    vuetify: {
			// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
		}
  }
}