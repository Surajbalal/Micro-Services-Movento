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
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use('/users',userRouter);
app.use('/captains',captainRouter);
app.use('/.well-known',require('./routes/jwks.routes'));
module.exports = app;
