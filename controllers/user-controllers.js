const adminHelpers = require('../helpers/admin-helpers');
const categoryHelpers = require('../helpers/category-helpers');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const cloudinary = require('../utils/cloudinary');
const paypal = require("paypal-rest-sdk");

// twilio-credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


// paypal_creds
const paypal_client_id = process.env.PAYPAL_CLIENT_ID;
const paypal_client_secret = process.env.PAYPAL_CLIENT_SECRET;

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': paypal_client_id,
  'client_secret': paypal_client_secret
});

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
      const filteredProducts = req.session.filteredProducts;
      const maxPrice = req.session.maxPrice;
      const minPrice = req.session.minPrice;
      const searchValue = req.session.searchValue;
      if(filteredProducts){
        res.render('user/user-product-view', {admin:false, userDet, searchValue, maxPrice, minPrice, filteredProducts, user:true, userName:userName});
      }else{
        productHelpers.getAllProductsAdminSide().then((products)=>{         
          res.render('user/user-product-view', {admin:false, userDet, products, user:true, userName:userName});
        });
      }
      req.session.filteredProducts = false;
      req.session.maxPrice = false;
      req.session.minPrice = false;
      req.session.searchValue = null;
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
        console.log(product);
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
      req.body.quantity = Number(req.body.quantity);
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
      const address = await userHelpers.getActiveAddress(req.session.userDetails._id);
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
    editAddress : (req, res)=>{
      const userId = req.session.userDetails._id;
      const addressId = req.params.id;
      userHelpers.editAddress(userId, addressId, req.body).then(()=>{
        res.redirect('back');
      }).catch(()=>{
        res.redirect('back');
      });
    },
    deleteAddress : (req, res)=>{
      const userId = req.session.userDetails._id;
      const addressId = req.params.id;
      userHelpers.deleteAddress(userId, addressId).then(()=>{
        res.redirect('back');
      }).catch(()=>{
        res.redirect('back');
      })
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
      const userDetails = req.session.userDetails;
      req.body.userId = userId;
      req.body.userName = req.session.user;
      const address = await userHelpers.getActiveAddress(userId);
      const cartProducts = await userHelpers.getCartList(userId);
      const cartList = cartProducts.products;
      userHelpers.addOrder(req.body, address, cartList).then((orderId)=>{
        if(req.body.paymentMethod==="COD"){
          productHelpers.reduceStock(cartList).then(()=>{}).catch(()=>{});
          res.json({
            status: true,
            paymentMethod: req.body.paymentMethod
          });
        }else if(req.body.paymentMethod==="onlineRazorpay"){
          userHelpers.generateRazorpay(orderId, req.body.totalCost).then((response)=>{
            productHelpers.reduceStock(cartList).then(()=>{}).catch((err)=>console.log(err));
            res.json({
              response: response,
              paymentMethod: "onlineRazorpay",
              userDetails: userDetails
            });
          })
          .catch((err)=>{
            console.log(err);
          })
        }else{
          const exchangeRate = 0.013;
          const totalCost = (Number(req.body.totalCost)*exchangeRate).toFixed(0);
          const create_payment_json = {
            intent: "sale",
            payer: {
              payment_method: "paypal",
            },
            redirect_urls: {
              return_url: "http://localhost:3000/success",
              cancel_url: "http://localhost:3000/cancel",
            },
            transactions: [
              {
                amount: {
                  currency: "USD",
                  total: `${totalCost}`,
                },
                description: "UNICLUB ONLINE SHOPPING PLATFORM PAYPAL PAYMENT",
              },
            ],
          };
          paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
              res.render('user/failure', {user:true, admin:false, userName: req.session.user});
            } else {
              try{
                userHelpers.changeOrderStatus(orderId).then(()=>{console.log("changed")}).catch(()=>{});
                productHelpers.reduceStock(cartList).then(()=>{}).catch((err)=>console.log(err));
              }catch(err){
                console.log(err);
              }finally{
                for (let i = 0; i < payment.links.length; i++) {
                  if (payment.links[i].rel === "approval_url") {
                    res.json({
                      approval_link: payment.links[i].href,
                      status: "success"
                    })
                  }
                }
              }
            }
          });
        }
      });
    },
    paypalSuccess : (req, res)=>{
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: "25.00",
            },
          },
        ],
      };
      paypal.payment.execute(paymentId, execute_payment_json, (error, payment)=>{
        const userName = req.session.user;
          if (error){
            res.render('user/failure', {user:true, admin:false, userName});
          } else {
            // console.log(JSON.stringify(payment));
            res.render('user/success', {user:true, payerId, paymentId, admin:false, userName});
          }
        }
      );
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
      orders.forEach(order => {
        order.isCancelled = order.status==="cancelled"?true:false;
        order.isDelivered = order.status==="delivered"?true:false;
        order.isReturned = order.status==="returned"?true:false;
        const newDate = new Date(order.date);
        const year = newDate.getFullYear();
        const month = newDate.getMonth() + 1;
        const day = newDate.getDate();
        const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
        order.date = formattedDate;
      });
      res.render('user/orders', {user:true, userDet, admin:false, orders, userName});
    },
    renderOrderedProducts : async(req, res)=>{
      const userName = req.session.user;
      const orderId = req.params.id;
      const userDet = req.session.userDetails;
      const orders = await userHelpers.getOrderedProducts(orderId);
      const orderDet = await adminHelpers.getOrderDetails(orderId);
      const newDate = new Date(orderDet.date);
      const year = newDate.getFullYear();
      const month = newDate.getMonth() + 1;
      const day = newDate.getDate();
      const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
      orderDet.date = formattedDate;
      res.render('user/orderedProducts', {user:true, userDet, orderDet, admin:false, orders, userName});
    },
    cancelOrder : (req, res)=>{
      const orderId = req.params.id;
      userHelpers.cancelOrder(orderId).then(()=>{
        res.redirect('/orders');
      });
    },
    returnOrder : async(req, res)=>{
      const orderId = req.params.id;
      const userId = req.session.userDetails._id;
      const totalAmount = await userHelpers.orderTotalCost(orderId);
      userHelpers.returnOrder(orderId).then(()=>{
        userHelpers.toWallet(userId, "returned", totalAmount[0].total).then(()=>{
          res.redirect('/orders');
        })
      })
      .catch(()=>{
        res.redirect('/orders');
      })
    },
    renderWallet : async(req, res)=>{
      const userName = req.session.user;
      const userId = req.session.userDetails._id;
      const orders = await userHelpers.getOrders(userId);
      orders.forEach(order => {
        if(order.status==="pending"&&!order.refunded){
          userHelpers.toWallet(userId, "online-payment-failed", order.totalCost).then(()=>{}).catch(()=>{});
        }
      });
      const wallet = await userHelpers.getWallet(userId);
      const totalAmount = await userHelpers.totalWalletAmount(userId);
      wallet.forEach(walle => {
        // getting date format clear to render
        const newDate = new Date(walle.date);
        const year = newDate.getFullYear();
        const month = newDate.getMonth() + 1;
        const day = newDate.getDate();
        const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
        walle.date = formattedDate;
      });
      if(wallet){
        res.render('user/wallet', {user:true, totalAmount, wallet, admin:false, userName});
      }else{
        res.render('user/wallet', {user:true, admin:false, userName});
      }
    },
    renderWalletTable : async(req, res)=>{
      const userId = req.session.userDetails._id;
      const userName = req.session.user;
      const wallet = await userHelpers.getAllWallet(userId);
      wallet.forEach(walle => {
        const newDate = new Date(walle.date);
        const year = newDate.getFullYear();
        const month = newDate.getMonth() + 1;
        const day = newDate.getDate();
        const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
        walle.date = formattedDate;
      });
      if(wallet){
        res.render('user/walletTable', {user:true, wallet, admin:false, userName});
      }else{
        res.render('user/walletTable', {user:true, admin:false, userName});
      }
    },
    filterPrice : (req, res)=>{
      productHelpers.filterPrice(req.body.minPrice, req.body.maxPrice, req.body.search).then((products)=>{
        req.session.filteredProducts = products;
        req.session.minPrice = req.body.minPrice;
        req.session.maxPrice = req.body.maxPrice;
        req.session.searchValue = req.body.search;
        res.json({
          status: "success"
        });
      });
    },
    sortPrice : (req, res)=>{
      productHelpers.sortPrice(req.body).then((products)=>{
        req.session.filteredProducts = products;
        req.session.minPrice = req.body.minPrice;
        req.session.maxPrice = req.body.maxPrice;
        req.session.searchValue = req.body.search;
        res.json({
          status: "success"
        })
      });
    },
    searchProducts : (req, res)=>{
      productHelpers.searchProducts(req.body).then((products)=>{
        req.session.filteredProducts = products;
        req.session.minPrice = req.body.minPrice;
        req.session.maxPrice = req.body.maxPrice;
        req.session.searchValue = req.body.search;
        res.json({
          status: "success"
        })
      })
    },
    couponApply : (req, res)=>{
      const userId = req.session.userDetails._id;
      userHelpers.couponApply(req.body.couponCode, userId).then((coupon)=>{
        if(coupon){
          if(coupon==="couponExists"){
            res.json({
              status:"coupon is already used, try another coupon"
            })
          }else{
            res.json({
              status: "success",
              coupon: coupon
            })
          }
        }else{
          res.json({
            status: "coupon is not valid !!"
          })
        }
      });
    },
    userLogout : (req ,res)=>{
      req.session.loggedIn = false;
      req.session.userDetails=false;
      req.session.user=false;
      res.redirect('/login');
    }
}