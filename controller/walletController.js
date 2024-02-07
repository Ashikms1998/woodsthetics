const {walletCollection} = require('../model/walletDB');
const { logDetails } = require('../model/userModel');

exports.walletGet = async(req,res)=>{
    try {
        const userData = req.session.user;
        const walletData = await walletCollection.find()
        res.render('user/wallet',{userData,walletData})
        
    } catch (error) {
        console.log(error,'Error in Wallet Get');
    }
};

exports.walletPost = async(req,res)=>{
    try {
        let user = req.session.user;
        if(!user){
           return res.redirect('/login');
        }else{
            let userid = req.session.user._id;
            let orderTotal = req.body.orderTotal;
            let walletAmount = await walletCollection.findOne({ userid }, { balance: 1 });
            console.log(walletAmount,'kiki3');
            if(walletAmount>=orderTotal){

            }
        }
    } catch (error) {
        console.log(error,'Error in Wallet Post');
    }
};

