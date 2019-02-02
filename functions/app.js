const express = require('express');
const statusRoute = require('./routes/status');
const brawlstarsRoute = require('./routes/brawlstars');

function createApp(path) {
  path = path || '/api';
  const app = express();
  app.use(path + '/status', statusRoute);
  app.use(path + '/brawlstars', brawlstarsRoute);
  return app;
}

module.exports = {
  createApp
};
