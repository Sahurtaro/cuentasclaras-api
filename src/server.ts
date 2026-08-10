import app from './app.js';

const port = 3000;

const server = app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

server.on('error', (error) => {
  console.error('Error initializing the server:', error);
  process.exit(1);
});
