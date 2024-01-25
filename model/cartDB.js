const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "detailsLog",

        
    },
    products: [{
        product: { 
            type:mongoose.Schema.Types.ObjectId,
            ref: 'productCollection',
            
        },
         quantity: {
            type: Number,
         
            
        },

    }],
    discount :{
        type : Number,
        required : false
    },
    couponApplied: {
        type: Boolean,
        default: false
    },
    totalprice:{
        type:Number,
        required:false
    }



});
const cartCollection =new mongoose.model('cartCollection',cartSchema)
module.exports = {cartCollection}