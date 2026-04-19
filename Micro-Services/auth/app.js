const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cors = require('cors');
const userRouter = require('./routes/user.auth.routes');
const captainRouter = require('./routes/captain.auth.routes');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
// CORS is handled by Nginx gateway — individual service does not set CORS headers
// to avoid duplicate header conflicts

app.use('/users',userRouter);
app.use('/captains',captainRouter);
app.use('/.well-known',require('./routes/jwks.routes'));
module.exports = app;
