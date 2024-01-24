//ORDER SCHEMA orderDB


const mongoose = require('mongoose');
const { productCollection } = require('./productDB');
const {Schema} =mongoose;

const addressSchema = new mongoose.Schema({
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    postalCode:{
        type:Number,
        required:true
    },
    country:{
        type:String,
        required:true
    }

});


const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"logDetails"
    },
    productdetails: [{
        product:{
            type:mongoose.Schema.ObjectId,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
    }],
    status:{
        type:String,
        default:'PENDING'
    },
    Ordernumber:{
        type:String,
        required:true
    },
    total:{
        type:Number,
        required:true
    },
    address:addressSchema,},{timestamps:true});

const orderCollection = new mongoose.model('orderCollection',orderSchema);
module.exports = {orderCollection}