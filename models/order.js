const { ObjectId } = require('mongodb');
const { getDB } = require('../util/database');
const { or } = require('sequelize');

class Order {
    static async create(orderDoc, session = null){
        const db = getDB();
        // const options = session ? { session }: {};
        const result = await db.collection('orders').insertOne(orderDoc, session);
        return result.insertedId;
    }

    static async findById(orderId){
        const db = getDB();
        return await db.collection('orders').findOne({ _id: ObjectId.createFromHexString(orderId)});
    }

    static async updateStatus(orderId, updateData){
        const db = getDB();
        return await db.collection('orders').updateOne(
            { _id: ObjectId.createFromHexString(orderId)},
            {
                $set: updateData
            }
        );
    }
}

module.exports = Order;