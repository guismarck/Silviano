const { createProxyMiddleware } = require('http-proxy-middleware');

const apiTarget = (process.env.REACT_APP_API_URL || 'http://localhost:8080').trim();

module.exports = (app) => {
  const proxyOptions = {
    target: apiTarget,
    changeOrigin: true
  };

  app.use('/estudiante-app', createProxyMiddleware(proxyOptions));
  app.use('/reportes', createProxyMiddleware(proxyOptions));
};
