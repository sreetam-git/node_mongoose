const { getDB } = require("../util/database");
const { ObjectId } = require("mongodb")

class Product {
    constructor(title, price, description, imageUrl, id, userId){
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id;
        this.userId = userId;
    }

    save(){
        const db = getDB();
        if(this._id){
            let updateData = {
                title: this.title,
                price: this.price,
                description: this.description,
                imageUrl: this.imageUrl
            };
            return db.collection('products').updateOne({_id: ObjectId.createFromHexString(this._id)}, {$set: updateData})
                .then(result => console.log(result))
                .catch(err => console.log(err));
        }else{
            console.log(this.userId);
            return db.collection('products').insertOne(this)
                .then(result => console.log(result))
                .catch(err => console.log(err));
        }
        
    }

    static fetchAll(){
        const db = getDB();
        return db.collection('products')
        .find()
        .toArray()
        .then(result => {
            // console.log(result);
            return result;
        })
        .catch(err => console.log(err));
    }

    static findById(id){
        const db = getDB();
        return db.collection('products')
        .findOne({_id: ObjectId.createFromHexString(id)})
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
    }

    static deleteById(id){
        const db = getDB();
        return db.collection('products').deleteOne({_id: ObjectId.createFromHexString(id)})
        .then(result => {
            console.log('record deleted');
        })
        .catch(err => {
            console.log(err);
        });
    }
}

module.exports = Product;