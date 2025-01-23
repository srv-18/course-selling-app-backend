import express, { Request, Response } from 'express'
import { userRouter } from './routes/user'
import { courseRouter } from './routes/course';
import { adminRouter } from './routes/admin';
import mongoose from 'mongoose';
import cookieParser from "cookie-parser"
import dotenv from "dotenv"

dotenv.config();

const app = express();
const port = process.env.HTTP_PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Hello World!');
});

async function main() { 

    const dataBaseUrl = process.env.DATABASE_URL || "";
    await mongoose.connect(dataBaseUrl);

    app.listen(port);
}

main();
