const { MongoClient, ServerApiVersion } = require("mongodb");
const url = 'mongodb+srv://nsreetam_db_user:z94p3hAtTcV8k0l4@cluster0.gtinb2c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}); 

let db;
let _client;
async function connectDB() {
  if (db) return db; // reuse existing connection

  try {
    await client.connect();
    db = client.db("shop"); // 👈 replace with your DB name
    console.log("✅ Connected to MongoDB Atlas");
    _client = client;
    return db;
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    throw err;
  }
}

function getDB() {
  if (!db) throw new Error("Database not connected yet");
  return db;
}

const getClient = () => {
  if (_client) {
    return _client;
  }
  throw 'No MongoDB client found!';
};

module.exports = { connectDB, getDB, getClient };

