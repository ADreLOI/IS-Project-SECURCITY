const mongoose = require("mongoose");

const dbURI = "mongodb+srv://admin:SecurCityApp2025@cluster0.uiixzn6.mongodb.net/SecurCity?retryWrites=true&w=majority&appName=Cluster0"

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