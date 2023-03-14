const db = require('../config/connection');
const collections = require('../config/collections');
const objectId = require('mongodb-legacy').ObjectId;

module.exports = {
    addCategory : (cred)=>{
        return new Promise(async(resolve, reject)=>{
            let catExist = await db.get().collection(collections.CATEGORY_COLLECTION).findOne({name:cred.name});
            if(catExist){
                resolve(false);
            }else{
                db.get().collection(collections.CATEGORY_COLLECTION).insertOne(cred).then((response)=>{
                    resolve(response.insertedId);
                })
            }
        })
    },
    getAllCategories : ()=>{
        return new Promise(async(resolve, reject)=>{
            let categories = await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray();
            resolve(categories);
        })
    },
    unlistCategory : (catId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{
                $set:{
                    listingStatus : false
                }
            }).then((response)=>{
                resolve(response);
            })
        })
    },
    listCategory : (catId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{
                $set:{
                    listingStatus : true
                }
            }).then((response)=>{
                resolve(response);
            })
        })
    },
    getCategorydetail : (productName)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                const category = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
                    {
                      '$match': {
                        'name': `${productName}`
                      }
                    }, {
                      '$lookup': {
                        'from': 'category', 
                        'localField': 'category', 
                        'foreignField': '_id', 
                        'as': 'result'
                      }
                    },{ 
                        '$unwind' : '$result' 
                    }
                ]).toArray();
                resolve(category[0].result);
            }catch(err){
                console.log(err);
                resolve(null);
            }
        })
    },
    categorySelect : (catName)=>{
        return new Promise(async(resolve, reject)=>{
            const filteredProducts = await db.get().collection(collections.CATEGORY_COLLECTION).aggregate([
                {
                  '$match': {
                    'name': `${catName}`
                  }
                }, {
                  '$lookup': {
                    'from': 'products', 
                    'localField': '_id', 
                    'foreignField': 'category', 
                    'as': 'productsDetails'
                  }
                },{
                    '$unwind' : '$productsDetails'
                }
            ]).toArray();
            // console.log(filteredProducts[0].productsDetails);
            let products = [];
            for(let i=0;i<filteredProducts.length;i++){
                if(filteredProducts[i].productsDetails){
                    let product = filteredProducts[i].productsDetails;
                    if(product.listingStatus){
                        products.push(product);
                    }
                }
            }
            resolve(products);
        })
    }
}