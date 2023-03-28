const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/admin-controllers');
const upload = require('../utils/multer');
const verifyLogin = require('../middlewares/sessionVerify');

// ADMIN-LOGIN

router.get('/login', adminControllers.rederLogin);

router.post('/login', adminControllers.loginPost);

router.get('/', verifyLogin.adminAuthVerify, adminControllers.renderDashboard);

router.get('/sales-report', verifyLogin.adminAuthVerify, adminControllers.renderSalesReport);

router.get('/salesReportFilter', verifyLogin.adminAuthVerify, adminControllers.salesReportFilterGet);

router.post('/salesReportFilter', verifyLogin.adminAuthVerify, adminControllers.salesReportFilter);

// PRODUCTS-MANAGE

router.get('/admin-view', verifyLogin.adminAuthVerify, adminControllers.renderAllProductsAdminSide);

router.get('/add-product', verifyLogin.adminAuthVerify, adminControllers.renderAddProducts);

router.post('/add-product', verifyLogin.adminAuthVerify, upload.array("images"), adminControllers.addProductsPost);

router.get('/list/:id', verifyLogin.adminAuthVerify, adminControllers.renderListProduct);

router.get('/unlist/:id', verifyLogin.adminAuthVerify, adminControllers.rednerUnListProduct);

router.get('/editProduct/:id', verifyLogin.adminAuthVerify, adminControllers.renderEditProduct);

router.post('/editProduct/:id', verifyLogin.adminAuthVerify, upload.array("images"), adminControllers.editProductPost);

// USERS-MANAGE

router.get('/users', verifyLogin.adminAuthVerify, adminControllers.renderUsers);

router.get('/users/add-user', verifyLogin.adminAuthVerify, adminControllers.renderAddUsers);

router.post('/users/add-user', verifyLogin.adminAuthVerify, adminControllers.addUsersPost);

router.get('/users/delete-user/:id', verifyLogin.adminAuthVerify, adminControllers.renderDeleteUsers);

router.get('/users/edit-user/:id', verifyLogin.adminAuthVerify, adminControllers.renderEditUsers);

router.post('/users/edit-user/:id', verifyLogin.adminAuthVerify, adminControllers.editUsersPost);

router.get('/users/block-user/:id', verifyLogin.adminAuthVerify, adminControllers.blockUserReq);

router.get('/users/unblock-user/:id', verifyLogin.adminAuthVerify, adminControllers.unBlockUserReq);

// CATEGORY-MANAGEMENT

router.get('/category', verifyLogin.adminAuthVerify, adminControllers.renderCategory);

router.get('/add-category', verifyLogin.adminAuthVerify, adminControllers.renderAddCategory);

router.post('/add-category', verifyLogin.adminAuthVerify, adminControllers.addCategoryPost);

router.get('/unlist-category/:id', verifyLogin.adminAuthVerify, adminControllers.unListCategory);

router.get('/list-category/:id', verifyLogin.adminAuthVerify, adminControllers.listCategory);

// ORDRES-MANAGEMENT

router.get('/orders', verifyLogin.adminAuthVerify, adminControllers.getOrders);

router.get('/cancelOrder/:id', verifyLogin.adminAuthVerify, adminControllers.cancelOrder);

router.get('/shipOrder/:id', verifyLogin.adminAuthVerify, adminControllers.shipOrder);

router.get('/orderDelivered/:id', verifyLogin.adminAuthVerify, adminControllers.orderDelivered);

router.get('/viewOrderDetails/:id', verifyLogin.adminAuthVerify, adminControllers.viewOrderDetails);

// BANNER-MANAGEMENT

router.get('/banner-view', verifyLogin.adminAuthVerify, adminControllers.bannerView);

router.get('/add-banner', verifyLogin.adminAuthVerify, adminControllers.renderAddBanner);

router.post('/add-banner', verifyLogin.adminAuthVerify, upload.single("image", 1), adminControllers.addBanner);

router.get('/edit-banner/:id', verifyLogin.adminAuthVerify, adminControllers.renderEditBanner);

router.post('/edit-banner/:id', verifyLogin.adminAuthVerify, upload.single("image", 1), adminControllers.editBannerPost);

router.get('/selectBanner/:id', verifyLogin.adminAuthVerify, adminControllers.selectBanner);

// COUPEN-MANAGEMENT

router.get('/coupons', verifyLogin.adminAuthVerify, adminControllers.renderCoupons);

router.get('/add-coupon', verifyLogin.adminAuthVerify, adminControllers.renderAddCoupen);

router.post('/add-coupon', verifyLogin.adminAuthVerify, adminControllers.addCouponPost);

router.post('/editCouponPost/:id', verifyLogin.adminAuthVerify, adminControllers.editCouponPost);

router.get('/deactivate/:id', verifyLogin.adminAuthVerify, adminControllers.deactivateCoupon);

router.get('/activate/:id', verifyLogin.adminAuthVerify, adminControllers.activateCoupon);

// LOGOUT

router.get('/logout', adminControllers.adminLogout);

module.exports = router;
