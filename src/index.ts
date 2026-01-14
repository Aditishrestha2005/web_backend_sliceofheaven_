import express, { Application, Request, Response } from 'express';
import cors from "cors";
import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import authRoutes from "./routes/user.route"; // your route that calls UserService

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: true, message: "Welcome to the API" });
});

// Start server with DB connection
async function startServer() {
    try {
        await connectDatabase();
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
}

startServer();
