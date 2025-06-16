const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    // Use the MongoDB Atlas connection string from environment variables
    const conn = await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://pareprajakta3:mSQgBlLsZ45TfquL@cluster0.6j6ijnc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    )

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
