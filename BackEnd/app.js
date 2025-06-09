// app.js
const express = require("express");
const cors = require("cors");
const cittadinoRoutes = require("./routes/cittadinoRoute");
const comuneRoutes = require("./routes/comuneRoute");
const operatoreRoutes = require("./routes/operatoreRoute");
const itinerarioRoutes = require("./routes/itinerarioRoute");

require("dotenv").config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:8081",
        "https://is-project-securcity.onrender.com",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/api/v1/cittadino", cittadinoRoutes);
app.use("/api/v1/comune", comuneRoutes);
app.use("/api/v1/operatoreComunale", operatoreRoutes);
app.use("/api/v1/itinerario", itinerarioRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
