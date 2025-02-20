// netlify/functions/feedback.js
const { MongoClient } = require('mongodb');
const cors = require('cors')({ origin: true });

const uri = process.env.MONGODB_URI;

exports.handler = async (event) => {
  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ message: 'CORS preflight successful' }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: 'Method Not Allowed'
    };
  }

  if (!process.env.MONGODB_URI) {
    console.error('MongoDB connection URI missing');
    return {
      statusCode: 500,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('chatwithpeople');
    const feedbackCollection = db.collection('feedback');

    const data = JSON.parse(event.body);
    const feedbackDocument = {
      text: data.text,
      timestamp: new Date(),
    };
    await feedbackCollection.insertOne(feedbackDocument);

    return {
      statusCode: 200,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({ message: 'Feedback saved successfully' }),
    };
  } catch (error) {
    console.error('Error saving feedback:', error);
    return {
      statusCode: 500,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({ error: 'Failed to save feedback' }),
    };
  } finally {
    await client.close();
  }
};