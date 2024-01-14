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



exports.loginGet = (req, res) => {
    const errorMessage = req.session.error || '';
    req.session.error = '';
    const userData = req.session.user

    if (req.session.user) {
        if (user)
            res.render('user/home', userData)
    } else {
        res.render('user/login', { userData, error: errorMessage })
    }
};


exports.otpGet = (req, res) => {
    const userData = req.session.user
    const errorMessage = req.session.error || '';
    req.session.error = '';

    res.render('user/otp', { error: errorMessage, userData })
}

exports.forgotpasswordGet = (req, res) => {

    res.render('user/forgotpassword')
};

exports.forgotpasswordPost = async (req, res) => {
    try {
        let email = req.body.email;
        req.session.email = email
        if (email) {
            const user = await logDetails.findOne({ email: email });

            if (user) {
                return res.render('user/changepassword');
            }
        }

    } catch (error) {
        console.error("Error:", error);
        // Handle the error appropriately
        // ...
    }
}

exports.updatepassword = async (req, res) => {
    let newpassword = req.body.password;
    let email = req.session.email
    console.log(email);
    if (newpassword) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newpassword, 10);

        // Update the user's password if the user exists
        if (email) {
            const updatedUser = await logDetails.findOneAndUpdate(
                { email: email },
                { $set: { password: hashedPassword } },
                { new: true }
            );

            if (updatedUser) {
                console.log("User's password updated:", updatedUser);
                res.redirect('/login');
            } else {
                res.redirect("/updatepassword")
                console.log("User not found");

            }
        } else {
            res.redirect("/updatepassword")
            console.log("User not found");

        }
    }
}


exports.verificationGet = (req, res) => {
    const userData = req.session.user
    res.render('user/otpsuccess', { userData })
}

exports.emptycartGet = (req, res) => {
    const userData = req.session.user

    res.render('user/emptycart', { userData });
}

exports.signupGet = (req, res) => {

    const errorMessage = req.session.error || '';
    req.session.error = '';
    const userData = req.session.user
    if (req.session.userId) {
        return res.redirect('/home', { userData })
    } else {
        res.render('user/signup', { error: errorMessage, userData })
    }
};

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
}


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

exports.checkoutpageGet = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const userData = req.session.user

        const userId = req.session.user._id;
        const checkoutPage = await cartCollection.findOne({ userId });
        const checkoutProducts = await productCollection.find();
        const addresses = await logDetails.findById(userId).populate('addressCollection');
        const checkoutItems = [];
        let checkoutQuantity = [];
        checkoutPage.products.forEach((product) => {
            checkoutQuantity.push(product.quantity);
        })
        checkoutPage.products.forEach(product => {
            checkoutItems.push(...checkoutProducts.filter(element => element._id.equals(product.product)))
        });
        res.render('user/checkoutpage', { checkoutPage, checkoutItems, checkoutQuantity, addresses, userData });

    } catch (error) {
        console.log("Error in checkoutGet:", error);
        return res.status(500).render('error', { message: 'Internal Server Error' });
    }
}

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
},
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
            console.log(updatingCancelledProduct);

            res.status(200).send('Order is canceled');
        } catch (error) {
            console.log(error);
        }
    },

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
                { $inc: { quantity: productQuantity } }, //update the quantity
                { new: true }
            );
            console.log(updatingReturnedProduct, 'lalslalsdasdad');
            res.status(200).send('Order is returned');
        } catch (error) {
            console.log(error);

        }
    }

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
}



exports.logoutGet = (req, res) => {
    try {
        if (req.session.user) {

            req.session.destroy((err) => {
                if (err) {
                    console.error('Error', err);
                }
                console.log("session destroyed sucessfully");
                res.redirect('/login');
            });

        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error("logoutuser error" + "=" + error);
    }
}


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

exports.orderplacedGet = (req, res) => {
    const userData = req.session.user;

    res.render('user/orderplaced', { userData });
}


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


let otp;

// Post Methods   

exports.loginPost = async (req, res) => {

    try {
        const user = await logDetails.findOne({ email: req.body.email });
        if (user) {
            const passwordMatch = await bcrypt.compare(req.body.password, user.password);
            if (passwordMatch) {

                req.session.user = user;  //creating session with name user

                res.redirect('/home')
            } else {
                req.session.error = 'Invalid password';
                res.redirect('/login');
            }
        } else {
            req.session.error = 'Invalid email';
            res.redirect('/login');
        }
    } catch (error) {
        console.log("LOGIN POST ERROR:", error)
    }
};

exports.signupPost = async (req, res) => {

    try {

        const signupdata = new logDetails({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })

        const existingUser = await logDetails.findOne({ email: signupdata.email })



        if (existingUser) {
            req.session.error = "Email Already Exist"
            req.session.invalid = true
            return res.redirect('/signup')
        } else {
            otp = generateotp()
            console.log(otp);
            const emailText = `  Hi this is from Woodsthetics
         Your OTP is: ${otp}`;
            const mailOptions = {
                from: 'ashikms1998@gmail.com',
                to: signupdata.email,
                subject: 'OTP Verification',
                text: emailText,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending OTP:', error);
                } else {
                    console.log('OTP sent:', info.response);
                    res.redirect('/otp')
                }
            });
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(signupdata.password, saltRounds);
            signupdata.password = hashedPassword;
            console.log(hashedPassword);
            await signupdata.save()
            req.session.signupdata = signupdata;
            console.log(signupdata);
            return res.redirect('/otp')
        }
    }
    catch (error) {
        console.log("User signupPost Error:", error);
    }
};



const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail', 'SMTP'
    auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_PASSWORD,
    },
});
let expiration_time;
const generateotp = () => {
    const now = new Date();
    expiration_time = new Date(now.getTime() + 1 * 60000)
    return (Math.floor(1000 + Math.random() * 9000)).toString();

};


exports.otpPost = async (req, res) => {
    const { digit1 } = req.body;
    const { digit2 } = req.body;
    const { digit3 } = req.body;
    const { digit4 } = req.body;
    const userEnteredOTP = digit1 + digit2 + digit3 + digit4;

    console.log(userEnteredOTP, "otp chEk", otp);
    if (userEnteredOTP === otp && new Date() <= expiration_time) {
        // await UserCollection.insertMany(data);
        console.log("User registered successfully!!");
        res.render('User/otpsuccess')
    } else {
        req.session.error = "Invalid OTP. Please try again.";
        res.redirect("/otp")
    }

};

exports.resendGet = async (req, res) => {
    console.log("hai");
    const user = req.session.signupdata
    console.log('1', user);
    const userDetails = await logDetails.findOne({ email: user.email });
    console.log("here vro", userDetails);
    if (user) {
        otp = generateotp()
        console.log(otp);
        const emailText = `  Hi this is from Woodsthetics
         Your OTP is: ${otp}`;
        const mailOptions = {
            from: 'ashikms1998@gmail.com',
            to: userDetails.email,
            subject: 'OTP Verification',
            text: emailText,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending OTP:', error);
            } else {
                console.log('OTP sent:', info.response);
                res.redirect('/otp')
            }
        });
        // const saltRounds = 10;
        // const hashedPassword = await bcrypt.hash(userDetails.password, saltRounds);
        // userDetails.password = hashedPassword;
        // console.log(hashedPassword);
        // await userDetails.save()
        // console.log(userDetails);
        return res.redirect('/otp')
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


exports.confirmationPost = async (req, res) => {
    try {
        console.log("hehe");
        const address = req.body.orderDetails.selectedAddressData;
        const userId = req.session.user._id
        const Ordernumber = orderGenerator()

        const cartDetails = await cartCollection.findOne({userId: userId});
        // console.log(cartDetails);
        const productdetails = cartDetails.products;
        productdetails.forEach(async(ele)=>{
            await productCollection.findOneAndUpdate(
                { _id: ele.product },
                { $inc: { quantity: -ele.quantity } }, //update the quantity
                { new: true }
            )
        });

        const prices = await Promise.all(productdetails.map(async (ele) => {
            const product = await productCollection.findById(ele.product);
            const qty = ele.quantity;
            const price = product.price * qty;
            return price;
          }));
          
          const totalPrice = prices.reduce((acc, price) => acc + price, 0);
        
          console.log(productdetails);
        const allOrder = new orderCollection({
            userId: userId,
            productdetails: productdetails,
            Ordernumber: Ordernumber,
            total: totalPrice,
            address: address
        })

        await allOrder.save()
        await cartCollection.deleteOne({userId:userId});
        res.status(200).json({ message: 'Order Placed' })
    } catch (error) {
        console.log('error in confirmationPost', error);
    }
}



function orderGenerator() {
    return "ORD" + Date.now()
}



exports.filterCategoryGet = async (req, res) => {
    const categoryFilter = await categoryCollection.find()
    console.log(categoryFilter);
}

exports.orderPageGet = async (req, res) => {
    try {
    const userId = req.session.user._id;
    const user = await logDetails.findOne({ _id: userId });
    const orderId = req.params.id;
    const userData = req.session.user
    const order = await orderCollection.findOne({_id: orderId });
    if(!user){
        return res.redirect('/notfound');
    }
    if(!order){
        return res.redirect('/notfound');
    }
    let products = [];
    console.log(order.productdetails,"asfjkhbsjdf");
    for(const prod of order.productdetails){
        try {
            const item = await productCollection.findById(prod.product)
            if(item){
                
                const productExists = products.some(product=>product._id.toString()===item._id.toString());

                if(!productExists){
                    products.push(item);
                } else{
                    console.log(`Product not found for ID: ${prod.product._id}`);
                }
            }
        } catch (error) {
            console.log("Error fetching product:", error);
        }
    }
    console.log(products);
    res.render('user/orderPage',{order,products,user,userData})

    } catch (error) {
        console.log("Error in the order Page",error);
    }

    
}

