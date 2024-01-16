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


exports.homeGet = async (req, res) => {
    const userData = req.session.user
    res.render('user/home', { userData });

};

exports.productsGet = async (req, res) => {
    try {
        //pagination here
        const productsPerPage = 9;
        const currentPage = parseInt(req.query.page) || 1;

        const totalProducts = await productCollection.countDocuments({ blocked: false });
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        const skip = (currentPage - 1) * productsPerPage;

        //pagination end here
        const userData = req.session.user
        const categoryFilter = await categoryCollection.find({ blockStatus: false })

        const totalProd = await productCollection.find({ blocked: false })
        // console.log(totalProd,'ithan ivida scene ondakkana');
        let categoryA = req.body.selectOption;
        let productData

        if (categoryA) {
            productData = await productCollection.find({ category: categoryA, blocked: false }).skip(skip).limit(productsPerPage);

        } else {
            productData = await productCollection.find({ blocked: false }).skip(skip).limit(productsPerPage);

        }

        return res.render("user/products", { productData, userData, categoryFilter, currentPage: currentPage, totalPages: totalPages })
    } catch (error) {
        console.log(error);
    }
};

exports.wishlistGet = (req, res) => {
    const userData = req.session.user

    res.render('user/wishlist', { userData });
};
   

exports.edituserPost = async (req, res) => {
    try {
        userid = req.params.id;

        const updateUser = await logDetails.findByIdAndUpdate(userid, {
            name: req.body.name
        }, { new: true })

        res.redirect('/userprofile');

    } catch (error) {
        console.log('Error in edituserPost', error);
    }
};



exports.editaddressPost = async (req, res) => {
    try {
        const addressid = req.params.id;
        console.log(addressid);
        const updateAddress = await addressCollection.findByIdAndUpdate(addressid, {
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            postalcode: req.body.postalcode,
            country: req.body.country
        }, { new: true })

        res.redirect('/userprofile');

    } catch (error) {

        console.log('Edit Address post error', error);
    }
};



exports.deleteaddressPost = async (req, res) => {
    try {
        const addressid = req.params.id;
        console.log('forDelete', addressid);
        const deleteAddress = await addressCollection.findByIdAndDelete(addressid)

        res.redirect('/userprofile');
    } catch (error) {
        console.log(error);
    }
};


exports.singleproductGet = async (req, res) => {
    try {
        const userData = req.session.user

        const productid = req.params.id;
        const productDetails = await productCollection.findById(productid);
        if (!productDetails) {
            return res.status(404).send('Product not found');
        }

        res.render('user/singleproduct', { productDetails, userData })

    } catch (error) {
        console.log(error);
    }

};


exports.userprofileGet = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const userId = req.session.user._id;

        const orderDetails = await orderCollection.find({ userId: userId })

        addressData = await addressCollection.find();

        const productData = await productCollection.find()
        const userData = req.session.user

        const user = await logDetails.findById(userId).populate('addressCollection');

        res.render('user/userprofile', { user: user, orderDetails: orderDetails, addressData: addressData, productData: productData, userData })

    } catch (error) {
        console.log('Error in userprofileGet', error);
    }

};


exports.userprofilePost = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const { address, city, state, country } = req.body;
        let { postalcode } = req.body;
        postalcode = Number(postalcode);

        let numberString = postalcode.toString();

        // Split the string into an array of characters
        let digitArray = numberString.split('');
        let numberArray = digitArray.map(function (digit) {
            return parseInt(digit, 10);
        });

        if (numberArray.length < 6) {



            return res.redirect('back')
        }


        const newAddress = new addressCollection({

            address: address,
            city: city,
            state: state,
            postalcode: postalcode,
            country: country

        });
        await newAddress.save();
        const userId = req.session.user._id;
        const user = await logDetails.findById(userId);
        user.addressCollection.push(newAddress);
        await user.save();
        res.redirect('/userprofile')

    } catch (error) {
        console.log('Error in userprofilePost', error);
    }

};


exports.filterCategoryGet = async (req, res) => {
    const categoryFilter = await categoryCollection.find()
    console.log(categoryFilter);
};