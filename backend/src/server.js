const app = require('./app');
const logger = require('./utils/logger');
const prisma = require('./lib/prisma');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    const server = app.listen(PORT, () => {
      logger.info(`🚀 CivicSync API running on http://localhost:${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔍 Health: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', { reason });
    });

  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
