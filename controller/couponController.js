const { send } = require('process');
const { categoryCollection } = require('../model/categoryDB');
const {couponCollection} = require('../model/couponDB');
const { offerCollection } = require('../model/offerDB');
const { productCollection } = require('../model/productDB');

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
    
    const couponid = req.params._id
    
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

exports.offerGet = async(req,res)=>{
    allProducts = await productCollection.find();
    allCategory = await categoryCollection.find();
    allOffers = await offerCollection.find();
    res.render('admin/offermanagement',{allProducts,allCategory,allOffers})
};

exports.addofferGet = async (req,res)=>{
    try {
        let allProducts = await productCollection.find()
        let allCategory = await categoryCollection.find()

        res.render('admin/addoffer',{allProducts,allCategory}) 
    } catch (error) {
        console.log('Error in addoffer Get',error);
    }   
};


exports.addofferPost = async(req,res)=>{
    try {
        let allProducts = await productCollection.find();
        let allCategory = await categoryCollection.find();
        let addBy = req.body.addBy;
        let newoffer;

        if(addBy == 'product'){
            const existingProduct = await offerCollection.findOne({productName:req.body.product})
            
            if(existingProduct){
                return res.render('admin/addoffer',{ allProducts, allCategory, msg: "Offer already added" })
            }else{
                newoffer = new offerCollection({
                    productName:req.body.product,
                    discount:req.body.discount,
                    count: req.body.count,
                    expiryDate:req.body.expiryDate
                })
            }
        }else if(addBy == 'category'){
            const existingCategory = await offerCollection.findOne({categoryName: req.body.category});
            if(existingCategory){
                return res.render('admin/addoffer', { allProducts, allCategory, msg: "Offer already added" })
            }else{
                newoffer = new offerCollection({
                    categoryName:req.body.category,
                    discount:req.body.discount,
                    count: req.body.count,
                    expiryDate:req.body.expiryDate
                })
            }
        }
        await newoffer.save();
        res.redirect('/offermanagement')
    } catch (error) {
        console.log('Error in the Add offer Post',error);
    }
};

exports.editofferGet =async (req,res)=>{
    try {

    const offerid = req.params._id
    const selectedOffer = await offerCollection.findById(offerid)
    res.render('admin/editoffer',{selectedOffer})

    } catch (error) {
    console.log(error);
    }
}

exports.editofferPost = async(req,res)=>{
    try {
        const offerid = req.params._id;
        
        const updateoffer = await offerCollection.findByIdAndUpdate(offerid,{
                discount: req.body.discount,
                count: req.body.count,
                expiryDate: req.body.expiryDate
        })
        res.redirect('/offermanagement')
    } catch (error) {
        console.log('Error in edit coupon post',error);
    }
};

exports.unlistofferPost = async(req,res)=>{
    try {
        const offerid = req.body.btnid;
        
        const offer = await offerCollection.findById(offerid);
        
        if(!offer){
            return res.status(404).send('Offer not found');
        }
        offer.enable = !offer.enable;
        await offer.save();
        return res.status(200).send({ offer });

    } catch (error) {

        console.log('Error in Unlist offer post',error);
    }
};
