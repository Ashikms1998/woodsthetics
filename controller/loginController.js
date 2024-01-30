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

exports.otpGet = (req, res) => {
    const userData = req.session.user
    const errorMessage = req.session.error || '';
    req.session.error = '';

    res.render('user/otp', { error: errorMessage, userData })
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
        if (req.session.changeOTP) {
            req.session.changeOTP = false
            return res.render('user/changepassword');
        } else {

            console.log("User registered successfully!!");
            res.render('User/otpsuccess')

        }
    } else {
        req.session.error = "Invalid OTP. Please try again.";
        res.redirect("/otp")
    }
};

let otp;

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

exports.verificationGet = (req, res) => {
    const userData = req.session.user
    res.render('user/otpsuccess', { userData })
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
                otp = generateotp()
                console.log(otp);
                const emailText = `  Hi this is from Woodsthetics
         Your OTP is: ${otp}`;
                const mailOptions = {
                    from: 'ashikms1998@gmail.com',
                    to: email,
                    subject: 'OTP Verification',
                    text: emailText,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error sending OTP:', error);
                    } else {
                        console.log('OTP sent:', info.response);
                        req.session.changeOTP = true
                        return res.redirect('/otp')
                    }
                });

            }
        }

    } catch (error) {
        console.error("Error in forgot password get:", error);

    }
};

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
};

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
};