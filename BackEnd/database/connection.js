const mongoose = require("mongoose");

const dbURI = MONGODB_URI;

// Connect to MongoDB using Mongoose
async function connectMongoDB() 
{
  try 
  {
    await mongoose.connect(dbURI);
    console.log("Connected to DB!");
  } 
  catch (err) 
  {
    console.error("Error connecting to DB:", err);
  }
}

connectMongoDB();