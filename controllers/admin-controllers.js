const productHelpers = require('../helpers/product-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');
const cloudinary = require('../utils/cloudinary');
const categoryHelpers = require('../helpers/category-helpers');


module.exports = {
    rederLogin : (req,res)=>{
        if(req.session.adminLoggedIn){
          res.redirect('/admin');
        }else{
          res.render('admin/admin-login',{admin:true,adminLoginErr:req.session.adminLoginErr});
          req.session.adminLoginErr=false;
        }
    },
    loginPost : (req,res)=>{
        adminHelpers.adminLogin(req.body).then((response)=>{
          if(response.status){
            req.session.adminName = response.adminName;
            req.session.adminEmail = req.body.email; 
            req.session.adminLoggedIn = true;
            res.redirect('/admin');
          }else{
            req.session.adminLoginErr = "Invalid username or password";
            res.redirect('/admin/login');
          }
        })
    },
    renderAllProducts : (req, res)=>{
        if(req.session.adminLoggedIn){
          productHelpers.getAllProducts().then((products)=>{
            res.render('admin/admin-view',{admin:true,products,adminName:req.session.adminName});
          })
        }else{
          res.redirect('/admin/login');
        }
    },
    renderAllProductsAdminSide : (req, res)=>{
        productHelpers.getAllProducts().then((products)=>{
          res.render('admin/admin-view',{admin:true,products,adminName:req.session.adminName});
        })
    },
    renderAddProducts : (req,res)=>{
        categoryHelpers.getAllCategories().then((categories)=>{
          res.render('admin/add-product', {admin:true, categories, adminName:req.session.adminName});
        })
    },
    addProductsPost : (req,res)=>{
      try{
        if(req.body.size){
          let temp = new Array();
          temp = req.body.size.split(',');
          req.body.size = temp;
        }
        productHelpers.addProduct(req.body,async (id)=>{
          let imgUrls = [];
          for(let i=0;i<req.files.length;i++){
            const result = await cloudinary.uploader.upload(req.files[i].path);
            imgUrls.push(result.url);
          }
          if(imgUrls.length!==0){
            productHelpers.addProductImages(id, imgUrls);
          }
        })
      }catch(err){
        console.log(err);
      }finally{
        res.json({
          status:"success",
          message: "product added to cart"
        })
      }
    },
    renderListProduct : (req,res)=>{
        let proId = req.params.id;
        productHelpers.listProduct(proId).then(()=>{
          res.json({
            status : "success",
            message : "product listed"
          })
        })
    },
    rednerUnListProduct : (req,res)=>{
        let proId = req.params.id;
        productHelpers.unListProduct(proId).then(()=>{
          res.json({
            status : "success",
            message : "product unlisted"
          })
        })
    },
    renderEditProduct : async(req,res)=>{
        let product = await productHelpers.getProductDetails(req.params.id);
        try{
          let category = await categoryHelpers.getCategorydetail(product.name);
          if(category===null){
            res.redirect('/admin/admin-view');
          }
          let categories = await categoryHelpers.getAllCategories();
          res.render('admin/edit-product',{admin:true, product, category, categories, adminName:req.session.adminName});
        }catch(err){
          console.log(err);
          let categories = await categoryHelpers.getAllCategories();
          res.render('admin/edit-product',{admin:true, product, category, categories, adminName:req.session.adminName});
        }
    },
    editProductPost : (req,res)=>{
      let proId = req.params.id;
      if(req.body.size && typeof(String)){
        let temp = new Array();
        temp = req.body.size.split(',');
        req.body.size = temp;
      }
      productHelpers.updateProduct(proId,req.body).then(async()=>{
        try{
          let imgUrls = [];
          for(let i=0;i<req.files.length;i++){
            const result = await cloudinary.uploader.upload(req.files[i].path);
            imgUrls.push(result.url);
          }
          if(imgUrls.length!==0){
            productHelpers.addProductImages(proId, imgUrls);
          }
        }catch (err){
          console.log(err);
        }finally{
          res.json({
            status: "success",
            message: "product edited successfully"
          })
        } 
      })
    },
    renderUsers : (req,res)=>{
        userHelpers.getAllUsers().then((users)=>{
          res.render('admin/user-view',{admin:true,users,adminName:req.session.adminName});
        })
    },
    renderAddUsers : (req,res)=>{
        res.render('admin/add-user',{admin:true,adminName:req.session.adminName});
    },
    addUsersPost : (req,res)=>{
        userHelpers.addUser(req.body).then((id)=>{
          res.redirect('/admin/users/add-user');
        })
    },
    renderDeleteUsers : (req,res)=>{
        let userId = req.params.id;
        userHelpers.deleteUser(userId).then((response)=>{
          res.redirect('/admin/users');
        });
    },
    renderEditUsers : async(req,res)=>{
        let userId = req.params.id;
        // console.log(userId);
        let userDetails = await userHelpers.findUser(userId);
        res.render('admin/edit-user',{admin:true,userDetails,adminName:req.session.adminName});
    },
    editUsersPost : (req,res)=>{
        let userId = req.params.id;
        let userDetails = req.body;
        userHelpers.editUser(userId,userDetails).then(()=>{
          res.redirect('/admin/users');
        });
    },
    renderDashboard : (req,res)=>{
      adminHelpers.getUsersCount().then(async(usersCount)=>{
        const total = await adminHelpers.getLastMonthTotal();
        const totalOrdersPlaced = await productHelpers.totalOrdersPlaced();
        let totalEarnings = 0;
        totalEarnings = await adminHelpers.getOrderTotalPrice();
        res.render('admin/admin-dashboard',{admin:true, totalOrdersPlaced, total, totalEarnings, usersCount, adminName:req.session.adminName});
      }).catch(()=>{
        res.render('admin/admin-dashboard',{admin:true, adminName:req.session.adminName});
      })
    },
    renderSalesReport : async(req, res)=>{
      const deliveredOrders = await adminHelpers.getAllDeliveredOrders();
      let totalEarnings = 0;
      totalEarnings = await adminHelpers.getOrderTotalPrice();
      deliveredOrders.forEach(eachOrder => {
        eachOrder.productCount = eachOrder.products.length;
        // date formatting
        const newDate = new Date(eachOrder.date);
        const year = newDate.getFullYear();
        const month = newDate.getMonth() + 1;
        const day = newDate.getDate();
        const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
        eachOrder.date = formattedDate;
      });
      res.render('admin/admin-sales-report', {admin:true, deliveredOrders, totalEarnings, adminName:req.session.adminName});
    },
    salesReportFilter : (req, res)=>{
      adminHelpers.filterDate(req.body.date).then((filteredOrders)=>{
        let totalEarnings=0;
        if(filteredOrders.length>=1){
          filteredOrders.forEach(eachOrder => {
            eachOrder.productCount = eachOrder.products.length;
            totalEarnings += eachOrder.totalCost;
            // date formatting
            const newDate = new Date(eachOrder.date);
            const year = newDate.getFullYear();
            const month = newDate.getMonth() + 1;
            const day = newDate.getDate();
            const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
            eachOrder.date = formattedDate;
          });
        }else{
          filteredOrders=false;
        }
        res.render('admin/filteredSalesReport', {admin:true, filteredOrders, totalEarnings, adminName:req.session.adminName});
      })
    },
    salesReportFilterGet : (req, res)=>{
      res.redirect('/admin/sales-report');
    },
    blockUserReq : (req, res)=>{
      let userId = req.params.id;
      userHelpers.blockUser(userId).then(()=>{
        res.redirect('/admin/users');
      });
    },
    unBlockUserReq : (req, res)=>{
      let userId = req.params.id;
      userHelpers.unBlockUser(userId).then(()=>{
        res.redirect('/admin/users');
      });
    },
    renderCategory : (req,res)=>{
      categoryHelpers.getAllCategories().then((categories)=>{
        res.render('admin/category-view', {admin:true, categories,adminName:req.session.adminName});
      });
    },
    renderAddCategory : (req, res)=>{
      res.render('admin/add-category', {admin:true,adminName:req.session.adminName});
    },
    addCategoryPost : (req,res)=>{
      let cred = req.body;
      cred.listingStatus = true;
      categoryHelpers.addCategory(cred).then((id)=>{
        res.redirect('/admin/category');
      });
    },
    unListCategory : (req, res)=>{
      let catId = req.params.id;
      categoryHelpers.unlistCategory(catId).then((response)=>{
        res.redirect('/admin/category');
      });
    },
    listCategory : (req, res)=>{
      let catId = req.params.id;
      categoryHelpers.listCategory(catId).then((response)=>{
        res.redirect('/admin/category');
      });
    },
    getOrders : async(req, res)=>{
      const orders = await adminHelpers.getAllOrders();
      orders.forEach(order => {
        order.isCancelled = order.status === "cancelled"||order.status==="delivered"||order.status==="returned"? true : false;
        order.isShipped = order.status==="shipped"?true:false;
        order.isDelivered = order.status==="delivered"?true:false;
        order.isPlaced = order.status==="placed"||order.status==="pending"?true:false;
        order.isReturned = order.status==="returned"?true:false;
        // date formatting
        const newDate = new Date(order.date);
        const year = newDate.getFullYear();
        const month = newDate.getMonth() + 1;
        const day = newDate.getDate();
        const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
        order.date = formattedDate;
      });
      res.render('admin/admin-orders', {admin:true, orders, adminName:req.session.adminName});
    },
    cancelOrder : (req, res)=>{
      const orderId = req.params.id;
      userHelpers.cancelOrder(orderId).then(()=>{
        res.redirect('/admin/orders');
      });
    },
    shipOrder : (req, res)=>{
      const orderId = req.params.id;
      adminHelpers.shipOrder(orderId).then(()=>{
        res.redirect('/admin/orders');
      });
    },
    orderDelivered : (req, res)=>{
      const orderId = req.params.id;
      adminHelpers.orderDelivered(orderId).then(()=>{
        res.redirect('/admin/orders');
      });
    },
    viewOrderDetails : async(req, res)=>{
      const orderId = req.params.id;
      const orderedProducts = await userHelpers.getOrderedProducts(orderId);
      adminHelpers.getOrderDetails(orderId).then((order)=>{
          const newDate = new Date(order.date);
          const year = newDate.getFullYear();
          const month = newDate.getMonth() + 1;
          const day = newDate.getDate();
          const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
          order.date = formattedDate;
        res.render('admin/order-viewdetails-admin', {admin:true, orderedProducts, order, adminName:req.session.adminName})
      })
    },
    bannerView : (req, res)=>{     
      adminHelpers.getBanners().then((banners)=>{
        res.render('admin/banner-view', {admin:true, banners, adminName:req.session.adminName});
      })
    },
    renderAddBanner : (req, res)=>{     
      res.render('admin/add-banner', {admin:true, adminName:req.session.adminName});
    },
    addBanner : async(req, res)=>{     
      try{
        const result = await cloudinary.uploader.upload(req.file.path);
        req.body.image = result.url;
      }catch(err){
        console.log(err);
      }
      adminHelpers.addBanner(req.body).then(()=>{
        res.redirect('/admin/banner-view');
      });
    },
    renderEditBanner : (req, res)=>{
      const bannerId = req.params.id;
      adminHelpers.editBanner(bannerId).then((banner)=>{
        // console.log(banner);
        res.render('admin/edit-banner', {admin:true, banner, adminName:req.session.adminName});
      });
    },
    editBannerPost : async(req, res)=>{
      const bannerId = req.params.id;
      try{
        const result = await cloudinary.uploader.upload(req.file.path);
        adminHelpers.editImageUpload(bannerId, result.url);
      }catch(err){
        console.log(err);
      }
      adminHelpers.editBannerPost(bannerId, req.body).then(()=>{
        res.redirect('/admin/banner-view');
      });
    },
    selectBanner : (req, res)=>{
      const bannerId = req.params.id;
      adminHelpers.selectBanner(bannerId).then(()=>{
        res.redirect('/admin/banner-view');
      });
    },
    renderCoupons : async(req, res)=>{
      const coupons = await adminHelpers.getCoupons();
      coupons.forEach(coupon=>{
        coupon.deactivated = coupon.status==="DEACTIVATED"?true:false;
        coupon.expired = coupon.status==="EXPIRED"?true:false;
      });
      res.render('admin/coupons', {admin:true, coupons, adminName:req.session.adminName});
    },
    renderAddCoupen : (req, res)=>{
      res.render('admin/add-coupon', {admin:true, adminName:req.session.adminName});
    },
    addCouponPost : (req, res)=>{
      adminHelpers.addCoupon(req.body).then(()=>{
        res.redirect('/admin/coupons');
      })
      .catch(()=>{
        res.redirect('/admin/coupons');
      })
    },
    editCouponPost : (req, res)=>{
      const couponId = req.params.id;
      adminHelpers.editCoupon(couponId, req.body).then(()=>{
        res.redirect('/admin/coupons');
      })
      .catch(()=>{
        res.redirect('/admin/coupons');
      })
    },
    deactivateCoupon : (req, res)=>{
      const couponId = req.params.id;
      adminHelpers.deactivateCoupon(couponId).then(()=>{
        res.redirect('/admin/coupons');
      })
      .catch(()=>{
        res.redirect('/admin/coupons');
      })
    },
    activateCoupon : (req, res)=>{
      const couponId = req.params.id;
      adminHelpers.activateCoupon(couponId).then(()=>{
        res.redirect('/admin/coupons');
      })
      .catch(()=>{
        res.redirect('/admin/coupons');
      })
    },
    adminLogout : (req,res)=>{
      req.session.adminLoggedIn = false;
      res.redirect('/admin/login');
    },
}