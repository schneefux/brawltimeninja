import awsServerlessExpress from 'aws-serverless-express';
import lambda from 'aws-lambda';
import createApp from './app';

const server = awsServerlessExpress.createServer(createApp('/.netlify/functions/api'));

export const handler = (event: any, context: lambda.Context) => {
  awsServerlessExpress.proxy(server, event, context);
};
