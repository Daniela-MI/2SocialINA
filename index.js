import express from 'express';
import connectToDB from './config/mongoConnection.js';
import authRouter from './api/auth.js';
import postsRouter from './api/posts.js';
import profileRouter from './api/profile.js';
import usersRouter from './api/users.js';

const app = express();

connectToDB();

app.use(express.json());

app.get('/', (request, response) => response.send('My first endpoint ....'));

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/users', usersRouter);

const PORT = 5500;

app.listen(5500, () => console.log(`Server started on port ${PORT}`));
