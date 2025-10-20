import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:'https://ai-assistant-frontend-xiko.onrender.com',
    credentials: true
}));




app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);


app.get('/', (req, res) => {
    res.send('Hello World!');
});



app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});