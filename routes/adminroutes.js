const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path');
const adminsession = require('../middleware/session');



// MULTER//

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/upload"); // Specifying the destination folder for uploaded images

  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename
  },
});

//settingupmiddleware for multer

const upload = multer({ storage: storage });

//   const fileFilter = (req ,file, cb)=>{
//     if(allowedFileTypes.includes(file.mimetype)){
//       cb(null,true);
//     }else{
//       cb(new Error('Only JPG andPNG images are allowd'),false);
//     }
//   };





// const multerB = require('multer');

const { loginGet, loginPost, logoutadmin, userGet, categoryGet, addcategoryPost, productmanagementGet, addproductGet, productadd, blockUser, editproductGet, editproductPost, homeGet, editcategoryGet, editcategoryPost, deleteproductGet, orderGet, updateStatusPost, blockProductPost, blockedCategoryPost, salesreportGet,admindash ,admindashboardGetWeekly,thirtyDayChart,dailyChart} = require('../controller/adminController');

// Coupon Controller

const {couponGet,addcouponGet,addcouponPost,deletecouponPost,editcouponGet,editcouponPost} = require('../controller/couponController')


router.get('/adminhome', adminsession, homeGet);
router.get('/usermanagemnt', adminsession, userGet);
router.get('/categorymanagement', adminsession, categoryGet);
router.get('/productmanagement', adminsession, productmanagementGet);
router.get('/addproduct', adminsession, addproductGet);
router.get('/adminloginget', loginGet);
router.get('/editproduct/:_id', adminsession, editproductGet);
router.get('/editcategory/:_id', adminsession, editcategoryGet);
router.get('/blockStatus', adminsession, blockUser)
router.get('/ordermanagement', adminsession, orderGet)
router.get('/salesreport',adminsession,salesreportGet)
router.get('/admindashboard',adminsession,admindash)
router.get('/admindashboard/Weeklyreport',adminsession,admindashboardGetWeekly)
router.get('/admindashboard/Monthlyreport',adminsession,thirtyDayChart)
router.get('/admindashboard/dailyreport',adminsession,dailyChart)
router.get('/couponmanagement',adminsession,couponGet)
router.get('/addcoupon',adminsession,addcouponGet);
router.post('/deletecoupon/:_id', adminsession, deletecouponPost)
router.get('/editcoupon/:_id', adminsession, editcouponGet);
router.post('/editcoupon/:_id', adminsession, editcouponPost);

// post

router.post('/adminlogin', loginPost);
router.get('/adminlogout', logoutadmin);
router.post('/addCategory', adminsession, addcategoryPost);
router.post('/blockStatus', adminsession, blockUser)
router.post('/productadd', adminsession, upload.array('image', 4), productadd);
router.post('/editproduct/:_id', adminsession, upload.array('image'), editproductPost);
router.post('/editcategory/:_id', adminsession, editcategoryPost);
router.post('/deleteproduct/:_id', adminsession, deleteproductGet)
router.post('/updateStatus', adminsession, updateStatusPost);
router.post('/unlistProduct', adminsession, blockProductPost)
router.post('/unlistCategory', adminsession, blockedCategoryPost)
router.post('/addcoupon',adminsession,addcouponPost)
module.exports = router;