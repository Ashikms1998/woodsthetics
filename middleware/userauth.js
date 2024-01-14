const { logDetails } = require('../model/userModel')
const isblock = async (req, res, next) => {
  try {
    let userId
    if (req.session.user) {
       userId = req.session.user.email

    }else{
      userId = req.body.email
    }
    if (userId) {
      const check = await logDetails.findOne({ email: userId });
      

      if (check && check.blocked === true) {
        res.render('user/login', { error: "Please contact Your Admin You are no longer able to access this account", userData: '' });
        
      } else {
        next();
      

      }
    } else {
      res.status(500).send('Internal Server Error');
    }

  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = isblock;