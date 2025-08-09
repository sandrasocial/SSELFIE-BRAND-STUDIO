export const serverConfig = {
  port: process.env.PORT || 5000,
  host: process.env.HOST || '0.0.0.0',
  env: process.env.NODE_ENV || 'development',
  apiPrefix: '/api'
};