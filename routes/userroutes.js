const express = require('express');
const router = express.Router();
const session = require("../middleware/usersession")
const  isblock = require("../middleware/userauth");

const {updatecartPost, loginGet, signupGet, homeGet, productsGet,loginPost, otpGet, otpPost, signupPost, verificationGet, singleproductGet, logoutGet, resendGet, cartGet,cartPost,wishlistGet,emptycartGet,deletecartproductPost,checkoutpageGet,userprofilePost,userprofileGet,confirmationPost,orderplacedGet,cancelOrderPost,edituserPost,editaddressPost,deleteaddressPost,forgotpasswordGet,forgotpasswordPost,updatepassword,returnOrderPost,orderPageGet } = require('../controller/userController');


router.get('/login', loginGet)
router.get('/otp', otpGet)
router.get('/signup', signupGet);
router.get('/home', homeGet);
router.get('/otpsuccess', verificationGet);
router.all('/products', productsGet);
router.get('/logout', logoutGet);
router.get('/singleproduct/:id', singleproductGet);
router.get('/wishlist', session,isblock,wishlistGet);
router.get('/checkoutpage', session,isblock,checkoutpageGet);
router.get('/userprofile',isblock,userprofileGet);
router.get('/forgotpassword',forgotpasswordGet);
router.get('/resendotp', resendGet);
router.get('/cart', session,isblock, cartGet);
router.get('/orderplaced', session,isblock,orderplacedGet)
router.post('/cart', cartPost);
router.post('/userprofile',userprofilePost);
router.get('/emptycart', session,isblock,emptycartGet);
router.get('/orderPage/:id',orderPageGet)
router.post('/',isblock, loginPost);
router.post('/updateCart' ,updatecartPost);
router.post('/signup', signupPost);
router.post('/otp', otpPost);
router.post('/deletecartproduct',deletecartproductPost);
router.post('/confirmation',confirmationPost)
router.post('/cancelOrder',cancelOrderPost)
router.post('/edituser/:id', edituserPost);
router.post('/editaddress/:id',editaddressPost);
router.post('/deleteaddress/:id',deleteaddressPost);
router.post('/forgotpassword',forgotpasswordPost);
router.post('/updatepassword',updatepassword);
router.get('/',(req,res)=>res.redirect('/home'))
router.post('/returnOrder',returnOrderPost)

module.exports = router;