
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const captainRoutes = require('./routes/captain.router');
const errorHandler = require('./middlewares/errorHandler');


// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// ROUTES
app.use('/', captainRoutes);
app.use(errorHandler);

module.exports = app;