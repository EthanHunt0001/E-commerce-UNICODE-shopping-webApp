const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/admin-controllers');
const upload = require('../utils/multer');
const verifyLogin = require('../middlewares/sessionVerify');

// ADMIN-LOGIN

router.get('/login', adminControllers.rederLogin);

router.post('/login', adminControllers.loginPost);

router.get('/', verifyLogin.adminAuthVerify, adminControllers.renderDashboard);

// PRODUCTS-MANAGE

router.get('/admin-view', verifyLogin.adminAuthVerify, adminControllers.renderAllProductsAdminSide);

router.get('/add-product', verifyLogin.adminAuthVerify, adminControllers.renderAddProducts);

router.post('/add-product', verifyLogin.adminAuthVerify, upload.array("image", 4), adminControllers.addProductsPost);

router.get('/list/:id', verifyLogin.adminAuthVerify, adminControllers.renderListProduct);

router.get('/unlist/:id', verifyLogin.adminAuthVerify, adminControllers.rednerUnListProduct);

router.get('/editProduct/:id', verifyLogin.adminAuthVerify, adminControllers.renderEditProduct);

router.post('/editProduct/:id', verifyLogin.adminAuthVerify, upload.array("image", 4), adminControllers.editProductPost);

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

router.get('/orderedProducts/:id', verifyLogin.adminAuthVerify, adminControllers.orderedProducts);

// BANNER-MANAGEMENT

router.get('/banner-view', verifyLogin.adminAuthVerify, adminControllers.bannerView);

router.get('/add-banner', verifyLogin.adminAuthVerify, adminControllers.renderAddBanner);

router.post('/add-banner', verifyLogin.adminAuthVerify, upload.single("image", 1), adminControllers.addBanner);

router.get('/edit-banner/:id', verifyLogin.adminAuthVerify, adminControllers.renderEditBanner);

router.post('/edit-banner/:id', verifyLogin.adminAuthVerify, upload.single("image", 1), adminControllers.editBannerPost);

router.get('/selectBanner/:id', verifyLogin.adminAuthVerify, adminControllers.selectBanner);

// LOGOUT

router.get('/logout', adminControllers.adminLogout);

module.exports = router;