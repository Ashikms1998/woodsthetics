require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const nocache = require('nocache')
const logDetails = require('./model/userModel')
const nodemailer = require("nodemailer")
const uuid = require('uuid');

app.set('view engine', 'ejs')

app.use(cookieParser()); // Required for express-session

app.use(session({
    secret: uuid.v4(), // Change this to a long and random string
    resave: true,
    saveUninitialized: true
}));


app.use(nocache());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//routes

app.use('/', require('./routes/userroutes'));
app.use('/', require('./routes/adminroutes'));




app.get("/usermanagemnt", (req, res) => {
    res.render("user/usermanagement.ejs")
})

app.get("/categorymanagement", (req, res) => {
    res.render("admin/editCategory.ejs")
})


app.get("/", (req, res) => {
    res.render("user/home.ejs")
})




//database

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_STRING)
    .then(() => {
        console.log('Mongodb connected');
    })
    .catch((err) => {
        console.log('Failed to Connect' + err);
    });


//port setup

app.listen(3002, () => {
    console.log('http://localhost:3002');
})

