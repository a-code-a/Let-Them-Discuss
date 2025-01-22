const fs = require('fs');
const path = require('path');

const FEEDBACK_FILE = path.join(__dirname, '../../feedback.json');

// Helper function to read feedback data
const readFeedbackData = () => {
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) {
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading feedback file:', error);
    return [];
  }
};

// Helper function to write feedback data
const writeFeedbackData = (data) => {
  try {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing feedback file:', error);
    return false;
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    const feedbackData = readFeedbackData();

    switch (event.httpMethod) {
      case 'GET':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(feedbackData)
        };

      case 'POST':
        const newFeedback = JSON.parse(event.body);
        feedbackData.push({
          ...newFeedback,
          id: Date.now(),
          timestamp: new Date().toISOString()
        });
        writeFeedbackData(feedbackData);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(feedbackData)
        };

      case 'PUT':
        const updatedFeedback = JSON.parse(event.body);
        const updatedData = feedbackData.map(item => 
          item.id === updatedFeedback.id ? updatedFeedback : item
        );
        writeFeedbackData(updatedData);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedData)
        };

      case 'DELETE':
        const { id } = JSON.parse(event.body);
        const filteredData = feedbackData.filter(item => item.id !== id);
        writeFeedbackData(filteredData);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(filteredData)
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ message: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};