const express = require("express");
const mongoose = require("mongoose");
const cittadinoRoutes = require("./routes/cittadinoRoute");
const comuneRoutes = require("./routes/comuneRoute");
const operatoreRoutes = require("./routes/operatoreRoute");
const itinerarioRoutes = require("./routes/itinerarioRoute");
const mapsRoutes = require("./routes/mapsRoute");


require("dotenv").config();

const cors = require("cors");
const app = express();
const dbURI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

//Middleware to parse JSON data
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:8081",
        "http://localhost:8082",
        "https://is-project-securcity.onrender.com",
      ];

      // Se non c'è origin (es. in Postman o curl), o se è tra gli allowed:
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Consentito
      } else {
        callback(new Error("Not allowed by CORS")); // Bloccato
      }
    },
    credentials: true,
  })
);


// Import routes
app.use("/api/v1/cittadino", cittadinoRoutes);
app.use("/api/v1/comune", comuneRoutes);
app.use("/api/v1/operatoreComunale", operatoreRoutes);
app.use("/api/v1/itinerario", itinerarioRoutes);
app.use("/api/v1/maps", mapsRoutes);


mongoose
  .connect(dbURI)
  .then(() => {
    console.log("Connected to DB!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});
