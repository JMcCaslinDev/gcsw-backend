const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Routes

/**
 * Default route
 * Temporary 'hello world' for testing
 */
app.get('/', (req, res) => {
    res.send('Hello world');
});

app.get('/users', (req, res) => {
    res.send('This is the user page');
});

app.listen(port);