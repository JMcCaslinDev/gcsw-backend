const router = require('express').Router();
let Participant = require('../models/participant.model');

const { checkJwt } = require('../authz/check-jwt');
const { updateOne } = require('../models/participant.model');

// default route, gets all participants in the db
router.route('/').get((req, res) => {
    Participant.find()
        .then(participants => res.json(participants))
        .catch(err => res.status(400).json('Error: ' + err));
});

// adds a new participant to the db
router.route('/add').post((req, res) => {
    const participant_id = req.body.participant_id;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const gender = req.body.gender;
    const age = req.body.age;
    const school = req.body.school;
    const objective = req.body.objective;
    const date = new Date();

    // create new array of dates, push first date
    const dates = [];
    dates.push(date);

    // create a new participant
    const newParticipant = new Participant({
        participant_id,
        first_name,
        last_name,
        gender,
        age,
        school,
        objective,
        dates
    });

    // save new participant
    newParticipant.save()
        .then(() => res.json('Participant added!'))
        .catch(err => res.status(400).json('Error: ' + err));
})

// updates a participant
router.route('/update/:participant_id').put((req, res) => {
    newDate = new Date();

    // pushes new date into the dates array
    Participant.updateOne(
        { participant_id: req.params.participant_id },
        { $push: { dates: newDate }}
    )
        .then(() => res.json('Participant updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;