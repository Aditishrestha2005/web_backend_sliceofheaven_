import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import authRoutes from './routes/user.route';

const app: Application = express();

/* CORS configuration (similar to teacher) */
const corsOptions = {
    origin: ['http://localhost:3000'],
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(corsOptions));

/* Body parser middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Routes */
app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: 'Welcome to the API',
    });
});

/* Start server */
async function startServer() {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`Server: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
}

startServer();
