import http from 'http';
import mongoose from 'mongoose';
import app from './src/app.js';
import { config } from './src/config/config.js';
import { initSocket } from './src/config/socket.js';
import { startWorker } from './src/worker/taskWorker.js';
async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected');

    const server = http.createServer(app);
    initSocket(server);
    console.log(typeof config.ENABLE_PM)
    if (!config.ENABLE_PM) {
        console.log('Starting worker from main process');
        
     startWorker()
    }
    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Swagger docs at http://localhost:${config.port}/api/docs`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
