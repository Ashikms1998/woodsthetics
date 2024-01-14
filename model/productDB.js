const mongoose = require('mongoose');

const productSchema =new mongoose.Schema({
    productname: {
        type: String,
        // required:true
    },
    description:{
        type:String,
        // required:true
    },
    category: {
        type:String,
        // required:true
    },
    price:{
        type:Number,
        // required:true 
    },
    quantity:{
        type:Number,
        // required:true 
    },
    brand:{
        type:String,
        // required:true
    },
    image:[{
        type:String,
    }],
    about:{
        type:String,
        // required:true
    },
    availability:{
        type:String,
        // required:true
    },
    blocked:{
        type:Boolean,
        default:false
    }
   

}); 

const productCollection =new mongoose.model('productCollection',productSchema);

module.exports={productCollection} ;