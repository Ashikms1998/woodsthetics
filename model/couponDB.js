const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponName:{
        type:String
    },
    couponCode:{
        type:String,
        required:true,
        unique:true //For checking uniqness
    },
    discountType:{
        type:String,
        enum:['Percentage','Fixed Amount'], //Assuming two type of discounts(by percentage,by amount)
        required:true,
    },
    discountValue:{
        type:Number,
        required:true
    },
    minimumPurchase:{
        type:Number,
        default:0 //assuming if minimum value not set it consider as 0
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    }
});

const couponCollection = new mongoose.model('couponCollection',couponSchema);
module.exports = {couponCollection};