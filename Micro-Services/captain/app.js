
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const captainRoutes = require('./routes/captain.router');


// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// ROUTES
app.use('/', captainRoutes);


module.exports = app;