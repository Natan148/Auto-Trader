import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Import routs
import usersRoute from './routes/users.route';

// Connect to db
mongoose.connect(
    "mongodb://localhost:27017/bank",
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("Connected to db")
)

const app = express()
app.use(express.json());
app.use(cors());
app.use('/users', usersRoute);

app.get('/test', (req: Request, res: Response) => {
    res.send('natan')
})

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));