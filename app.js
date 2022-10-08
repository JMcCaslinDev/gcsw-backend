const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();
const { auth } = require('express-openid-connect'); 

const app = express();
const port = process.env.PORT || 2000;

const config = {
    authRequired: false,
    auth0Logout: true,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: process.env.SECRET
}

app.use(cors());
app.use(express.json());
app.use(auth(config));

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true } 
);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

const usersRouter = require('./routes/users');
const { propfind } = require("./routes/users");

app.use('/users', usersRouter);

// Routes

/**
 * Default route
 * Temporary 'hello world' for testing
 */
app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});