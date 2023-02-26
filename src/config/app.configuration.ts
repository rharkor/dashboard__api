export default () => ({
  app_port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  app_version: '1.0.0',
});
