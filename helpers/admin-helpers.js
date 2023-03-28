const db = require('../config/connection');
const collections = require('../config/collections');
const ObjectId = require('mongodb-legacy').ObjectId;

module.exports={
    adminLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={};
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({email:adminData.email});
            if(admin){
                if(admin.password==adminData.password){
                    response.admin = admin;
                    response.adminName=admin.name;
                    response.status=true;
                    resolve(response);
                }else{
                    resolve({status:false});
                }
            }else{
                console.log("admin not found !!!");
                resolve({status:false});
            }
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve, reject)=>{
            const orders = await db.get().collection(collections.ORDER_COLLECTION).find().toArray();
            resolve(orders);
        })
    },
    getAllDeliveredOrders:()=>{
        return new Promise(async(resolve, reject)=>{
            const deliveredOrders = await db.get().collection(collections.ORDER_COLLECTION)
            .find({
                status: "delivered"
            }).toArray();
            resolve(deliveredOrders);
        })
    },
    shipOrder:(orderId)=>{
        return new Promise((resolve, reject)=>{
            orderId = ObjectId(orderId);
            db.get().collection(collections.ORDER_COLLECTION)
            .updateOne(
                {
                    _id: orderId
                },
                {
                    $set:{
                        status: 'shipped'
                    }
                }
            )
            .then((response)=>{
                resolve(response);
            });
        });
    },
    orderDelivered:(orderId)=>{
        return new Promise((resolve, reject)=>{
            orderId = ObjectId(orderId);
            db.get().collection(collections.ORDER_COLLECTION)
            .updateOne(
                {
                    _id: orderId
                },
                {
                    $set:{
                        status: 'delivered'
                    }
                }
            )
            .then((response)=>{
                resolve(response);
            });
        });
    },
    addBanner:(bannerDetails)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.BANNER_COLLECTION).insertOne(bannerDetails).then((response)=>{
                resolve(response);
            });
        });
    },
    getBanners:()=>{
        return new Promise(async(resolve, reject)=>{
            const banners = await db.get().collection(collections.BANNER_COLLECTION).find().toArray();
            // console.log(banners);
            resolve(banners);
        });
    },
    editBanner:(bannerId)=>{
        return new Promise(async(resolve, reject)=>{
            bannerId = ObjectId(bannerId);
            const banner = await db.get().collection(collections.BANNER_COLLECTION).findOne({_id: bannerId});
            resolve(banner);
        });
    },
    editBannerPost:(bannerId, bannerDetails)=>{
        return new Promise((resolve, reject)=>{
            bannerId = ObjectId(bannerId);
            db.get().collection(collections.BANNER_COLLECTION)
            .updateOne(
                {
                    _id: bannerId
                },
                {
                    $set:{
                        heading: bannerDetails.heading,
                        boldHeading: bannerDetails.boldHeading,
                        description: bannerDetails.description,
                    }
                }
            )
            .then((response)=>{
                resolve(response);
            })
        });
    },
    editImageUpload:(bannerId, imgUrl)=>{
        return new Promise((resolve, reject)=>{
            bannerId = ObjectId(bannerId);
            db.get().collection(collections.BANNER_COLLECTION)
            .updateOne(
                {
                    _id: bannerId
                },
                {
                    $set:{
                        image: imgUrl
                    }
                }
            ).then((response)=>{
                resolve(response);
            })
        });
    },
    selectBanner:(bannerId)=>{
        return new Promise((resolve, reject)=>{
            bannerId = ObjectId(bannerId);
            db.get().collection(collections.BANNER_COLLECTION)
            .updateMany(
                {},
                {
                    $set:{
                        active: false
                    }
                }
            )
            db.get().collection(collections.BANNER_COLLECTION)
            .updateOne(
                {
                    _id: bannerId
                },
                {
                    $set:{
                        active: true
                    }
                }
            )
            .then((response)=>{
                // console.log(response);
                resolve(response);
            });
        });
    },
    getUsersCount:()=>{
        return new Promise(async(resolve, reject)=>{
            const users = await db.get().collection(collections.USER_COLLECTION).find().toArray();
            const userCount = users.length>0 ? users.length : 0;
            resolve(userCount)
        }).catch(()=>{
            reject(null);
        });
    },
    getLastMonthTotal:()=>{
        return new Promise(async(resolve, reject)=>{
            const newDate = new Date();
            const year = newDate.getFullYear();
            const month = newDate.getMonth();
            const day = newDate.getDate();
            const total = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                  '$match': {
                    'status': "delivered",
                    'date': {
                      '$gte': new Date(`${year-month-day}`)
                    }
                  }
                }, {
                  '$group': {
                    '_id': 'null', 
                    'totalCost': {
                      '$sum': '$totalCost'
                    }
                  }
                }
              ]).toArray();
            resolve(total[0].totalCost);
        })
    },
    filterDate:(dates)=>{
        return new Promise(async(resolve, reject)=>{
            let newDate=[];
            dates.forEach(eachDate => {
                const date = new Date(eachDate);
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // add 1 because months are zero-indexed
                const day = date.getDate();
                const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
                newDate.push(formattedDate);
            });
            const report = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status: "delivered",
                        date: {
                          $gte: new Date(newDate[0]),
                          $lt: new Date(newDate[1])
                        }
                    }
                }
            ]).toArray();
            resolve(report);
        })
    },
    getOrderTotalPrice:()=>{
        return new Promise(async(resolve, reject)=>{
            const totalOrderPrice = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    '$match':{
                        status: "delivered"
                    }
                },
                {
                  '$group': {
                    '_id': 'null', 
                    'totalCost': {
                      '$sum': '$totalCost'
                    }
                  }
                }
            ]).toArray();
            resolve(totalOrderPrice[0].totalCost);
        })
    },
    getOrderDetails:(orderId)=>{
        return new Promise(async(resolve, reject)=>{
            orderId = ObjectId(orderId);
            try{
                const order = await db.get().collection(collections.ORDER_COLLECTION).findOne({_id: orderId});
                resolve(order);
            }catch(err){
                resolve(null);
            }
        })
    },
    getCoupons:()=>{
        return new Promise(async(resolve, reject)=>{
            const coupons = await db.get().collection(collections.COUPON_COLLECTION).find().toArray();
            const newDate = new Date();
            coupons.forEach(coupon => {
                if(coupon.date < newDate){
                    coupon.status = "EXPIRED";
                }
                const date = coupon.date;
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // add 1 because months are zero-indexed
                const day = date.getDate();
                const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
                coupon.date = formattedDate;
            });
            resolve(coupons);
        });
    },
    addCoupon:(coupon)=>{
        return new Promise(async(resolve, reject)=>{
            coupon.discount = Number(coupon.discount);
            coupon.date = new Date(coupon.date);
            coupon.status = true;
            const newDate = new Date();
            if(coupon.date < newDate){
                coupon.status = "EXPIRED";
            }
            const couponExists = await db.get().collection(collections.COUPON_COLLECTION).findOne({code: coupon.code});
            if(couponExists){
                resolve(null);
            }else{
                db.get().collection(collections.COUPON_COLLECTION).insertOne(coupon).then((response)=>{
                    resolve();
                })
                .catch(()=>{
                    reject();
                });
            }
        });
    },
    editCoupon:(couponId, coupon)=>{
        return new Promise((resolve, reject)=>{
            coupon.date = new Date(coupon.date);
            coupon.status = true;
            const newDate = new Date();
            if(coupon.date < newDate){
                coupon.status = "EXPIRED";
            }
            db.get().collection(collections.COUPON_COLLECTION)
            .updateOne(
                {
                    _id: ObjectId(couponId)
                },
                {
                    $set:{
                        code: coupon.code,
                        discount: Number(coupon.discount),
                        desc: coupon.desc,
                        date: coupon.date,
                        status: coupon.status
                    }
                }
            )
            .then(()=>{
                resolve();
            })
            .catch(()=>{
                reject();
            })
        })
    },
    deactivateCoupon:(couponId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.COUPON_COLLECTION)
            .updateOne(
                {
                    _id: ObjectId(couponId)
                },
                {
                    $set:{
                        status: "DEACTIVATED"
                    }
                }
            )
            .then(()=>{
                resolve();
            })
            .catch(()=>{
                reject();
            })
        })
    },
    activateCoupon:(couponId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.COUPON_COLLECTION)
            .updateOne(
                {
                    _id: ObjectId(couponId)
                },
                {
                    $set:{
                        status: true
                    }
                }
            )
            .then(()=>{
                resolve();
            })
            .catch(()=>{
                reject();
            })
        })
    }
}