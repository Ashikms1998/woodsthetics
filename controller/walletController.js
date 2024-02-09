const {walletCollection} = require('../model/walletDB');
const { logDetails } = require('../model/userModel');

exports.walletGet = async(req,res)=>{
    try {
        const userData = req.session.user;
        const userId = req.session.user._id
        const walletData = await walletCollection.find({userid:userId})
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
            let orderTotal = Number(req.body.orderTotal);
            
            const walletCheck = await walletCollection.find({userid:userid});
            if(!walletCheck)
            {
                return res.status(404).send({ message: "Wallet not found." });
            }else{
            let walletAmount = await walletCollection.findOne({ userid }, { balance: 1 });
            
            if(walletAmount.balance>=orderTotal)
            {
                
                await walletCollection.findOneAndUpdate(
                    {userid:userid},
                    {$inc:{balance:-orderTotal}},
                    {new:true,upsert:true}
                );
                await walletCollection.findOneAndUpdate(
                    {userid:userid},
                    {
                        $push:{
                            wallethistory:{
                                process:"Debited for wallet payment",
                                amount:orderTotal,
                                date:Date.now(),
                            }
                        }
                    },
                    {new:true}
                );
            // Send a success response
            return res.status(200).send({ message: "Sufficient balance." });
            } else {
            // Send an error response
            return res.status(400).send({ message: "Insufficient balance." });
            }
        }
    }
    } catch (error) {
        console.log(error,'Error in Wallet Post');
        return res.status(500).send("Error while processing wallet payment");

    }
};

