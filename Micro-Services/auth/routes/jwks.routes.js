const express = require("express");
const { getJWJKS } = require("../controllers/jwks.controller");
const router = express.Router();

router.get("/jwks.json",getJWJKS);

module.exports = router;