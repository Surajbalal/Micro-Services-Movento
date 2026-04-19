const express = require('express');
const callRoutes = require("./routes/callRoutes");
const agoraRoutes = require("./routes/agora.routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/call", callRoutes);

app.use("/api/agora", agoraRoutes);

app.get("/", (req, res) => {
  res.send("Twilio Call Service Running 🚀");
});

module.exports = app;