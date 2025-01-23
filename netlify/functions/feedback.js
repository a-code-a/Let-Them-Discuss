const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  await client.connect();
  cachedDb = client.db('chatwithpeople');
  return cachedDb;
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection('feedback');

    switch (event.httpMethod) {
      case 'GET':
        const feedbacks = await collection.find({}).toArray();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(feedbacks)
        };

      case 'POST':
        const newFeedback = JSON.parse(event.body);
        await collection.insertOne({
          text: newFeedback.text,
          userName: newFeedback.userName,
          userEmail: newFeedback.userEmail,
          upvotes: 0,
          downvotes: 0,
          timestamp: new Date().toISOString()
        });
        break;

      case 'PUT':
        const updatedFeedback = JSON.parse(event.body);
        await collection.updateOne(
          { _id: new ObjectId(updatedFeedback._id) },
          { 
            $set: {
              upvotes: updatedFeedback.upvotes,
              downvotes: updatedFeedback.downvotes
            }
          }
        );
        break;

      case 'DELETE':
        const { id } = JSON.parse(event.body);
        await collection.deleteOne({ _id: new ObjectId(id) });
        break;

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    // Return updated feedback list for all write operations
    const updatedList = await collection.find({}).toArray();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(updatedList)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};