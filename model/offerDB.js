const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    categoryName:{
        type:String
    },
    productName:{
        type:String
    },
    discount:{
        type:Number
    },
    count:{
        type:Number,
        required:true
    },
    expiryDate:{
        type:Date,
        default:function(){
            const currentDate = new Date()
            currentDate.setHours(0,0,0,0)
            return currentDate
        },
        get:function(val){
            return val ? new Date(val).toLocaleDateString('en-GB') : '';
        }
    },
    enable:{
        type:Boolean,
        default:true
    }
});

const offerCollection = new mongoose.model('offerCollection',offerSchema)
module.exports = {offerCollection}