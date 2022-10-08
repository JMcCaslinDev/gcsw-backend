const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
let User = require('../models/user.model');

// default route, gets all users in the db
router.route('/').get(requiresAuth(), (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});

// adds a user to the db
router.route('/add').post(requiresAuth(), (req, res) => {
    const username = req.body.username;

    // create a new user
    const newUser = new User({username});

    newUser.save()
        .then(() => res.json('User added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;