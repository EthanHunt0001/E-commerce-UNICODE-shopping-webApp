const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb-legacy').ObjectId;
const Razorpay = require('razorpay');
const crypto = require('crypto');

// razorpay_creds
const razorpay_key_id = process.env.RAZORPAY_KEY_ID;
const razorpay_key_secret = process.env.RAZORPAY_KEY_SECRET;

var instance = new Razorpay({
  key_id: razorpay_key_id,
  key_secret: razorpay_key_secret
});

module.exports={
    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.mobile = Number(userData.mobile);
            const mobileExist = await db.get().collection(collection.USER_COLLECTION).findOne({mobile: userData.mobile});
            const emailExist = await db.get().collection(collection.USER_COLLECTION).findOne({email: userData.email});
            if(mobileExist||emailExist){
                const response = false;
                resolve(response);
            }else{
                userData.password = await bcrypt.hash(userData.password,10);
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async(data)=>{
                    dataDoc = await db.get().collection(collection.USER_COLLECTION).findOne({_id:data.insertedId});
                    resolve(dataDoc);
                })
            }
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email});
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        // console.log("login successfull");
                        response.user=user;
                        response.isBlocked=user.isblocked;
                        response.status=true;
                        resolve(response);
                    }else{
                        // console.log("login failed !!!");
                        resolve({status:false});
                    }
                })
            }else{
                console.log("user not found !!");
                resolve({status:false});
            }
        })
    },
    doLoginWithMobile:(userMobile)=>{
        return new Promise(async(resolve, reject)=>{
            userMobile = Number(userMobile);
            // console.log(userMobile);
            let response = {};
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({mobile:userMobile});
            if(user){
                response.user = user;
                response.status = true;
                response.isBlocked = user.isblocked;
                resolve(response);
            }else{
                response.status = false;
                resolve({status:false})
            }
        })
    },
    setNewPassword:(userDetails)=>{
        return new Promise(async(resolve, reject)=>{
            let userMobile = Number(userDetails.mobile);
            try{
                let userPassword = await bcrypt.hash(userDetails.password,10);
                db.get().collection(collection.USER_COLLECTION).updateOne({mobile:userMobile},
                    {
                        $set:{
                            password: userPassword
                        }
                    })
                    .then((response)=>{
                        resolve(response);
                    })
            }catch(err){
                console.log(err);
            }
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            // console.log(users);
            resolve(users);
        })
    },
    addUser:(userDetail)=>{
        userDetail.mobile = Number(userDetail.mobile);
        return new Promise(async(resolve,reject)=>{
            userDetail.password = await bcrypt.hash(userDetail.password,10);
            // console.log(userDetail);
            db.get().collection(collection.USER_COLLECTION).insertOne(userDetail).then((data)=>{
                resolve(data.insertedId);
            })
        })
    },
    deleteUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).deleteOne({_id:ObjectId(userId)}).then((response)=>{
                resolve(response);
            })
        })
    },
    findUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)}).then((userDetails)=>{
                resolve(userDetails);
            })
        })
    },
    editUser:(userId,userDetails)=>{
        return new Promise((resolve,reject)=>{
            userDetails.mobile = Number(userDetails.mobile);
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
            {$set:{
                name: userDetails.name,
                email: userDetails.email,
                mobile : userDetails.mobile
            }}).then((response)=>{
                // console.log(response);
                resolve(response);
            })
        })
    },
    blockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
            {$set:{
                isblocked: true
            }}).then((response)=>{
                resolve(response);
            })
        })
    },
    unBlockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                $set:{
                    isblocked: false
                }
            }).then((response)=>{
                resolve(response);
            })
        })
    },
    addToCartD:(proId, userDetId, quantity)=>{
        return new Promise(async(resolve, reject)=>{
            let userId = ObjectId(userDetId);
            let productId = ObjectId(proId);
            quantity = Number(quantity);
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:userId});
            let productExist = await db.get().collection(collection.CART_COLLECTION)
            .findOne(
                {
                    user:userId,
                    products: {$elemMatch: {productId}}
                });
            if(userCart){
                if(productExist){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne(
                    {
                        user:userId,
                        products: {$elemMatch: {productId}}
                    },{
                        $inc: { "products.$.quantity": quantity },
                    })
                    .then((response)=>{
                        resolve(response);
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:userId},
                    {
                        $push : {products:{productId, quantity:quantity}}
                    },{
                        upsert: true
                    })
                    .then((response)=>{
                        resolve(response);
                    });
                }
            }else{
                let cartObj={
                    user:userId,
                    products:[{productId, quantity:quantity}]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve(response);
                })
            }
        })
    },
    deleteFromCartD:(proId, userId)=>{
        return new Promise((resolve, reject)=>{
            proId = ObjectId(proId);
            userId = ObjectId(userId);
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({
                user:userId,
            },{
                $pull: {products: {productId: proId}}
            })
            .then((response)=>{
                resolve(response);
            })
        })
    },
    getCart:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            let cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                  $match: {
                    'user': userId
                  }
                },
                {
                  $unwind: "$products"
                },
                {
                  $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "product"
                  }
                },
                {
                  $project: {
                    _id: 0,
                    product: { $arrayElemAt: ["$product", 0] },
                    quantity: "$products.quantity"
                  }
                }
            ]).toArray();
            resolve(cart);
        })
    },
    addToWishListD:(proId, userId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            proId = ObjectId(proId);
            let user = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:userId});
            console.log(user);
            let productExist = await db.get().collection(collection.WISHLIST_COLLECTION)
            .findOne(
            {
                user:userId,
                products: {$elemMatch: {proId}}
            });
            if(user){
                if(productExist){
                    resolve("product exist");
                }else{
                    db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({user:userId},
                    {
                        $push : {products: proId}
                    },{
                        upsert: true
                    })
                    .then((response)=>{
                        resolve(response);
                    })
                }
            }else{
                let userWishlist={
                    user:userId,
                    products:[proId]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(userWishlist).then((response)=>{
                    resolve(response);
                })
            }
        })
    },
    deleteFromWishList:(proId, userId)=>{
        return new Promise((resolve, reject)=>{
            proId = ObjectId(proId);
            userId = ObjectId(userId);
            db.get().collection(collection.WISHLIST_COLLECTION)
            .updateOne({
                user:userId,
            },{
                $pull: {products: proId}
            })
            .then((response)=>{
                console.log(response);
                resolve(response);
            })
        })
    },
    getWishList:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            try{
                let products = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate(
                    [
                      {
                        '$match': {
                          'user': userId
                        }
                      }, {
                        '$lookup': {
                          'from': 'products', 
                          'localField': 'products', 
                          'foreignField': '_id', 
                          'as': 'productDetails'
                        }
                      },
                    ]
                ).toArray();
                // console.log(products[0].productDetails);
                if(products[0].productDetails){
                    resolve(products[0].productDetails)
                }else{
                    resolve(null);
                }
            }catch(err){
                console.log(err);
                resolve(null);
            }
        })
    },
    changeCartQauntity:(details)=>{
        return new Promise((resolve, response)=>{
            const productId = ObjectId(details.productId);
            const userId = ObjectId(details.userId);
            const count = details.count;
            const quantity = details.quantity;
            if(count === -1&&quantity <= 1){
                return resolve(null);
            }
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({
                user:userId,
                products: {$elemMatch: {productId}}
            },{
                $inc: { "products.$.quantity": count},
            })
            .then((response)=>{
                resolve(response);
            })
        })
    },
    getTotalPriceOneProduct:(userId, productId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            productId = ObjectId(productId);
            let price = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                  '$match': {
                    'user': userId
                  }
                }, {
                  '$unwind': {
                    'path': '$products', 
                    'preserveNullAndEmptyArrays': true
                  }
                },
                {
                    '$match' : {
                        'products.productId' : productId
                    }
                },
                {
                  '$lookup': {
                    'from': 'products', 
                    'localField': 'products.productId', 
                    'foreignField': '_id', 
                    'as': 'productDetails'
                  }
                },
                {
                    '$unwind':'$productDetails'
                },
                {
                    '$project' :{
                        '_id' : 0,
                        'quantity': "$products.quantity",
                        'price' : "$productDetails.discountPrice"
                    }
                },
                {
                    '$project':{
                        'totalPrice' : {$multiply:['$quantity', '$price']}
                    }
                }
            ]).toArray();
            // console.log(price[0].totalPrice);
            resolve(price[0].totalPrice);
        })
    },
    cartTotal:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            let cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                  $match: {
                    'user': userId,
                  }
                },
                {
                  $unwind: "$products"
                },
                {
                  $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "product"
                  }
                },
                {
                  $project: {
                    _id: 0,
                    product: { $arrayElemAt: ["$product", 0] },
                    quantity: "$products.quantity",
                  }
                },
                {
                    $match: {
                      "product.stocks": { $gt: 0 }
                    }
                },
                {
                    $project: {
                        quantity: "$quantity",
                        products: "$product.discountPrice",
                        stocks: "$product.stocks"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply: ["$quantity", "$products"]
                            }
                        }
                    }
                }
            ]).toArray();
            try{
                resolve(cart[0].total);
            }catch{
                resolve(0);
            }
        })
    },
    getUser:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:userId});
            // console.log(user);
            resolve(user);
        })        
    },
    updateUser:(userId, result)=>{
        return new Promise((resolve, reject)=>{
            userId = ObjectId(userId);
            result.mobile = Number(result.mobile);
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:userId},
            {
                $set:{
                    name: result.userName,
                    email: result.email,
                    mobile: result.mobile
                }
            }).then((response)=>{
                resolve(response);
            })
        })
    },
    updatePassword:(userId, userPost)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({_id: userId});

            const userPassword = await bcrypt.hash(userPost.newPassword,10);
            console.log(userPassword);
            bcrypt.compare(userPost.oldPassword, user.password).then((status)=>{
                if(status){
                    db.get().collection(collection.USER_COLLECTION)
                    .updateOne({
                        _id:userId
                    },{
                        $set:{
                            password: userPassword
                        }
                    })
                    status=true
                    resolve(status)
                }else{
                    status=false;
                    resolve(status)
                }
            });
        });
        
    },
    getAddress:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:userId});
            try{
                const addresses = user.address;
                // console.log(addresses);
                resolve(addresses);
            }catch{
                resolve("no addresses added");
            }
        })

    },
    getActiveAddress:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            const userDetails = await db.get().collection(collection.USER_COLLECTION)
            .findOne(
                {
                    _id:userId,
                }
            );
            const addressList = await userDetails.address;
            try{
                for(let i=0;i<addressList.length;i++){
                    if(addressList[i].active===true){
                        resolve(addressList[i]);
                    }else{
                        continue;
                    }
                }
                resolve(null);
            }catch{
                resolve(null);
            }
        });
    },
    addAddress:(userId, address)=>{
        return new Promise((resolve, reject)=>{
            let addressId = new ObjectId();
            address._id = addressId;
            address.active = false;
            address.mobile = Number(address.mobile);
            userId = ObjectId(userId);
            db.get().collection(collection.USER_COLLECTION)
            .updateOne(
                {
                    _id: userId
                },
                {
                    $push:{address: address}
                }
            ).then((response)=>{
                resolve(response);
            })
        })
    },
    editAddress:(userId, addressId, address)=>{
        return new Promise((resolve, reject)=>{
            userId = ObjectId(userId);
            addressId = ObjectId(addressId);
            db.get().collection(collection.USER_COLLECTION)
            .updateOne(
                {
                    _id: userId,
                    address: {$elemMatch: {_id: addressId}}
                },
                {
                    $set:{
                       "address.$.state": address.state,
                       "address.$.name": address.name,
                       "address.$.mobile": Number(address.mobile),
                       "address.$.address": address.address,
                       "address.$.city": address.city,
                       "address.$.zipcode": address.zipcode,
                       "address.$.type": address.type
                    }
                }
            )
            .then((response)=>{
                resolve(response);
            }).catch(()=>{
                reject();
            })
        })
    },
    deleteAddress:(userId, addressId)=>{
        return new Promise((resolve, reject)=>{
            userId = ObjectId(userId);
            addressId = ObjectId(addressId);
            db.get().collection(collection.USER_COLLECTION)
            .updateOne(
                {
                    _id: userId,
                },
                {
                    $pull: {
                        address: {_id: addressId}
                    }
                }
            )
            .then(()=>{
                resolve();
            }).catch(()=>{
                reject();
            })
        })
    },
    changeAddressActive:(userId, addressId)=>{
        return new Promise((resolve, reject)=>{
            userId = ObjectId(userId);
            addressId = ObjectId(addressId);

            db.get().collection(collection.USER_COLLECTION)
            .updateMany(
                {
                    _id: userId,
                },
                {
                    $set:{"address.$[].active": false}
                }
            );
            db.get().collection(collection.USER_COLLECTION)
            .updateOne(
                {
                    _id: userId,
                    address: {$elemMatch: { _id: addressId}}
                },
                {
                    $set: {"address.$.active": true}
                }
            )
            .then((response)=>{
                resolve(response);
            });
        });
    },
    getCartList:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            let products = [];
            const cartList = await db.get().collection(collection.CART_COLLECTION)
            .aggregate([
                {
                  '$match': {
                    'user': userId
                  }
                }, 
                {
                  '$unwind': {
                    'path': '$products', 
                    'preserveNullAndEmptyArrays': true
                  }
                }, 
                {
                  '$lookup': {
                    'from': 'products', 
                    'localField': 'products.productId', 
                    'foreignField': '_id', 
                    'as': 'result'
                  }
                },  
                {
                  '$match': {
                    'result.stocks': {
                      '$gt': 0
                    }
                  }
                },
                {
                    '$project': { 
                      'products': 1,
                      '_id': 0
                    }
                }
            ]).toArray();
            cartList.forEach(item => {
                products.push({productId:item.products.productId, quantity:item.products.quantity});
            });
            cartList.products = products;
            resolve(cartList);
        });
    },
    addOrder:(order, address, cartList)=>{
        return new Promise(async(resolve, reject)=>{
            const now = new Date();
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({code: order.coupon});
            const couponCode = order.coupon;
            try{
                db.get().collection(collection.USER_COLLECTION)
                .updateOne(
                    {
                        _id: ObjectId(order.userId)
                    },
                    {
                        $push: {usedCoupons: {couponCode}}
                    }
                )
                .then(()=>{}).catch(()=>{});
            }catch(err){
               console.log(err);
            }finally{
                let status = order.paymentMethod === 'COD' ? 'placed' : 'pending';
                orderObj = {
                    userId : ObjectId(order.userId),
                    userName : order.userName,
                    deliveryDetails:{
                        name : address.name,
                        address : address.address,
                        mobile : Number(address.mobile),
                        pincode : Number(address.zipcode)
                    },
                    paymentMethod : order.paymentMethod,
                    coupon : coupon,
                    totalCost : Number(order.totalCost),
                    products : cartList,
                    date : date,
                    status : status
                }
                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj)
                .then((response)=>{
                    db.get().collection(collection.CART_COLLECTION).deleteOne({user: ObjectId(order.userId)})
                    .then(()=>{
                        resolve(response.insertedId);
                    });
                });
            }
        });
    },
    getOrders:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            const orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId: userId}).toArray();
            resolve(orders);
        })
    },
    getOrderedProducts:(ordersId)=>{
        return new Promise(async(resolve, reject)=>{
            ordersId = ObjectId(ordersId);
            const orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                  '$match': {
                    '_id': ordersId
                  }
                }, {
                  '$unwind': {
                    'path': '$products',
                    'includeArrayIndex': 'string', 
                    'preserveNullAndEmptyArrays': true
                  }
                }, {
                  '$lookup': {
                    'from': 'products', 
                    'localField': 'products.productId', 
                    'foreignField': '_id', 
                    'as': 'productDetails'
                  }
                }, {
                  '$project': {
                    'productDetails': 1, 
                    '_id': 0,
                    'products.quantity' : 1
                  }
                }
            ]).toArray();
            // console.log(orders[0].productDetails);
            resolve(orders);
        });
    },
    cancelOrder:(orderId)=>{
        return new Promise((resolve, reject)=>{
            orderId = ObjectId(orderId);
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne(
                {
                    _id: orderId
                },
                {
                    $set:{
                        status: 'cancelled'
                    }
                }
            )
            .then((response)=>{
                resolve(response);
            });
        });
    },
    returnOrder:(orderId)=>{
        return new Promise((resolve, reject)=>{
            orderId = ObjectId(orderId);
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne(
                {
                    _id: orderId
                },
                {
                    $set:{
                        status: 'returned'
                    }
                }
            )
            .then((response)=>{
                resolve(response);
            })
            .catch(()=>{
                reject();
            });
        });
    },
    toWallet:(userId, source, amount)=>{
        return new Promise((resolve, reject)=>{
            userId = ObjectId(userId);
            const now = new Date();
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            receipt = {
                userId : userId,
                source : source,
                date : date,
                amount : Number(amount)
            }
            db.get().collection(collection.WALLET_COLLECTION).insertOne(receipt)
            .then(()=>{
                db.get().collection(collection.ORDER_COLLECTION)
                .updateOne(
                    {
                        userId: userId,
                        status: "pending"
                    },
                    {
                        $set:{
                            refunded: true
                        }
                    }
                )
                .then(()=>{
                    resolve();
                })
            })
            .catch(()=>{
                reject();
            });
        });
    },
    orderTotalCost:(orderId)=>{
        return new Promise(async(resolve, reject)=>{
            orderId = ObjectId(orderId);
            const total = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: {
                            _id: orderId
                        }
                    },
                    {
                        $group:{
                            _id: null,
                            total: {
                                $sum: "$totalCost"
                            }
                        }
                    }
                ]
            ).toArray();
            try{
                resolve(total);
            }catch{
                resolve(null);
            }
        })
    },
    getWallet:(userId)=>{
        return new Promise((resolve, reject)=>{
            userId = ObjectId(userId);
            const userWallet = db.get().collection(collection.WALLET_COLLECTION).find({userId: userId}).sort({ date: -1 }).limit(2).toArray();
            resolve(userWallet);
        });
    },
    getAllWallet:(userId)=>{
        return new Promise((resolve, reject)=>{
            userId = ObjectId(userId);
            const userWallet = db.get().collection(collection.WALLET_COLLECTION).find({userId: userId}).toArray();
            resolve(userWallet);
        });
    },
    totalWalletAmount:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = ObjectId(userId);
            const totalWallet = await db.get().collection(collection.WALLET_COLLECTION).aggregate(
                [
                    {
                        $match: {
                            userId: userId
                        }
                    },
                    {
                        $group: {
                            _id:null,
                            total: {
                                $sum: "$amount"
                            }
                        }
                    }
                ]
            ).toArray();
            try{
                resolve(totalWallet[0].total);
            }catch{
                resolve(0);
            }
        })
    },
    getActiveBanner:()=>{
        return new Promise(async(resolve, reject)=>{
            const activeBanner = await db.get().collection(collection.BANNER_COLLECTION).findOne({active: true});
            resolve(activeBanner);
        });
    },
    profilePicChange:(userId, imageUrl)=>{
        return new Promise((resolve, reject)=>{
            userId = ObjectId(userId);
            db.get().collection(collection.USER_COLLECTION)
            .updateOne(
                {
                    _id: userId
                },
                {
                    $set:{
                        profilePic: imageUrl
                    }
                }
            )
            .then((response)=>{
                resolve(response);
            });
        });
    },
    generateRazorpay:(orderId, total)=>{
        return new Promise((resolve, reject)=>{
            total = Number(total).toFixed(0);
            orderId = String(orderId);
            instance.orders.create({
                amount: total*100,
                currency: "INR",
                receipt: orderId,
            }, (err, order)=>{
                if(err) {
                    console.log(err)
                    reject(err)
                }else{
                    resolve(order);
                }
            })
        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve, reject)=>{            
            let hmac = crypto.createHmac('sha256', razorpay_key_secret);
            hmac.update(details.response.razorpay_order_id + '|' + details.response.razorpay_payment_id);
            hmac = hmac.digest('hex');
            if(hmac===details.response.razorpay_signature){
                resolve();
            }else{
                reject();
            }
        });
    },
    changeOrderStatus:(orderId)=>{
        return new Promise((resolve, reject)=>{
            orderId = ObjectId(orderId);
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne(
                {
                    _id: orderId
                },
                {
                    $set:{
                        status: "placed"
                    }
                }
            )
            .then((response)=>{
                resolve(response)
            }).catch((err)=>{
                console.log(err);
            })
        });
    },
    couponApply:(couponCode, userId)=>{
        return new Promise(async(resolve, reject)=>{
            const couponExists = await db.get().collection(collection.USER_COLLECTION)
            .findOne(
                {
                    _id: ObjectId(userId),
                    usedCoupons: { $elemMatch: { couponCode } }
                }
            )
            const coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({code: couponCode});
            if(coupon){
                if(couponExists){
                    resolve("couponExists");
                }else{
                    resolve(coupon);
                }
            }else{
                resolve(null);
            }
        })
    }
}