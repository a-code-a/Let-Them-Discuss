// netlify/functions/feedback.js
const { MongoClient } = require('mongodb');
const cors = require('cors')({ origin: true });

const uri = process.env.MONGODB_URI;

exports.handler = async (event, context) => {
  return cors(async (req, res) => {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db('chatwithpeople'); // replace with your db name if different
      const feedbackCollection = db.collection('feedback'); // choose a collection name

      const data = JSON.parse(event.body);
      const feedbackDocument = {
        text: data.text,
        timestamp: new Date(),
      };
      await feedbackCollection.insertOne(feedbackDocument);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Feedback saved successfully' }),
      };
    } catch (error) {
      console.error('Error saving feedback:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save feedback' }),
      };
    } finally {
      await client.close();
    }
  });
};