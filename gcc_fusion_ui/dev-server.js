const { createServer } = require('vite');

async function startServer() {
  try {
    const server = await createServer({
      server: {
        port: 3000,
        host: true
      }
    });
    
    await server.listen();
    console.log('🚀 Frontend server running on http://localhost:3000');
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();