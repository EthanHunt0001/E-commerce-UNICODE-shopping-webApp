const db = require('../config/connection');
const collection = require('../config/collections');
const objectId = require('mongodb-legacy').ObjectId;

module.exports={
    addProduct:(product,callback)=>{
        product.price = Number(product.price);
        product.discountPrice = Number(product.discountPrice);
        product.discountPerc = Number(product.discountPerc);
        product.listingStatus = true;
        product.category = objectId(product.category);
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            callback(data.insertedId);
        })
    },
    addProductImages:(proId, imgUrls)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
        {$set:{
            images:imgUrls
        }});
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })
    },
    getAllProductsAdminSide:()=>{
        return new Promise(async(resolve,reject)=>{
            let products2 = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            let products = [];
            for(let i=0;i<products2.length;i++){
                if(products2[i].listingStatus){
                    products.push(products2[i])
                }
            }
            resolve(products);
        })
    },
    listProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{
                listingStatus: true
            }}).then((response)=>{
                resolve(response);
            })
        })
    },
    unListProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{
                listingStatus: false
            }}).then((response)=>{
                resolve(response);
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product);
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            proDetails.price = Number(proDetails.price);
            proDetails.discountPrice = Number(proDetails.discountPrice);
            proDetails.discountPerc = Number(proDetails.discountPerc);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
            {$set:{
                brand: proDetails.brand,
                name: proDetails.name, 
                description: proDetails.description,
                lgdescription : proDetails.lgdescription,
                price: proDetails.price,
                discountPrice: proDetails.discountPrice,
                discountPerc: proDetails.discountPerc,
                size: proDetails.size,
                category: objectId(proDetails.category)
            }}).then((response)=>{
                resolve(response);
            })
        })
    }
}