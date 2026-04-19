const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();

const cookieParser = require("cookie-parser");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");
const errorHandler = require("./middlewares/errorHandler");

// CORS is handled by Nginx gateway — no CORS headers here to avoid duplicates

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", rideRoutes);
app.use("/maps", mapsRoutes);

app.use(errorHandler)

module.exports = app;
