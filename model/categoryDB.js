const mongoose = require('mongoose');

const categorySchema =new mongoose.Schema({
    categoryname: {
        type: String,
        required:true
    },
    description:{
        type:String,
        // required:true
    },
    blockStatus: {
        type: Boolean,
        default: false,
    //  required: true
    }

}); 

const categoryCollection = new mongoose.model('categoryCollection',categorySchema);

module.exports={categoryCollection} ;