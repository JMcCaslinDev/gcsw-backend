const router = require('express').Router();
let Participant = require('../models/participant.model');

const { checkJwt } = require('../authz/check-jwt');
const { updateOne } = require('../models/participant.model');

/**
 * default route, gets all participants in the db
 */
router.route('/').get(checkJwt, (req, res) => {
    Participant.find().sort('first_name')
        .then(participants => res.json(participants))
        .catch(err => res.status(400).json('Error: ' + err));
});

/**
 * finds a participant by their object id in MongoDB document
 */
router.route('/id/:object_id').get(checkJwt, (req, res) => {
    Participant.findById(req.params.object_id)
        .then(participant => res.json(participant))
        .catch(err => res.status(400).json('Error: ' + err));
});

/**
 * finds a participant by their custom id
 */
router.route('/participant_id/:participant_id').get((req, res) => {
    Participant.find({participant_id: req.params.participant_id})
        .then(participant => res.json(participant))
        .catch(err => res.status(400).json('Error: ' + err))
});

/**
 * finds all participants with the matching date parameter
 */
router.route('/date/:date').get(checkJwt, (req, res) => {
Participant.find({[`dates_with_objectives.${req.params.date}`]: { 
                    "$exists": true 
                }
            })
        .then(participants => res.json(participants))
        .catch(err => res.status(400).json('Error: ' + err))   
});

/**
 * signs in participant for the day
 * creates new participant if not in the db
 */
router.route('/signin').post((req, res) => {
    // find the participant
    Participant.findOne({participant_id: req.body.participant_id}, function(err, participant) {
        if (!err) {
            // if participant is already in the db, simply update their objective and sign in date
            if (participant) {
                // update the participant with new objective and date
                Participant.updateOne( 
                    { participant_id: req.body.participant_id },
                    { $set: { 
                        [`dates_with_objectives.${req.body.date}`]: req.body.objective }},
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

                // initialize empty map
                const dates_with_objectives = new Map();

                // create a new participant object
                const newParticipant = new Participant({
                    participant_id,
                    first_name,
                    last_name,
                    gender,
                    age,
                    school,
                    dates_with_objectives
                });

                // set new date key with objective
                newParticipant.dates_with_objectives.set(req.body.date, objective);

                // save new participant
                newParticipant.save()
                    .then(() => res.json('Participant added!'))
                    .catch(err => res.status(400).json('Error: ' + err));
            }
        }
    });
});

/**
 * updates all of a participant's information
 */
router.route('/edit/:object_id').put(checkJwt, (req, res) => {
    // find with object ID parameter
    Participant.findById(req.params.object_id)
        .then(participant => {
            // update participant fields
            participant.participant_id = req.body.participant_id;
            participant.first_name = req.body.first_name;
            participant.last_name = req.body.last_name;
            participant.gender = req.body.gender;
            participant.age = req.body.age;
            participant.school = req.body.school;
            // participant.dates_with_objectives.set(req.body.date, req.body.objective);

            // save the participant
            participant.save()
                .then(() => res.json('Participant updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

/**
 * deletes a parpicipant date entry
 * TODO: Has bug that causes authorization error when using checkJwt middleware
 */
router.route('/delete_entry/:object_id/:date').put((req, res) => {
    // find using object ID parameter
    Participant.findById(req.params.object_id)
        .then(participant => {
            // deletes date key from dates_with_objectives map
            participant.dates_with_objectives.delete(req.params.date);
            
            // save participant
            participant.save()
                .then(() => res.json('Participant entry deleted!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

/**
 * deletes an entire participant document from the db
 */
router.route('/delete/:object_id').delete(checkJwt, (req, res) => {
    // finds and deletes using object ID
    Participant.findByIdAndDelete(req.params.object_id)
        .then(() => res.json('Participant deleted'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/search').get((req, res) => {
    const searchTerm = req.query.q;
    Participant.find({ first_name: { $regex: `^${searchTerm}`, $options: 'i' } })
      .exec()
      .then(participants => res.json(participants))
      .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
