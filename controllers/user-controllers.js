const categoryHelpers = require('../helpers/category-helpers');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const cloudinary = require('../utils/cloudinary');

// twilio-credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports = {
    renderAllProducts : async(req, res)=>{
        const userName = req.session.user;
        const userDet = req.session.userDetails;
        const banner = await userHelpers.getActiveBanner();
        productHelpers.getAllProductsAdminSide().then((products)=>{
          res.render('user/user-index',{admin:false, banner, products,userDet, user:true, userName:userName});
        })
    },
    renderShopProducts : (req,res)=>{
      let userName = req.session.user;
      const userDet = req.session.userDetails;
      productHelpers.getAllProductsAdminSide().then((products)=>{                 
        res.render('user/user-product-view', {admin:false, userDet, products, user:true, userName:userName});
      });
    },
    renderLogin : (req, res)=>{
        if(req.session.loggedIn){
          res.redirect('/');
        }else{
          res.render('user/user-login',{loginErr:req.session.loginErr,user:true});
          req.session.loginErr=false;
        }
    },
    renderUserOtp : (req, res)=>{
      if(req.session.loggedIn){
        res.redirect('/');
      }else{
        res.render('user/enterMobileOtp', {loginErr:req.session.loginErr,user:true});
        req.session.loginErr=false;
      }
    },
    userLoginOtpPost : (req, res)=>{
      let userMobile = req.body.mobile;
      userHelpers.doLoginWithMobile(userMobile).then((response)=>{
        if(response.status){
          if(!response.isBlocked){
            // req.session.loggedIn=true;
            req.session.user = response.user.name;
            req.session.userDetails=response.user;
            client.verify.v2.services('VA4cd0431637992931e1bf2592cdc45213')
            .verifications
            .create({to:`+91${userMobile}`, channel: 'sms'})
            .then(verification => {
              console.log(verification.status);
              res.render('user/userOtpVerification', {user:true, userMobile});
            })
            .catch(error => console.error(error));
          }else{
            req.session.loginErr="Your account is blocked";
            res.redirect('/login/otp');
          }
        }else{
          req.session.loginErr="Mobile Number is not registered";
          res.redirect('/login/otp');
        }
      })
    },
    userLoginOtpVerify : (req, res)=>{
      let otp = req.body.otp;
      let userMobile = req.body.mobile;
      console.log(userMobile);
      try{
        client.verify.v2.services('VA4cd0431637992931e1bf2592cdc45213')
        .verificationChecks
        .create({to: `+91${userMobile}`,code: otp})
        .then(verification_check => {
          console.log(verification_check.status);
          if(verification_check.valid){
            req.session.loggedIn=true;
            res.redirect('/');
          }else{
            res.render('user/userOtpVerification', {user:true, userMobile, status:true});
          }
        })
      }catch(err){
        console.log(err);
        res.render('user/userOtpVerification', {user:true, userMobile, status:true});
      }
    },
    renderForgotPassword : (req, res)=>{
      res.render('user/forgot-pass-otp', {loginErr:req.session.loginErr,user:true});
      req.session.loginErr=false;
    },
    forgotPasswordPost : (req, res)=>{
      let userMobile = req.body.mobile;
      userHelpers.doLoginWithMobile(userMobile).then((response)=>{
        if(response.status){
            // req.session.loggedIn=true;
            req.session.user = response.user.name;
            req.session.userDetails=response.user;
            client.verify.v2.services('VA4cd0431637992931e1bf2592cdc45213')
            .verifications
            .create({to:`+91${userMobile}`, channel: 'sms'})
            .then(verification => {
              console.log(verification.status);
              res.render('user/forgot-pass-otpVerify', {user:true, userMobile});
            })
            .catch(error => console.error(error));
        }else{
          req.session.loginErr="Mobile Number is not registered";
          res.redirect('/forgotPassword');
        }
      })
    },
    forgotPasswordVerify : (req, res)=>{
      let otp = req.body.otp;
      let userMobile = req.body.mobile;
      try{
        client.verify.v2.services('VA4cd0431637992931e1bf2592cdc45213')
        .verificationChecks
        .create({to: `+91${userMobile}`,code: otp})
        .then(verification_check => {
          console.log(verification_check.status);
          if(verification_check.valid){
            req.session.loggedIn=true;
            res.render('user/forgot-set-newpass', {user:true, userMobile});
          }else{
            res.render('user/forgot-pass-otpVerify', {user:true, userMobile, status:true});
          }
        });
      }catch(err){
        console.log(err);
        res.render('user/forgot-pass-otpVerify', {user:true, userMobile, status:true});
      }
    },
    updateUserPassword : (req, res)=>{
      userHelpers.setNewPassword(req.body).then(()=>{
        res.redirect('/');
      });
    },
    renderSignup : (req,res)=>{
        if(req.session.loggedIn==true){
          res.redirect('/');
        }else{
          res.render('user/user-signup', {user:true, signupErr: req.session.signupErr});
          req.session.signupErr = false;
        }
    },
    signUpPost : (req,res)=>{
        userHelpers.doSignUp(req.body).then((response)=>{
          if(response){
            req.session.loggedIn=true;
            req.session.user=response.name;
            req.session.userDetails=response;
            res.redirect('/');
          }else{
            req.session.signupErr = "User Already Exists !!";
            res.redirect('/signup');
          }
        })
    },
    loginPost : (req,res)=>{
        userHelpers.doLogin(req.body).then((response)=>{
          if(response.status){
            // console.log(response.isBlocked);
            if(!response.isBlocked){
              req.session.loggedIn=true;
              req.session.userDetails=response.user;
              req.session.user=response.user.name;
              res.redirect('/');
            }else{
              req.session.loginErr="Your account is blocked";
              res.redirect('/login');
            }
          }else{
            req.session.loginErr="Invalid username or password";
            res.redirect('/login');
          }
        })
    },
    userProductDetails : (req, res)=>{
      let userName = req.session.user;
      const userDet = req.session.userDetails;
      let id = req.params.id;
      productHelpers.getProductDetails(id).then((product)=>{
        res.render('user/product-single-view', {product, userDet, user:true, userName});
      })
    },
    renderSelectedProducts : async(req, res)=>{
      let userName = req.session.user;
      const userDet = req.session.userDetails;
      const catName = req.params.id;
      const products = await categoryHelpers.categorySelect(catName);
      res.render('user/user-product-view', {admin:false, userDet, products, catName, user:true, userName});
    },
    addToCart : (req,res)=>{
      let quantity = 1;
      // console.log(req.body);
      req.body.quantity = Number(req.body.quantity);
      // console.log(req.body.quantity);
      if(req.body.quantity>1){
        quantity = req.body.quantity;
      }
      let proId = req.params.id;
      let userId = req.session.userDetails._id;
      userHelpers.addToCartD(proId, userId, quantity).then(()=>{
        res.json({
          status:"success",
          message: "product added to cart"
        })
      });
    },
    deleteFromCart : (req, res)=>{
      let proId = req.params.id;
      let userId = req.session.userDetails._id;
      userHelpers.deleteFromCartD(proId, userId).then(()=>{
        res.json({
          status : "success",
          message : "product removed from cart"
        })
      })
    },
    renderUserCart : (req, res)=>{
      const userName = req.session.user;
      const userId = req.session.userDetails._id;
      const userDet = req.session.userDetails;
      
      userHelpers.getCart(userId).then(async(products)=>{
        const subTotal = await userHelpers.cartTotal(userId);
        let total = 0;
        if(subTotal>0){
          total = (subTotal).toFixed(2);
        }
        res.render('user/cart', {admin:false, products, userDet, user:true, subTotal, total, userName:userName});
      });
    },
    addToWishList : (req,res)=>{
      let proId = req.params.id;
      let userId = req.session.userDetails._id;
      userHelpers.addToWishListD(proId, userId).then(()=>{
        res.json({
          status : "success",
          message : "product added to Wishlist"
        });
      });
    },
    deleteFromWishList:(req, res)=>{
      let proId = req.params.id;
      let userId = req.session.userDetails._id;
      userHelpers.deleteFromWishList(proId, userId).then(()=>{
        res.json({
          status : "success",
          message : "removed from wishlist"
        })
      });
    },
    renderWishList:(req, res)=>{
      const userName = req.session.user;
      const userId = req.session.userDetails._id;
      const userDet = req.session.userDetails;
      userHelpers.getWishList(userId).then((products)=>{
        res.render('user/wishlist', {admin:false, userDet, products, user:true, userName:userName})
      });
    },
    changeQuantity : (req ,res)=>{
      req.body.userId = req.session.userDetails._id;
      userHelpers.changeCartQauntity(req.body).then(async(response)=>{
        const totalPriceProduct = await userHelpers.getTotalPriceOneProduct(req.body.userId, req.body.productId);
        const subTotal = await userHelpers.cartTotal(req.body.userId);
        let cartTotal = 0;
        if(subTotal>0){
          cartTotal = (subTotal-100);
        }
        if(response!=null){
          res.json({
            status: true,
            total : totalPriceProduct,
            subTotal : subTotal,
            cartTotal : cartTotal
          });
        }else{
          res.json({
            status:false
          })
        }
      });
    },
    renderUserProfile : async(req, res)=>{
      const userName = req.session.user;
      const userDet = req.session.userDetails;
      let passErr = req.session.passwordChange;
      const userProf = await userHelpers.getUser(req.session.userDetails._id);
      const address = await userHelpers.getActiveAddress(req.session.userDetails._id)
      res.render('user/userProfile', {admin:false, address, userProf, userDet, passErr, user:true, userName:userName});
    },
    updateUser : (req, res)=>{
      const userId = req.session.userDetails._id;
      userHelpers.updateUser(userId, req.body).then(()=>{
        if(req.body.oldPassword.length>1){
          userHelpers.updatePassword(userId, req.body).then((response)=>{
            if(response){
              req.session.passwordChange = "";
              res.redirect('/userProfile');
            }else{
              req.session.passwordChange = "Invalid old password";
              res.redirect('/userProfile');
            }
          })
        }else{
          req.session.passwordChange = "";
          res.redirect('/userProfile');
        }
      });
    },
    profilePicChange : async(req, res)=>{
      const userId = req.session.userDetails._id;
      try{
        const result = await cloudinary.uploader.upload(req.file.path);
        console.log(result.url);
        userHelpers.profilePicChange(userId, result.url).then((response)=>{
          console.log(response);
          res.json({
            status:"success",
            message:`${result.url}`
          })
        });
      }catch(err){
        console.log(err);
        res.json({
          status:"error"
        })
      }
    },
    renderAddress : async(req, res)=>{
      const userName = req.session.user;
      const userId = req.session.userDetails._id;
      const userDet = req.session.userDetails;
      const addresses = await userHelpers.getAddress(userId);
      res.render('user/manageAddress', {admin:false, userDet, user:true, userName, addresses});
    },
    addAddress : (req, res)=>{
      const userId = req.session.userDetails._id;
      userHelpers.addAddress(userId, req.body).then(()=>{
        // res.redirect('/manageAddress');
        res.redirect('back');
      });  
    },
    changeActive : (req, res)=>{
      const addressId = req.params.id;
      const userId = req.session.userDetails._id;
      if(addressId){
        userHelpers.changeAddressActive(userId, addressId).then(()=>{
          res.json({
            status: 'success',
            message : 'active address changed'
          });
        });
      }
    },
    renderCheckout : async(req, res)=>{
      const userName = req.session.user;
      const userId = req.session.userDetails._id;
      const userDet = req.session.userDetails;
      const addresses = await userHelpers.getAddress(userId);
      const total = await userHelpers.cartTotal(userId);
      const amountPayable = (total-100);
      res.render('user/checkout', {user:true, admin:false, userDet, userName, addresses, total, amountPayable});
    },
    placeOrder : async(req, res)=>{
      const userId = req.session.userDetails._id;
      req.body.userId = userId;
      req.body.userName = req.session.user;
      const address = await userHelpers.getActiveAddress(userId);
      const cartProducts = await userHelpers.getCartList(userId);
      const cartList = cartProducts.products;
      userHelpers.addOrder(req.body, address, cartList).then((orderId)=>{
        if(req.body.paymentMethod==="COD"){
          res.json({
            status: true,
            paymentMethod: req.body.paymentMethod
          });
        }else{
          userHelpers.generateRazorpay(orderId, req.body.totalCost).then((response)=>{
            res.json(response);
          })
          .catch((err)=>{
            console.log(err);
          })
        }
      });
    },
    verifyPayment : (req, res)=>{
      userHelpers.verifyPayment(req.body).then(()=>{
        userHelpers.changeOrderStatus(req.body.order.receipt).then(()=>{
          res.json({
            status: true
          });
        })
      })
    },
    renderOrders : async(req, res)=>{
      const userName = req.session.user;
      const userId = req.session.userDetails._id;
      const userDet = req.session.userDetails;
      const orders = await userHelpers.getOrders(userId);
      // console.log(orders);
      orders.forEach(order => {
        order.isCancelled = order.status==="cancelled"||order.status==="delivered"?true:false;
      });
      // console.log(orders[0].isCancelled);
      res.render('user/orders', {user:true, userDet, admin:false, orders, userName});
    },
    renderOrderedProducts : async(req, res)=>{
      const userName = req.session.user;
      const orderId = req.params.id;
      const userDet = req.session.userDetails;
      const orders = await userHelpers.getOrderedProducts(orderId);
      res.render('user/orderedProducts', {user:true, userDet, admin:false, orders, userName});
    },
    cancelOrder : (req, res)=>{
      const orderId = req.params.id;
      userHelpers.cancelOrder(orderId).then(()=>{
        res.redirect('/orders');
      });
    },
    userLogout : (req ,res)=>{
      // req.session.destroy();
      req.session.loggedIn = false;
      req.session.userDetails=false;
      req.session.user=false;
      res.redirect('/login');
    }
}