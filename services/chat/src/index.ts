import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sequelize from './config/database';
import healthRoutes from './routes/health';
import { initEventBus, closeEventBus } from '@leetconnect/shared';
import { errorHandler } from '@leetconnect/shared';
import { error } from 'console';
import fs from 'fs';
import https from 'https';
import testRoutes from './routes/test.routes';
const app = express();
const server = http.createServer(app);
const PORT = 3003;

// Socket.io
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const sslOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH as string),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH as string)
};


// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/chat', healthRoutes);
app.use('/api/chat', testRoutes);

// error handler (must be after all routes)
app.use(errorHandler);

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });
  socket.on('send_message', (data) => {
    io.to(data.conversationId).emit('new_message', data);
  });
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('user_typing', data);
  });
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Chat DB connected');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Chat models synced');
    initEventBus(process.env.REDIS_URL);
      https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
      console.log(`Chat service running on port ${PORT}`);
    });
  } catch (err) {
    const error = err as Error;
    console.error('Chat service failed to start:', error.message);
    process.exit(1);
  }
}
start();

process.on('SIGTERM', async () => {
  console.log('Shutting down chat service...');
  io.close();
  await closeEventBus();
  await sequelize.close();
  process.exit(0);
});