
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// CORS is handled by Nginx gateway — no CORS headers here to avoid duplicates
app.use('/' ,userRoutes);

app.use(errorHandler);

module.exports = app;