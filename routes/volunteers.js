const router = require('express').Router()
let Volunteer = require('../models/volunteer.model')

const { checkJwt } = require('../authz/check-jwt')
const { updateOne } = require('../models/volunteer.model')

/**
 * default route, gets all volunteers in the db
 */
router.route('/').get(
  /*checkJwt,*/ (req, res) => {
    Volunteer.find()
      .then((volunteers) => res.json(volunteers))
      .catch((err) => res.status(400).json('Error: ' + err))
  }
)

/**
 * finds a volunteer by their object id in MongoDB document
 */
router.route('/id/:object_id').get(checkJwt, (req, res) => {
  Volunteer.findById(req.params.object_id)
    .then((volunteer) => res.json(volunteer))
    .catch((err) => res.status(400).json('Error: ' + err))
})

/**
 * finds a volunteer by their custom id
 */
router.route('/volunteer_id/:volunteer_id').get((req, res) => {
  Volunteer.find({ volunteer_id: req.params.volunteer_id })
    .then((volunteer) => res.json(volunteer))
    .catch((err) => res.status(400).json('Error: ' + err))
})

/**
 * finds all volunteers with the matching date parameter
 */
router.route('/date/:date').get(checkJwt, (req, res) => {
  Volunteer.find({
    [`dates_with_objectives.${req.params.date}`]: {
      $exists: true,
    },
  })
    .then((volunteers) => res.json(volunteers))
    .catch((err) => res.status(400).json('Error: ' + err))
})

/**
 * signs in volunteer for the day
 * creates new volunteer if not in the db
 */
router.route('/signin').post((req, res) => {
  // find the volunteer
  Volunteer.findOne(
    { volunteer_id: req.body.volunteer_id },
    function (err, volunteer) {
      if (!err) {
        // if volunteer is already in the db, simply update their objective and sign in date
        if (volunteer) {
          // update the volunteer with new objective and date
          Volunteer.updateOne(
            { volunteer_id: req.body.volunteer_id },
            {
              $set: {
                [`volunteer_objectives.${req.body.date}`]: 'Sample objective',
                ['is_signed_in']: true,
                ['log_in_time']: Date.now(),
              },
            }
          )
            .then(() => res.json('Volunteer signed in'))
            .catch((err) => res.status(400).json('Error: ' + err))
        } else {
          // save request body values
          const volunteer_id = req.body.volunteer_id
          const first_name = req.body.first_name
          const last_name = req.body.last_name
          const gender = req.body.gender
          const age = req.body.age
          const is_signed_in = true
          const phone_number = req.body.phone_number
          const log_in_time = Date.now()

          // initialize empty map
          const volunteer_objectives = new Map()
          const volunteer_suggestions = new Map()
          const hours_on_date = new Map()

          // create a new volunteer object
          const newVolunteer = new Volunteer({
            volunteer_id,
            first_name,
            last_name,
            gender,
            age,
            volunteer_objectives,
            volunteer_suggestions,
            hours_on_date,
            is_signed_in,
            log_in_time,
            phone_number,
            // school,
            // dates_with_objectives
          })

          // set new date key with objective
          newVolunteer.volunteer_objectives.set(req.body.date, 'objective')
          newVolunteer.volunteer_suggestions.set(req.body.date, 'objective')
          newVolunteer.hours_on_date.set(req.body.date, 0)

          // save new volunteer
          newVolunteer
            .save()
            .then(() => res.json('Volunteer added!'))
            .catch((err) => res.status(400).json('Error: ' + err))
        }
      }
    }
  )
})

/**
 * updates all of a volunteer's information
 */
router.route('/edit/:object_id').put(checkJwt, (req, res) => {
  // find with object ID parameter
  Volunteer.findById(req.params.object_id)
    .then((volunteer) => {
      // update volunteer fields
      volunteer.volunteer_id = req.body.volunteer_id
      volunteer.first_name = req.body.first_name
      volunteer.last_name = req.body.last_name
      volunteer.gender = req.body.gender
      volunteer.age = req.body.age
      volunteer.school = req.body.school
      // volunteer.dates_with_objectives.set(req.body.date, req.body.objective);

      // save the volunteer
      volunteer
        .save()
        .then(() => res.json('Volunteer updated!'))
        .catch((err) => res.status(400).json('Error: ' + err))
    })
    .catch((err) => res.status(400).json('Error: ' + err))
})

/**
 * deletes a parpicipant date entry
 * TODO: Has bug that causes authorization error when using checkJwt middleware
 */
router.route('/delete_entry/:object_id/:date').put(checkJwt, (req, res) => {
  // find using object ID parameter
  Volunteer.findById(req.params.object_id)
    .then((volunteer) => {
      // deletes date key from dates_with_objectives map
      volunteer.dates_with_objectives.delete(req.params.date)

      // save volunteer
      volunteer
        .save()
        .then(() => res.json('Volunteer entry deleted!'))
        .catch((err) => res.status(400).json('Error: ' + err))
    })
    .catch((err) => res.status(400).json('Error: ' + err))
})

/**
 * deletes an entire volunteer document from the db
 */
router.route('/delete/:object_id').delete(checkJwt, (req, res) => {
  // finds and deletes using object ID
  Volunteer.findByIdAndDelete(req.params.object_id)
    .then(() => res.json('Volunteer deleted'))
    .catch((err) => res.status(400).json('Error: ' + err))
})

router.route('/search').get((req, res) => {
  const searchTerm = req.query.q
  Volunteer.find({ first_name: { $regex: `^${searchTerm}`, $options: 'i' } })
    .exec()
    .then((volunteers) => res.json(volunteers))
    .catch((err) => res.status(400).json('Error: ' + err))
})

router.route('/searchTitle').get((req, res) => {
  const searchTerm = req.query.q
  const query = searchTerm ? { volunteer_title: searchTerm } : {}
  Volunteer.find(query)
    .exec()
    .then((volunteers) => res.json(volunteers))
    .catch((err) => res.status(400).json('Error: ' + err))
})

router.route('/logout').put((req, res) => {
  //TODO
  Volunteer.findOne(
    { volunteer_id: req.body.volunteer_id },
    function (err, volunteer) {
      if (!err) {
        // if volunteer is already in the db, simply update their objective and sign in date
        if (volunteer) {
          const log_in_time = volunteer.log_in_time.getTime()
          const log_out_time = Date.now()
          const difference_ms = log_out_time - log_in_time
          const difference_hrs = difference_ms / (1000 * 60 * 60)
          const total_hours = (volunteer.total_hours + difference_hrs).toFixed(
            1
          )
          const title = getTitle(total_hours)
          const hoursOnDate = req.body.difference_hrs
            ? req.body.difference_hrs.toFixed(1)
            : '0'
          // update the volunteer with new objective and date
          Volunteer.updateOne(
            { volunteer_id: req.body.volunteer_id },
            {
              $set: {
                ['is_signed_in']: false,
                [`volunteer_objectives.${req.body.date}`]: req.body.objective,
                [`volunteer_suggestions.${req.body.date}`]:
                  req.body.suggestions,
                [`hours_on_date.${req.body.date}`]: hoursOnDate,
                ['total_hours']: total_hours,
                ['volunteer_title']: title,
              },
            }
          )
            .then(() => res.json('Volunteer logged out'))
            .catch((err) => res.status(400).json('Error: ' + err))
        }
      }
    }
  )
})

router.route('/adminLogout').put((req, res) => {
  //TODO
  Volunteer.findOne(
    { volunteer_id: req.body.volunteer_id },
    function (err, volunteer) {
      if (!err) {
        // if volunteer is already in the db, simply update their objective and sign in date
        if (volunteer) {
          const log_in_time = volunteer.log_in_time.getTime()
          const log_out_time = Date.now()
          const difference_ms = log_out_time - log_in_time
          const difference_hrs = difference_ms / (1000 * 60 * 60)
          const total_hours = (volunteer.total_hours + difference_hrs).toFixed(
            1
          )
          const title = getTitle(total_hours)

          const hoursOnDate = req.body.difference_hrs
            ? req.body.difference_hrs.toFixed(1)
            : 0

          // update the volunteer with new objective and date
          Volunteer.updateOne(
            { volunteer_id: req.body.volunteer_id },
            {
              $set: {
                ['is_signed_in']: false,
                [`volunteer_objectives.${req.body.date}`]: 'Force Logged Out',
                [`volunteer_suggestions.${req.body.date}`]: 'Force Logged Out',
                [`hours_on_date.${req.body.date}`]: hoursOnDate,
                ['total_hours']: total_hours,
                ['volunteer_title']: title,
              },
            }
          )
            .then(() => res.json('Volunteer logged out'))
            .catch((err) => res.status(400).json('Error: ' + err))
        }
      }
    }
  )
})

const getTitle = (totalHours) => {
  if (totalHours >= 10 && totalHours <= 25) {
    return 'Lab Explorer'
  } else if (totalHours >= 26 && totalHours <= 50) {
    return 'Science Sidekick'
  } else if (totalHours >= 51 && totalHours <= 100) {
    return 'Research Rockstar'
  } else if (totalHours >= 101 && totalHours <= 200) {
    return 'Experiment Hunter'
  } else if (totalHours >= 201 && totalHours <= 300) {
    return 'Lab Ninja'
  } else if (totalHours >= 301 && totalHours <= 400) {
    return 'Dr. Cerebro'
  } else if (totalHours >= 401 && totalHours <= 500) {
    return 'Jedi of Science'
  } else if (totalHours >= 501 && totalHours <= 750) {
    return 'Master of Science'
  } else if (totalHours >= 751 && totalHours <= 1000) {
    return 'Science Sensei'
  } else if (totalHours > 1000) {
    return 'Mad Scientist'
  } else {
    return 'Intern Scientist'
  }
}

module.exports = router
