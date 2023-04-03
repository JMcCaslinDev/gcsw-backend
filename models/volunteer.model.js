const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const volunteerSchema = new Schema({
    volunteer_id: { type: String, require: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, require: true },
    volunteer_objectives : { type: Map, required: true, default:""},
    volunteer_suggestions: { type: Map, required: true, default:""},
    log_in_time: {type:Date},
    log_out_time: {type:Date},
    total_hours: {type: Number, default: 0},
    is_signed_in: {type: Boolean}
}, {
    timestamps: true,
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer;