const mongoose = require('mongoose')
const {Schema} = mongoose;
const addressSchema = new mongoose.Schema({
    
    address:{
        type:"String",
        
    },
    city:{
        type:"String",
        
    },
    state:{
        type:"String",
        
    },
    postalcode:{
        type:"Number",
        match: /^\d{6}$/,
        
    },
    country:{
        type:"String",
        required:"true"
    }

});
const addressCollection = new mongoose.model('addressCollection', addressSchema);

module.exports = {addressCollection };
