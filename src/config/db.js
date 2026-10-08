const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Thiếu biến MONGO_URI trong file .env');
  }
  await mongoose.connect(uri);
  console.log('Đã kết nối MongoDB');
}

module.exports = connectDB;
