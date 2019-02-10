import { createServer, proxy } from 'aws-serverless-express';
import lambda from 'aws-lambda';
import createApp from './app';

const server = createServer(createApp('/.netlify/functions/api').callback());

export const handler = (event: any, context: lambda.Context) => {
  proxy(server, event, context);
};
