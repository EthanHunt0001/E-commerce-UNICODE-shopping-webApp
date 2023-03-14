const userHelpers = require("../helpers/user-helpers");

module.exports = {
    adminAuthVerify : (req, res, next)=>{
        if(req.session.adminLoggedIn){
            next();
        }else{
            res.redirect('/admin/login');
        }
    },
    userVerifyLogin : async(req, res, next)=>{
        if(req.session.loggedIn){
            req.session.userDetails = await userHelpers.getUser(req.session.userDetails._id);
            next();
        }else{
            res.redirect('/login'); 
        }
    }
}