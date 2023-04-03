const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true } 
);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

const participantsRouter = require('./routes/participants');
const volunteersRouter = require('./routes/volunteers')

/**
 * API endpoints
 */
app.use('/api/participants', participantsRouter);
app.use('/api/volunteers', volunteersRouter)

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