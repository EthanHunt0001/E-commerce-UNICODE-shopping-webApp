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
            const userId = req.session.userDetails._id;
            req.session.userDetails = await userHelpers.getUser(userId);
            next();
        }else{
            res.redirect('/login'); 
        }
    }
}