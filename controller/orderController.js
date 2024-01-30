const { logDetails } = require('../model/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer")
const multer = require("multer");
const Razorpay = require("razorpay")
const { productCollection } = require('../model/productDB');
const { cartCollection } = require('../model/cartDB');
const { addressCollection } = require('../model/addressDB')
const { log, error } = require('console');
const { orderCollection } = require('../model/orderDB');
const { response } = require('express');
const { categoryCollection } = require('../model/categoryDB');

var instance = new Razorpay({
    key_id: 'rzp_test_yeL2dUJ4nZYpET',
    key_secret: 'CnCY5mqo5tDp947MvrThiIAH',
});



exports.confirmationPost = async (req, res) => {
    console.log("cartDetails");

    try {
        const address = req.body.orderDetails.selectedAddressData;
        const userId = req.session.user._id
        const Ordernumber = orderGenerator()
        let totalPrice;
        
        const cartDetails = await cartCollection.findOne({ userId: userId });
        const productdetails = cartDetails.products;
        productdetails.forEach(async (ele) => {
            await productCollection.findOneAndUpdate(
                { _id: ele.product },
                { $inc: { quantity: -ele.quantity } }, //update the quantity
                { new: true }
            )
        });
        if (cartDetails.couponApplied) {
            totalPrice = cartDetails.totalprice
        }else{

        const prices = await Promise.all(productdetails.map(async (ele) => {
            const product = await productCollection.findById(ele.product);
            const qty = ele.quantity;
            const price = product.price * qty;
            return price;
        }));

        totalPrice = prices.reduce((acc, price) => acc + price, 0);
        }
        
        
        const allOrder = new orderCollection({
            userId: userId,
            productdetails: productdetails,
            Ordernumber: Ordernumber,
            total: totalPrice,
            address: address
        })

        await allOrder.save()
        await cartCollection.deleteOne({ userId: userId });
        res.status(200).json({ message: 'Order Placed' })
    } catch (error) {
        console.log('error in confirmationPost', error);
    }
};

function orderGenerator() {
    return "ORD" + Date.now()
};


exports.checkoutpageGet = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const userData = req.session.user

        const userId = req.session.user._id;
        const checkoutPage = await cartCollection.findOne({ userId });
        const checkoutProducts = await productCollection.aggregate([ 

            {
                $lookup: {
                    from: 'offercollections',
                    localField: 'productname',
                    foreignField: 'productName',
                    as: 'productOffer'
                }
            },
            {
                $lookup: {
                    from: 'offercollections',
                    localField: 'category',
                    foreignField: 'categoryName',
                    as: 'categoryOffer'
                }
            }
        ]);

        console.log(checkoutProducts,'ahjsdjahsd');
       
        const addresses = await logDetails.findById(userId).populate('addressCollection');
        const checkoutItems = [];
        let checkoutQuantity = [];
        checkoutPage.products.forEach((product) => {
            checkoutQuantity.push(product.quantity);
        })
        checkoutPage.products.forEach(product => {
            checkoutItems.push(...checkoutProducts.filter(element => element._id.equals(product.product)))
        });
        console.log(checkoutItems,'askkaskdkad');
        res.render('user/checkoutpage', { checkoutPage, checkoutItems, checkoutQuantity, addresses, userData });

    } catch (error) {
        console.log("Error in checkoutGet:", error);
        return res.status(500).render('error', { message: 'Internal Server Error' });
    }
};


exports.cancelOrderPost = async (req, res) => {
    try {

        const oId = req.body.oId
        // const status = req.body.status
        const product = await orderCollection.findById(oId);
        const productId = product.productdetails[0].productId;
        const productQuantity = product.productdetails[0].quantity;

        const update = await orderCollection.findOneAndUpdate(
            { _id: oId },
            { $set: { status: "cancelled" } },
            { new: true }
        );

        const updatingCancelledProduct = await productCollection.findOneAndUpdate(

            { _id: productId },
            { $inc: { quantity: productQuantity } }, //update the quantity
            { new: true }
        );
   

        res.status(200).send('Order is canceled');
    } catch (error) {
        console.log(error);
    }
};


exports.orderPageGet = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await logDetails.findOne({ _id: userId });
        const orderId = req.params.id;
        const userData = req.session.user
        const order = await orderCollection.findOne({ _id: orderId });
        if (!user) {
            return res.redirect('/notfound');
        }
        if (!order) {
            return res.redirect('/notfound');
        }
        let products = [];
        
        for (const prod of order.productdetails) {
            try {
                const item = await productCollection.findById(prod.product)
                if (item) {

                    const productExists = products.some(product => product._id.toString() === item._id.toString());

                    if (!productExists) {
                        products.push(item);
                    } else {
                        console.log(`Product not found for ID: ${prod.product._id}`);
                    }
                }
            } catch (error) {
                console.log("Error fetching product:", error);
            }
        }
        
        res.render('user/orderPage', { order, products, user, userData })

    } catch (error) {
        console.log("Error in the order Page", error);
    }


};

exports.orderplacedGet = (req, res) => {
    const userData = req.session.user;

    res.render('user/orderplaced', { userData });
};


exports.returnOrderPost = async (req, res) => {
    try {
        const oId = req.body.oId
        const product = await orderCollection.findById(oId);
        const productId = product.productdetails[0].productId;
        const productQuantity = product.productdetails[0].quantity;

        const update = await orderCollection.findOneAndUpdate(
            { _id: oId },
            { $set: { status: "Returned" } },
            { new: true }
        );

        const updatingReturnedProduct = await productCollection.findOneAndUpdate(

            { _id: productId },
            { $inc: { quantity: productQuantity } },
            { new: true } //update the quantity
        
        );
       
        res.status(200).send('Order is returned');
    } catch (error) {
        console.log(error);

    }
};

exports.razorpayPost = async (req, res) => {
   
    try {
        
        let orderTotal = req.body.orderTotal;
        const Razorpay = require('razorpay');
        var instance = new Razorpay({ key_id: 'rzp_test_yeL2dUJ4nZYpET', key_secret: 'CnCY5mqo5tDp947MvrThiIAH' })
        const cartDetails = await cartCollection.findOne({ userId: req.session.user._id });
       
        const productdetails = cartDetails.products;
        productdetails.forEach(async (ele) => {
            await productCollection.findOneAndUpdate(
                { _id: ele.product },
                { $inc: { quantity: -ele.quantity } }, //update the quantity
                { new: true }
            )
        });

        // const prices = await Promise.all(productdetails.map(async (ele) => {
        //     const product = await productCollection.findById(ele.product);
        //     const qty = ele.quantity;
        //     const price = product.price * qty;
        //     return price;
        // }));

        // const totalPrice = prices.reduce((acc, price) => acc + price, 0);
        const totalPrice = orderTotal;
        console.log(totalPrice);
        var options = {
        amount:totalPrice*100 ,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
        };
        instance.orders.create(options, function (err, order) {
        return res.json(order);
        });

    } catch (error) {
        console.log('Error in Razorpay Post:', error);
    }
};