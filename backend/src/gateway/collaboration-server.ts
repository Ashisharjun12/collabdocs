import { hocuspocusServer } from './hocuspocus.js';
import { logger } from '../utils/logger.js';
import { initDatabases } from '../infrastructure/db/index.js';

const startCollaborationServer = async () => {
  try {
    // Initialize DB connection for the standalone process
    await initDatabases();
    
    // Start Hocuspocus
    await hocuspocusServer.listen();
    
    logger.info('Hocuspocus Standalone Server listening on port 3001');
  } catch (error) {
    logger.error(error, 'Failed to start Hocuspocus Standalone Server');
    process.exit(1);
  }
};

void startCollaborationServer();
