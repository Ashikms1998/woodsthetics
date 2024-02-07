const express = require('express');
const router = express.Router();
const session = require("../middleware/usersession")
const  isblock = require("../middleware/userauth");

//User Controller

const {homeGet, productsGet, singleproductGet,wishlistGet,userprofilePost,userprofileGet,edituserPost,editaddressPost,deleteaddressPost } = require('../controller/userController');

//Login Controller
const{loginGet,loginPost,otpGet,otpPost,resendGet,signupGet,signupPost,verificationGet,forgotpasswordGet,forgotpasswordPost,updatepassword,logoutGet}=require('../controller/loginController')

//Cart Controller
const{cartGet,emptycartGet,cartPost,updatecartPost,deletecartproductPost,applypromoPost} = require('../controller/cartController')

//Order Controller
const{orderPageGet,confirmationPost,checkoutpageGet,cancelOrderPost,orderplacedGet,returnOrderPost,razorpayPost} = require('../controller/orderController')

//Wallet Controller
const{walletGet,walletPost} = require('../controller/walletController');


//Login Controller Routes

router.get('/login', loginGet)
router.post('/',isblock, loginPost);
router.get('/otp', otpGet)
router.post('/otp', otpPost);
router.get('/resendotp', resendGet);
router.get('/signup', signupGet);
router.post('/signup', signupPost);
router.get('/otpsuccess', verificationGet);
router.get('/forgotpassword',forgotpasswordGet);
router.post('/forgotpassword',forgotpasswordPost);
router.post('/updatepassword',updatepassword);
router.get('/logout', logoutGet);


// Cart Controller

router.get('/cart', session,isblock, cartGet);
router.post('/cart', cartPost);
router.get('/emptycart', session,isblock,emptycartGet);
router.post('/updateCart' ,updatecartPost);
router.post('/deletecartproduct',deletecartproductPost);
router.post('/applyPromo',applypromoPost)


//Order Controller

router.get('/orderPage/:id',orderPageGet)
router.post('/confirmation',confirmationPost)
router.get('/checkoutpage', session,isblock,checkoutpageGet);
router.post('/cancelOrder',cancelOrderPost)
router.get('/orderplaced', session,isblock,orderplacedGet)
router.post('/returnOrder',returnOrderPost)
router.post('/razorpay',razorpayPost);

//User Controller Routes

router.get('/home', homeGet);
router.all('/products', productsGet);
router.get('/singleproduct/:id', singleproductGet);
router.get('/wishlist', session,isblock,wishlistGet);
router.get('/userprofile',isblock,userprofileGet);
router.post('/userprofile',userprofilePost);
router.post('/edituser/:id', edituserPost);
router.post('/editaddress/:id',editaddressPost);
router.post('/deleteaddress/:id',deleteaddressPost);
router.get('/',(req,res)=>res.redirect('/home'))

//wallet Controller Routes

router.get('/wallet',session,walletGet)
router.post('/wallet',session,walletPost)

module.exports = router;