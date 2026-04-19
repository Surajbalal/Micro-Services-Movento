const express = require("express");
const router = express.Router();
const { generateToken } = require("../controllers/agora.controller");

router.post("/token", generateToken);

module.exports = router;