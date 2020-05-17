import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import cors from 'cors';

// Import routs
import usersRoute from './routes/users.route';

// Connect to db
mongoose.connect(
    "mongodb://localhost:27017/autotrader",
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("Connected to db")
)

const app = express();
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
app.use(express.json());
app.use(cors());
app.use('/users', usersRoute);

app.get('/test', (req: Request, res: Response) => {
    res.send('natan')
})

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));