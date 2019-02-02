const express = require('express');
const statusRoute = require('./routes/status');

function createApp(path) {
  path = path || '/api';
  const app = express();
  app.use(path + '/status', statusRoute);
  return app;
}

module.exports = {
  createApp
};
