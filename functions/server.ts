import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import createApp from './app';

const port = parseInt(process.env.PORT || '') || 3001;

createApp().listen(port, 'localhost', () => {
  console.log(`listening on port ${port}`)
});
