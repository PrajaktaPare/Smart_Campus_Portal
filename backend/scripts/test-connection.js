const mongoose = require("mongoose")
require("dotenv").config()

async function testConnection() {
  try {
    console.log("🔄 Testing MongoDB connection...")
    console.log("MongoDB URI:", process.env.MONGODB_URI || "mongodb://localhost:27017/smart_campus_portal")

    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/smart_campus_portal", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ MongoDB connection successful!")

    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(
      "📁 Available collections:",
      collections.map((c) => c.name),
    )

    // Test write operation
    const testCollection = mongoose.connection.db.collection("test")
    await testCollection.insertOne({ test: "data", timestamp: new Date() })
    console.log("✅ Write operation successful!")

    // Test read operation
    const testDoc = await testCollection.findOne({ test: "data" })
    console.log("✅ Read operation successful!", testDoc)

    // Clean up test document
    await testCollection.deleteOne({ test: "data" })
    console.log("✅ Cleanup successful!")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
    console.error("Error details:", error.message)
  } finally {
    await mongoose.connection.close()
    console.log("🔌 Connection closed")
  }
}

testConnection()
