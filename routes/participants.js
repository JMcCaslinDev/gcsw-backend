const router = require('express').Router();
let Participant = require('../models/participant.model');

const { checkJwt } = require('../authz/check-jwt');
const { updateOne } = require('../models/participant.model');

/**
 * default route, gets all participants in the db
 */
router.route('/').get((req, res) => {
    Participant.find()
        .then(participants => res.json(participants))
        .catch(err => res.status(400).json('Error: ' + err));
});

/**
 * finds a participant by their id
 */
router.route('/:participant_id').get((req, res) => {
    Participant.find({participant_id: req.params.participant_id})
        .then(participant => res.json(participant))
        .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/date/:date').get((req, res) => {
Participant.find({dates: { $all: [req.params.date] }})
        .then(participants => res.json(participants))
        .catch(err => res.status(400).json('Error: ' + err))   
});

/**
 * signs in participant for the day
 */
router.route('/signin').post((req, res) => {
    // find the participant
    Participant.findOne({participant_id: req.body.participant_id}, function(err, participant) {
        if (!err) {
            // if participant is already in the db, simply update their objective and sign in date
            if (participant) {
                let newDate = new Date();

                // update the participant with new objective and date
                Participant.updateOne( 
                    { participant_id: req.body.participant_id },
                    { $push: { 
                        objectives: req.body.objective,
                        dates: newDate.toDateString() }},
                )
                .then(() => res.json('Participant signed in'))
                .catch(err => res.status(400).json('Error: ' + err));
            } else {
                // save request body values
                const participant_id = req.body.participant_id;
                const first_name = req.body.first_name;
                const last_name = req.body.last_name;
                const gender = req.body.gender;
                const age = req.body.age;
                const school = req.body.school;
                const objective = req.body.objective;
                let date = new Date(); // current date

                // create new array of dates, push first date
                const dates = [];
                dates.push(date.toDateString());

                // creates new array of objectives, push first objective
                const objectives = [];
                objectives.push(objective);

                // create a new participant
                const newParticipant = new Participant({
                    participant_id,
                    first_name,
                    last_name,
                    gender,
                    age,
                    school,
                    objectives,
                    dates
                });

                // save new participant
                newParticipant.save()
                    .then(() => res.json('Participant added!'))
                    .catch(err => res.status(400).json('Error: ' + err));
            }
        }
    });
});

// deletes a parpicipant entry by deleting a date
router.route('/:id/:date').put((req, res) => {
    Participant.updateOne(
        { _id: req.params.id },
        { $pull: { dates: req.params.date } }
    )
    .then(() => res.json('Participant entry deleted!'))
    .catch(err => res.status(400).json('Error: ' + err));
});
module.exports = router;