const { logDetails } = require('../model/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer")
const multer = require("multer");
const { productCollection } = require('../model/productDB');
const { cartCollection } = require('../model/cartDB');
const { addressCollection } = require('../model/addressDB')
const { log, error } = require('console');
const { orderCollection } = require('../model/orderDB');
const { response } = require('express'); 
const { categoryCollection } = require('../model/categoryDB');
const { couponCollection } = require('../model/couponDB');




exports.cartGet = async (req, res) => {

    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const userId = req.session.user._id
        const a = await cartCollection.findOne({ userId });
        createCart = a ?? ''
        const allProducts = await productCollection.find()
        let products = []

        const userData = req.session.user

        // console.log('koooooooo',createCart.products.length);
        if (!createCart) {

            return res.render('user/emptycart', { userData });

        } else {
            createCart.products.forEach(product => {
                products.push(...allProducts.filter(ele => ele._id.equals(product.product)))//each set.athinte akathe product from db
            });

            return res.render('user/cart', { createCart, products, userData })

        }


    } catch (error) {
        console.log("Error in cartGet:", error);
        return res.status(500).render('error', { message: 'Internal Server Error' });
    }
};


exports.cartPost = async (req, res) => {
    const productid = req.body.productId
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }
        const userId = req.session.user._id;

        const createCart = await cartCollection.findOne({ userId });

        if (createCart) {
            const productDetails = createCart.products;
            const productIndex = productDetails.findIndex((value) => {
                return value.product.equals(productid);
            });
            if (productIndex !== -1) {
                productDetails[productIndex].quantity += 1;
                await createCart.save();
            } else {
                productDetails.push({
                    product: productid,
                    quantity: 1
                });

                await createCart.save();
            }
        } else {
            const newCart = cartCollection({
                userId,
                products: [{
                    product: productid,
                    quantity: 1
                }]
            });
            await newCart.save();
        }
        return res.redirect("/cart")

    } catch (error) {
        console.log("Error in cartPost:", error);
        return res.status(500).render('error', { message: 'Internal Server Error' });
    }
};


exports.updatecartPost = async (req, res) => {
    try {
        const pId = req.body.itemId;
        console.log(req.body.itemId);
        const userId = req.session.user._id;
        console.log(userId, "uid here");
        const quantity = req.body.amount;
        console.log(quantity, "quantity here");

        const product = await productCollection.findById(pId)
        if (product.quantity < quantity) {
            console.log("Out of stock");
            return res.status(404).send()
        }

        const updatingCart = await cartCollection.findOneAndUpdate(
            {
                userId: userId,
                'products.product': pId,
            },
            {
                $set: {
                    'products.$.quantity': quantity,
                }
            },
            { new: true }
        );
        console.log("working");
        return res.status(200).json({ message: "success" })

    } catch (error) {
        console.log("Error in updateCartPost", error);
    }
};


exports.deletecartproductPost = async (req, res) => {
    const productid = req.body.productId
    console.log('here it is', productid);
    try {
        let deletecart = await cartCollection.findOne({ userId: req.session.user._id })
        deletecart.products = deletecart.products.filter((prod) => !prod._id.equals(productid))
        console.log('cartproduct', deletecart);
        await deletecart.save()
        res.json({ success: true });
    } catch (error) {
        console.log('error in deletecartproductPost', error);
    }
};



exports.emptycartGet = (req, res) => {
    const userData = req.session.user

    res.render('user/emptycart', { userData });
};

exports.applypromoPost = async (req,res)=>{
    try {
    let code = req.body.code
    let total = req.body.total
    const coupon = await couponCollection.findOne({couponCode:code})
    if(!coupon){
        return res.send({error:'Invalid Code'})
    }
    if(total>coupon.minimumPurchase){
        return res.send({type:coupon.discountType,value:coupon.discountValue,id: coupon._id})
    }else{
        return res.send({error:`Minimum purchase value is ${coupon.minimumPurchase}`})
    }

    }catch(error){
        console.log('Error in Apply Promo',error);
    }
}