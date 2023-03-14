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
        productHelpers.addProduct(req.body,async (id)=>{
          let imgUrls = [];
          for(let i=0;i<req.files.length;i++){
            const result = await cloudinary.uploader.upload(req.files[i].path);
            imgUrls.push(result.url);
          }
          // console.log(imgUrls);
          if(imgUrls.length!==0){
            productHelpers.addProductImages(id, imgUrls);
          }
        })
      }catch(err){
        console.log(err);
      }finally{
        res.redirect('/admin/add-product');
      }
    },
    renderListProduct : (req,res)=>{
        let proId = req.params.id;
        productHelpers.listProduct(proId).then((response)=>{
          res.redirect('/admin/admin-view');
        })
    },
    rednerUnListProduct : (req,res)=>{
        let proId = req.params.id;
        productHelpers.unListProduct(proId).then((response)=>{
          res.redirect('/admin/admin-view');
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
      productHelpers.updateProduct(proId,req.body).then(async(response)=>{
        try{
          let imgUrls = [];
          for(let i=0;i<req.files.length;i++){
            const result = await cloudinary.uploader.upload(req.files[i].path);
            imgUrls.push(result.url);
          }
          console.log(imgUrls);
          if(imgUrls.length!==0){
            productHelpers.addProductImages(proId, imgUrls);
          }
        }catch (err){
          console.log(err);
        }finally{
          res.redirect('/admin/admin-view');
        } 
      })
    },
    renderUsers : (req,res)=>{
        userHelpers.getAllUsers().then((users)=>{
          // console.log(users);
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
        userHelpers.editUser(userId,userDetails).then((response)=>{
          res.redirect('/admin/users');
        });
    },
    adminLogout : (req,res)=>{
        req.session.destroy();
        res.redirect('/admin/login');
    },
    renderDashboard : (req,res)=>{
        res.render('admin/admin-dashboard',{admin:true,adminName:req.session.adminName});
    },
    blockUserReq : (req, res)=>{
      let userId = req.params.id;
      userHelpers.blockUser(userId).then((response)=>{
        res.redirect('/admin/users');
      });
    },
    unBlockUserReq : (req, res)=>{
      let userId = req.params.id;
      userHelpers.unBlockUser(userId).then((response)=>{
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
      console.log(orders);
      orders.forEach(order => {
        order.isCancelled = order.status === "cancelled"||order.status==="delivered"? true : false;
        order.isShipped = order.status==="shipped"?true:false;
        order.isDelivered = order.status==="delivered"?true:false;
        order.isPlaced = order.status==="placed"?true:false;
      });
      // console.log(orders);
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
    orderedProducts : async(req, res)=>{
      const orderId = req.params.id;
      const orders = await userHelpers.getOrderedProducts(orderId);
      res.render('admin/ordered-products', {admin:true, orders, adminName:req.session.adminName});
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
        // console.log(req.file);
        const result = await cloudinary.uploader.upload(req.file.path);
        req.body.image = result.url;
      }catch(err){
        console.log(err);
      }
      adminHelpers.addBanner(req.body).then(()=>{
        res.redirect('/admin/add-banner');
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
    }
}