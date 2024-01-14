
const adminsession = (req, res, next) => {
    if (req.session.adminID) {
        next();
    } else {
        res.redirect('/adminloginget')
    }
}
module.exports = adminsession;  