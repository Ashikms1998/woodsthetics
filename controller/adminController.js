const { logDetails } = require('../model/userModel');
const bcrypt = require('bcrypt');
const { categoryCollection } = require('../model/categoryDB');
const { productCollection } = require('../model/productDB')
const { addressCollection } = require('../model/addressDB')
const { orderCollection } = require('../model/orderDB');
const multer = require('../controller/userController');
const { LogError } = require('concurrently');
const { log } = require('console');

exports.loginGet = (req, res) => {
    if (req.session.adminID) {
        return res.redirect('/adminhome')
    }
    return res.render('admin/adminlogin')
};
exports.homeGet = (req, res) => {
    res.render('admin/adminhome')
};



exports.userGet = async (req, res) => {
    const admin = await logDetails.find()
    res.render('admin/usermanagement', { admin })
}





exports.categoryGet = async (req, res) => {
    try {
        const Categorydata = await categoryCollection.find()
        const errorMessage = req.session.error;
        req.session.error = null;
        res.render('admin/categorymanagement', { Categorydata, errorMessage });
    } catch (error) {
        console.log("CATEGORY GET ERROR:", error);
    }

};


exports.productmanagementGet = async (req, res) => {

    const productdata = await productCollection.find()
    res.render('admin/productmanagement', { productdata })
}

exports.editproductGet = async (req, res) => {
    const productid = req.params._id
    const productdata = await productCollection.findById(productid)
    const Categorydata = await categoryCollection.find({ blockStatus: false })
    res.render('admin/editproduct', { productdata, Categorydata });
}



exports.addproductGet = async (req, res) => {
    const Categorydata = await categoryCollection.find({ blockStatus: false })
    res.render('admin/addproduct', { Categorydata })
}



exports.productadd = async (req, res) => {
    try {

        // const image = req.file.path.substring(7);
        const image = req.files.map((file) => {
            return file.path.substring(7);
        });

        const newproduct = new productCollection({
            productname: req.body.productname,
            description: req.body.description,
            about: req.body.about,
            availability: req.body.availability,
            category: req.body.category,
            price: req.body.price,
            quantity: req.body.quantity,
            brand: req.body.brand,
            image: image
        })
        await newproduct.save()
        res.redirect('/productmanagement')
    } catch (error) {
        console.log("UPDATING PRODUCT ERROR:", error);
    }

};

exports.editcategoryGet = async (req, res) => {
    const productid = req.params._id;
    const errorMessage = req.session.error;
    const categorydata = await categoryCollection.findById(productid)
    res.render('admin/editcategory', { categorydata, errorMessage })

}
exports.orderGet = async (req, res) => {

    try {


        const orderDetails = await orderCollection.find()

        addressData = await addressCollection.find();

        const productData = await productCollection.find()

        const user = await logDetails.find()

        res.render('admin/ordermanage', { user: user, orderDetails: orderDetails, addressData: addressData, productData: productData })

    } catch (error) {
        console.log('Error in ordermanageGet', error);
    }


}



//post

const admindata = {
    adminName: process.env.ADMIN_USERNAME,
    passcode: process.env.ADMIN_PASSWORD
};


exports.loginPost = (req, res) => {
    const { username, password } = req.body
    if (admindata.adminName == username && admindata.passcode == password) {
        req.session.adminID = true;
        console.log(req.session.adminID);
        res.render('admin/adminhome');
    } else {
        res.render("admin/adminlogin", { wrg: "wrong credentials" })
    }
}

// addcategory

exports.addcategoryPost = async (req, res) => {

    try {
        const category = req.body.category;
        const newDescription = req.body.description;


        const existingCategory = await categoryCollection.findOne({ categoryname: category });
        console.log(existingCategory);
        const existingDescription = await categoryCollection.findOne({ description: newDescription })

        if (existingCategory) {
            req.session.error = "Category name already exists."
            return res.redirect('back');
        } else if (existingDescription) {
            req.session.error = "Category description already exists."
            return res.redirect('back');
        } else {
            const Categorydata = new categoryCollection({
                categoryname: category,
                description: newDescription,
                blockStatus: false
            })
            console.log(Categorydata, 'scene aan');
            await Categorydata.save();
            return res.redirect('/categorymanagement');

        }
    } catch (error) {
        console.log("UPDATING CATEGORY ERROR:", error);
    }

};

exports.editproductPost = async (req, res) => {
    const indices = req.body.index.split(',')
    console.log(indices);
    const id = req.params._id
    const productdata = await productCollection.findById(id);
    if (req.files && req.files.length > 0) {
        req.files.forEach((file, i) => {
            let imagePath = file.path;
            if (imagePath.includes('public\\')) {
                imagePath = imagePath.replace('public\\', '');
            } else if (imagePath.includes('public/')) {
                imagePath = imagePath.replace('public/', '');
            }
            productdata.image[indices[i]] = imagePath;
        });

    } else {

        console.log("No image to update");
    }

    const editproductdata = req.params._id
    const updatedproductdata = await productCollection.findByIdAndUpdate(editproductdata, {
        productname: req.body.productname,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        quantity: req.body.quantity,
        brand: req.body.brand,
        image: productdata.image
    }, { new: true })

    res.redirect('/productmanagement')

};

exports.deleteproductGet = async (req, res) => {

    const productid = req.params._id
    console.log(productid);
    try {
        const deleteProduct = await productCollection.updateOne({ _id: productid }, { $set: { quantity: 0 } });

        if (!deleteProduct) {
            return res.status(404).send("product not found")
        }
        res.json()
    } catch (error) {
        console.log('error in deleteproductPost', error);
    }
};



exports.editcategoryPost = async (req, res) => {
    const editcategorydata = req.params._id;
    const category = req.body.categoryname;
    const description = req.body.description;

    const existingCategory = await categoryCollection.findOne({ categoryname: category });
    const existingDescription = await categoryCollection.findOne({ description: description });

    if (existingCategory && existingCategory._id != editcategorydata) {
        req.session.error = "Category name already exists.";
        return res.redirect('back');
    } else if (existingDescription && existingDescription._id != editcategorydata) {
        req.session.error = "Category description already exists.";
        return res.redirect('back');
    } else {
        const updatedcategorydata = await categoryCollection.findByIdAndUpdate(editcategorydata, {
            categoryname: req.body.categoryname,
            description: req.body.description,
        }, { new: true })

        res.redirect('/categorymanagement')
    }
};
exports.updateStatusPost = async (req, res) => {
    try {

        const oId = req.body.oId

        const status = req.body.status

        const update = await orderCollection.findByIdAndUpdate(oId, { $set: { status: status } })
        return res.send('success')
    } catch (error) {
        console.log(error);
    }
},


    //blockuser

    exports.blockUser = async (req, res) => {
        try {
            const userId = req.body;
            const newUserid = userId.btnid

            const user = await logDetails.findById(newUserid);


            if (!user) {
                return res.status(404).send('User not found');
            }
            user.blocked = !user.blocked;
            await user.save();
            console.log('User updated:', user);
            return res.status(200).send({ user: user });
        } catch (error) {
            console.log("Error:", error);
            res.status(500).send('Internal Server Error');
        }
    };


// blockproduct

exports.blockProductPost = async (req, res) => {
    try {
        const productId = req.body;
        console.log('ithan product', productId);
        const newProductid = productId.btnid
        console.log('ith productId mathrm', newProductid);
        const product = await productCollection.findById(newProductid);
        if (!product) {
            return res.status(404).send('product not found');
        }
        console.log(product.blocked);
        product.blocked = !product.blocked;

        await product.save();
        console.log('User updated:', product);
        return res.status(200).send({ product: product });


    } catch (error) {
        console.log("Error:", error);
        res.status(500).send('Internal Server Error')
    }
}

//blockCategory
exports.blockedCategoryPost = async (req, res) => {

    try {

        const categoryId = req.body;
        const newCategoryId = categoryId.btnid
        const allProduct = await productCollection.find()
        const categoriesList = allProduct.map(product => product.category);
        const category = await categoryCollection.findById(newCategoryId);


        if (!category) {
            return res.status(404).send('product not found');
        }
        console.log(category.blockStatus)

        category.blockStatus = !category.blockStatus;

        await category.save();
        console.log('User updated:', category);
        return res.status(200).send({ category: category });


    } catch (error) {
        console.log("Error in blockProductPost:", error);
        res.status(500).send('Internal Server Error')
    }
}

exports.logoutadmin = (req, res) => {
    console.log("logoutmunp", req.session.adminID);
    if (req.session.adminID) {
        req.session.adminID = false;
        console.log(req.session.adminID);

        res.redirect('/adminloginget');
    } else {
        res.render("admin/adminlogin", { wrg: "wrong credentials" })
    }
};

exports.salesreportGet = async (req, res) => {
    try {
        let orderDetails = await orderCollection.aggregate([{
            $lookup: {
                from: 'detailslogs',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetails'
            }
        }, {
            $lookup: {
                from: 'productcollections',
                localField: 'productdetails.product',
                foreignField: '_id',
                as: 'productDetails'
            }
        }, { $unwind: '$userDetails' }])
        

        res.render('admin/salesreport', { orderDetails })
    } catch (error) {
        console.log('Error in sales report get', error);
    }
}