// const { ObjectId } = require('mongodb');
// const { getDB } = require('../util/database');

// class Cart {

//     //get users existing cart
//     static async getCart(userId){
//         const db = getDB();
//         return await db.collection('carts').findOne(
//             { userId: userId }
//         );
//     }

//     //add to cart
//     static async addItem(userId, product){
//         const db = getDB();
//         const cartCollection = db.collection('carts');
//         const productData = {
//             productId: product._id,
//             title: product.title,
//             price: product.price,
//             quantity: 1,
//             imageUrl: product.imageUrl
//         };
//         const existingCart = await cartCollection.findOne({
//             userId: userId
//         });
//         if(!existingCart){
//             //create a new cart
//             await cartCollection.insertOne({
//                 userId: userId,
//                 items: [productData],
//                 total: productData.price * productData.quantity,
//                 createdAt: Date.now(),
//                 updatedAt: Date.now()
//             });
//             return {message: 'Cart created and item added'};
//         }

//         //update existing cart
//         const existingItem = existingCart.items.find(
//             item => item.productId.toString() === productData.productId.toString()
//         );

//         if(existingItem){
//             //increment quantity
//             await cartCollection.updateOne(
//                 {
//                     userId: userId, "items.productId": productData.productId
//                 },
//                 {
//                     $inc: {
//                         "items.$.quantity": productData.quantity,
//                         total: productData.price * productData.quantity
//                     },
//                     $set:{
//                         updatedAt: Date.now()
//                     }
//                 }
//             );
//             return {message: 'Item quantity updated'};
//         } else {
//             // add new item
//             await cartCollection.updateOne({
//                     userId: userId
//                 },
//                 {
//                     $push: { items: productData},
//                     $inc: { total: productData.quantity * productData.price },
//                     $set: { updatedAt: Date.now() }
//                 }
//             );
//             return { message: "New item added to cart." };
//         }


//     }

//     static async removeItem(userId, productId){
//         const db = getDB();
//         const cartCollection = db.collection('carts');

//         const cart = await cartCollection.findOne({ userId: userId});
//         if(!cart){
//             return { message: "Cart not found"};
//         }
//         console.log('cart found: ',cart);
//         const item = cart.items.find(i => i.productId.toString() === productId.toString());
//         if(!item){
//             return { message: "Cart item not found"};
//         }

//         await cartCollection.updateOne(
//             { userId: userId},
//             {
//                 $pull: { items: { productId: ObjectId.createFromHexString(productId)}},
//                 $inc: { total: - item.price * item.quantity},
//                 $set: { updatedAt: Date.now() }
//             }
//         );
//         return { message: "Item removed from cart." };

//     }

//     /**
//      * clear the entire cart
//      */
//     static async clearCart(userId){
//         const db = getDB();
//         await db.collection('carts').deleteOne({ userId: userId});
//         return { message: "Cart deleted successfully" };
//     }

//     /**
//      * Update item quantity manually
//      */
//     static async updateQuantity(userId, productId, newQty){
//         const db = getDB();
//         const cartCollection = db.collection('carts');

//         const cart = cartCollection.findOne(
//             { userId: ObjectId.createFromHexString(userId)}
//         );
//         if(!cart) return { message: "cart not found"};

//         const item = cart.items.find(i => i.productId.toString() === productId.toString());
//         if(!item) return { message: "Item not found"};

//         const priceDiff = (newQty - item.quantity)*item.price;
//         await cartCollection.updateOne(
//             { userId: ObjectId.createFromHexString(userId)},
//             {
//                 $set: { "items.$.quantity": newQty, updatedAt: Date.now() },
//                 $inc: { total: priceDiff }
//             }
//         );
//         return { message: "Item quantity updated" };
//     }
// }

// module.exports = Cart;