// const { getDB } = require('../util/database');
// const { ObjectId } = require('mongodb')

// class User {
//     constructor(username, email){
//         this.name = username;
//         this.email = email;
//     }

//     save(){
//         const db = getDB();
//         return db.collection('users').insertOne(this)
//         .then(result => console.log(result))
//         .catch(err => console.log(err));
//     }

//     static findById(id){
//         const db = getDB();
//         return db.collection('users').findOne({_id: ObjectId.createFromHexString(id)})
//         .then(result => {
//             // console.log('user find by id: ',result);
//             return result;
//         })
//         .catch(err => console.log(err));
//     }
// }

// module.exports = User;