const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/user-controllers');
const upload = require('../utils/multer');
const verifyLogin = require('../middlewares/sessionVerify');

router.get('/', userControllers.renderAllProducts);

router.get('/login', userControllers.renderLogin);

router.get('/signup', userControllers.renderSignup);

router.post('/signup', userControllers.signUpPost);

router.post('/login', userControllers.loginPost);

router.get('/login/otp', userControllers.renderUserOtp);

router.post('/login/otp', userControllers.userLoginOtpPost);

router.post('/login/otpVerify', userControllers.userLoginOtpVerify);

router.get('/forgotPassword', userControllers.renderForgotPassword);

router.post('/forgotPasswordPost', userControllers.forgotPasswordPost);

router.post('/forgotPasswordVerify', userControllers.forgotPasswordVerify);

router.post('/settingNewPass', verifyLogin.userVerifyLogin, userControllers.updateUserPassword);

router.get('/shop', verifyLogin.userVerifyLogin,  userControllers.renderShopProducts);

router.get('/product-single-view/:id', verifyLogin.userVerifyLogin, userControllers.userProductDetails);

// cart & wishlist

router.get('/addToCart/:id', verifyLogin.userVerifyLogin, userControllers.addToCart);

router.post('/cart/changeCartQuantity', verifyLogin.userVerifyLogin, userControllers.changeQuantity);

router.post('/addToCart/:id', verifyLogin.userVerifyLogin, userControllers.addToCart);

router.get('/deleteFromCart/:id', verifyLogin.userVerifyLogin, userControllers.deleteFromCart);

router.get('/cart', verifyLogin.userVerifyLogin, userControllers.renderUserCart);

router.get('/addToWishList/:id', verifyLogin.userVerifyLogin, userControllers.addToWishList);

router.get('/deleteFromWishList/:id', verifyLogin.userVerifyLogin,userControllers.deleteFromWishList);

router.get('/wishList', verifyLogin.userVerifyLogin, userControllers.renderWishList);

// user-profile

router.get('/userProfile', verifyLogin.userVerifyLogin, userControllers.renderUserProfile);   

router.post('/profilePost', verifyLogin.userVerifyLogin, userControllers.updateUser);

router.post('/upload', verifyLogin.userVerifyLogin, upload.single("file"), userControllers.profilePicChange);

router.get('/manageAddress', verifyLogin.userVerifyLogin, userControllers.renderAddress);

router.post('/addressPost', verifyLogin.userVerifyLogin, userControllers.addAddress);

router.get('/changeActiveAddress/:id', verifyLogin.userVerifyLogin, userControllers.changeActive);

router.post('/editAddressPost/:id', verifyLogin.userVerifyLogin, userControllers.editAddress);

router.get('/deleteAddress/:id', verifyLogin.userVerifyLogin, userControllers.deleteAddress);

router.get('/wallet', verifyLogin.userVerifyLogin, userControllers.renderWallet);

router.get('/walletTable', verifyLogin.userVerifyLogin, userControllers.renderWalletTable);

// order-management

router.get('/checkout', verifyLogin.userVerifyLogin, userControllers.renderCheckout);

router.post('/placeOrder', verifyLogin.userVerifyLogin, userControllers.placeOrder);

router.post('/verifyPayment', verifyLogin.userVerifyLogin, userControllers.verifyPayment);

router.get('/orders', verifyLogin.userVerifyLogin, userControllers.renderOrders);

router.get('/view/products/:id', verifyLogin.userVerifyLogin, userControllers.renderOrderedProducts);

router.get('/cancelOrder/:id', verifyLogin.userVerifyLogin, userControllers.cancelOrder);

router.get('/returnOrder/:id', verifyLogin.userVerifyLogin, userControllers.returnOrder);

router.get('/success', verifyLogin.userVerifyLogin, userControllers.paypalSuccess);

// Category

router.get('/category/:id', verifyLogin.userVerifyLogin, userControllers.renderSelectedProducts);

// Filter & sort & search

router.post('/shopPriceFilter', verifyLogin.userVerifyLogin, userControllers.filterPrice);

router.post('/shopPriceSort', verifyLogin.userVerifyLogin, userControllers.sortPrice);

router.post('/searchProduct', verifyLogin.userVerifyLogin, userControllers.searchProducts);

// coupon_routes

router.post('/couponApply', verifyLogin.userVerifyLogin, userControllers.couponApply);

// logout

router.get('/logout', userControllers.userLogout);

module.exports = router;
