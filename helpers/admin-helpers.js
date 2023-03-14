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
    }
}