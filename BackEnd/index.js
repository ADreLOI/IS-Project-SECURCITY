const express = require('express');
const mongoose = require('mongoose');
const cittadinoRoutes = require('./routes/cittadinoRoute');
const comuneRoutes = require('./routes/comuneRoute');
const operatoreRoutes = require('./routes/operatoreRoute');

require('dotenv').config();

const cors = require("cors");
const app = express();
const dbURI = process.env.MONGODB_URI;

//Middleware to parse JSON data
app.use(express.json());
app.use(
    cors({
      origin: "http://localhost:8081",
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  
// Import routes
app.use('/api/v1/cittadino', cittadinoRoutes);
app.use('/api/v1/comune', comuneRoutes);
app.use('/api/v1/operatoreComunale', operatoreRoutes);

mongoose.connect(dbURI)
    .then(() =>
    { 
        console.log("Connected to DB!")
        app.listen(3000, () => 
        {
            console.log("Server is running on port 3000 ")
        });
            
    })
    .catch((err) =>
    {
        console.log(err)
    })


app.get('/', (req, res) => 
{
  res.send('Hello World!');
}
);