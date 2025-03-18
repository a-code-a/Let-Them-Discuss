const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = 'chatwithpeople'; // Replace with your actual database name
const COLLECTION_NAME = 'visitors';

exports.handler = async (event, context) => {
  let client;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const collection = db.collection(COLLECTION_NAME);

    const filter = { _id: 'visitorCount' };
    const update = { $inc: { count: 1 } };
    const options = { upsert: true };

    await collection.updateOne(filter, update, options);

    const document = await collection.findOne(filter);
    const count = document ? document.count : 0;

    return {
      statusCode: 200,
      body: JSON.stringify({ count }),
    };
  } catch (error) {
    console.error('Error incrementing visitor count:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to increment visitor count' }),
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};