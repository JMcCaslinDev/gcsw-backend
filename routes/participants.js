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
Participant.find({[`dates_with_objectives.${req.params.date}`]: { 
                    "$exists": true 
                }
            })
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
                    { $set: { 
                        [`dates_with_objectives.${newDate.toDateString()}`]: req.body.objective }},
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
                let date = new Date(req.body.date); // current date
                date = date.toDateString();

                const dates_with_objectives = new Map();

                // create a new participant
                const newParticipant = new Participant({
                    participant_id,
                    first_name,
                    last_name,
                    gender,
                    age,
                    school,
                    dates_with_objectives
                });

                newParticipant.dates_with_objectives.set(date, objective);

                // save new participant
                newParticipant.save()
                    .then(() => res.json('Participant added!'))
                    .catch(err => res.status(400).json('Error: ' + err));
            }
        }
    });
});

// updates all of a participant's information
router.route('/edit/:id').put((req, res) => {
    Participant.findById(req.params.id)
        .then(participant => {
            participant.participant_id = req.body.participant_id;
            participant.first_name = req.body.first_name;
            participant.last_name = req.body.last_name;
            participant.gender = req.body.gender;
            participant.age = req.body.age;
            participant.school = req.body.school;
            participant.dates_with_objectives.set(req.body.date, req.body.objective);

            participant.save()
                .then(() => res.json('Participant updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
})

// deletes a parpicipant entry by deleting a date
router.route('/delete_entry/:id/:date').put((req, res) => {
    Participant.updateOne(
        { _id: req.params.id },
        { $pull: { dates: req.params.date } }
    )
    .then(() => res.json('Participant entry deleted!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// deletes a whole participant
router.route('/delete/:id').delete((req, res) => {
    Participant.findByIdAndDelete(req.params.id)
        .then(() => res.json('Participant deleted'))
        .catch(err => res.status(400).json('Error: ' + err));
})
module.exports = router;