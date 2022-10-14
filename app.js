const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 6060;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true } 
);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

const usersRouter = require('./routes/users');
const participantsRouter = require('./routes/participants');

app.use('/users', usersRouter);
app.use('/participants', participantsRouter);

// Routes

/**
 * Default route
 * Temporary 'hello world' for testing
 */
app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});