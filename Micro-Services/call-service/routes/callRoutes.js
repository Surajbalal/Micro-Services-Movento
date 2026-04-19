const express = require("express");
const router = express.Router();

const {
  initiateCall,
  connectCall,
  callStatus,
} = require("../controllers/callController");

router.post("/initiate", initiateCall);
router.post("/connect", connectCall);
router.post("/status", callStatus);

module.exports = router;