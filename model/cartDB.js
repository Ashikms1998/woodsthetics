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



});
const cartCollection =new mongoose.model('cartCollection',cartSchema)
module.exports = {cartCollection}