const awsServerlessExpress = require('aws-serverless-express');
const { createApp } = require('./app');

const server = awsServerlessExpress.createServer(createApp('/.netlify/functions/api'));

export const handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
