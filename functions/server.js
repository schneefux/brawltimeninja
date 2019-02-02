const { createApp } = require('./app');

const port = parseInt(process.env.PORT) || 3001;

new createApp().listen(port, 'localhost', () => {
  console.log(`listening on port ${port}`)
});
