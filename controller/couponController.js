const {couponCollection} = require('../model/couponDB');

exports.couponGet = async (req,res)=>{
    try {
        const coupondata = await couponCollection.find()
        res.render('admin/coupon',{coupondata});
    } catch (error) {
        console.log('Error in Coupon Get:',error);
    }
};


exports.addcouponGet = (req,res)=>{
    try {
        return res.render('admin/addcoupon')
    } catch (error) {
        console.log('Error in add coupon',error);
    }
};

exports.addcouponPost =async (req,res)=>{
    try {
        console.log('hai from coupon post');
        const newcoupon = new couponCollection({
            couponName: req.body.couponname,
            couponCode: req.body.couponcode,
            discountType: req.body.discounttype,
            discountValue: req.body.discountvalue,
            minimumPurchase: req.body.minimumpurchase,
            startDate: req.body.startdate,
            endDate: req.body.enddate
        })
        await newcoupon.save()
        res.redirect('/couponmanagement')
    } catch (error) {
        console.log('Error in add coupon',error);
    }
};

exports.deletecouponPost = async (req,res)=>{
    console.log("hellow from deleye");
    const couponid = req.params._id
    console.log('for delete',couponid);
    try {
        
        const deleteProduct = await couponCollection.findByIdAndDelete(couponid)
        if(!deleteProduct){
            return res.status(404).send("coupon not found");
        }
        res.redirect('/couponmanagement')
    } catch (error) {
        console.log('Error in delete coupon',error);
    }
};

exports.editcouponGet = async (req,res)=>{
    const couponid = req.params._id
    const coupon = await couponCollection.findById(couponid)
    res.render('admin/editcoupon',{coupon})
};

exports.editcouponPost = async (req,res)=>{
    const couponid = req.params._id
    const updatecoupon = await couponCollection.findByIdAndUpdate(couponid,{
        couponName:req.body.couponname,
        couponCode:req.body.couponcode,
        discountType:req.body.discounttype,
        discountValue:req.body.discountvalue,
        minimumPurchase:req.body.minimumpurchase,
        startDate:req.body.startDate,
        endDate:req.body.enddate
    })

    res.redirect('/couponmanagement')
};