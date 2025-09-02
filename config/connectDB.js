const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.URI_CONNECTION);
    console.log(`MongoDB connected successfully`);
  } catch (error) {
    console.log(error);
  }
};
module.exports = connectDB;