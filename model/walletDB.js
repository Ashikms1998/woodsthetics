const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'logDetails'
    },
    balance:{
        type:Number,
        default:0
    },
    wallethistory:[{
        process:{
            type:String
        },
        amount:{
            type:Number
        },
        date:{
            type:Date,
            default:Date.now
        }
    }]
})

const walletCollection =new mongoose.model('walletCollection',walletSchema);

module.exports = {walletCollection}