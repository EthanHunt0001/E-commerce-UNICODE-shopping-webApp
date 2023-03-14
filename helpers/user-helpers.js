const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb-legacy').ObjectId;

module.exports={
    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.mobile = Number(userData.mobile);
            userData.password = await bcrypt.hash(userData.password,10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async(data)=>{
                // resolve(data);
                dataDoc = await db.get().collection(collection.USER_COLLECTION).findOne({_id:data.insertedId});
                resolve(dataDoc);
            })
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
            console.log(productExist);
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
                },
                {
                    $project: {
                        quantity: "$quantity",
                        products: "$product.discountPrice"
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
            // console.log(cart[0].total);
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
            const addressList = userDetails.address
            try{
                for(let i=0;i<addressList.length;i++){
                    if(addressList[i].active===true){
                        resolve(addressList[i]);
                    }
                }
            }catch{
                resolve(null);
            }
        });
    },
    addAddress:(userId, address)=>{
        return new Promise((resolve, reject)=>{
            let addressId = new ObjectId();
            address._id = addressId;
            address.active = true;
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
            const cartList = await db.get().collection(collection.CART_COLLECTION).findOne({user: userId});
            resolve(cartList);
        })
    },
    addOrder:(order, address, cartList)=>{
        return new Promise((resolve, reject)=>{
            let newDate = new Date();
            const date = newDate.toDateString();
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
                products : cartList,
                date : date,
                status : status
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj)
            .then(()=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user: ObjectId(order.userId)})
                .then((response)=>{
                    resolve(response);
                });
            });
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
    getActiveBanner:()=>{
        return new Promise(async(resolve, reject)=>{
            const activeBanner = await db.get().collection(collection.BANNER_COLLECTION).findOne({active: true});
            resolve(activeBanner);
        })
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
                // console.log(response);
                resolve(response);
            });
        });
    }
}