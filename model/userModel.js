//SCHEMA

const mongoose = require('mongoose');
const loginSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    blocked: {
        type: Boolean,
        default: false
    },
    addressCollection: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'addressCollection'
        }
    ], // for the address schema

});



const logDetails = new mongoose.model('detailsLog', loginSchema);

module.exports = { logDetails };


