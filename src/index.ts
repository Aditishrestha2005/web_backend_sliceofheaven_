import app from './app';
import { PORT } from './config';
import { connectDatabase } from './database/mongodb';


async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
