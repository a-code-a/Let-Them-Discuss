const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    mongoose.set('strictQuery', true);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ Connected successfully to: ${conn.connection.host}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();