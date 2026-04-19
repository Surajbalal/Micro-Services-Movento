// const express = require('express');
// const expressProxy = require('express-http-proxy');
// const cors = require("cors");

// const app = express();

// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

// // Handle pre-flight OPTIONS for all routes
// app.options("*", cors({
//   origin: "http://localhost:5173",
//   credentials: true,
// }));

// app.use('/auth',   expressProxy('http://localhost:3004'))
// app.use('/users',  expressProxy('http://localhost:3001'))
// app.use('/captain',expressProxy('http://localhost:3002'))
// app.use('/rides',  expressProxy('http://localhost:3003'))

// app.listen(3000,()=>{

//     console.log('Gateway server is listening on port 3000');

// })