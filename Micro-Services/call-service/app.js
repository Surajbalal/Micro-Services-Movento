const express = require('express');
const callRoutes = require("./routes/callRoutes");
const agoraRoutes = require("./routes/agora.routes");
const app = express();
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/call", callRoutes);

app.use("/api/agora", agoraRoutes);

app.get("/", (req, res) => {
  res.send("Twilio Call Service Running 🚀");
});
app.use(errorHandler);

module.exports = app;