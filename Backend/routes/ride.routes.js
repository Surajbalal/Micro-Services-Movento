const express = require("express");
const router = express.Router();
const rideController = require('../controllers/ride.controller');
const {body, query} = require('express-validator');
const { authUser } = require('../middlewares/auth.middleware');
const {authCaptain} = require('../middlewares/captain.middleware')

router.post('/create',authUser,
    body('pickup').isString().isLength({min:3}).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({min:3}).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn(['auto', 'car', 'motorcycle']).withMessage('Invalid vehicleType'),rideController.createRide
)
router.get('/get-fare',
    query('pickup').isString().isLength({min:3}).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({min:3}).withMessage('Invalid destination address'),rideController.getfare)

router.post('/confirm',authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    // body('otp').isString().isLength({min:6, max:6}).withMessage('Invalid OTP'),
    rideController.confirmRide
)
router.get('/start-ride',authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({max: 6, min: 6}).withMessage('Invalid ride otp'),
    rideController.startRide
)
router.post('/end-ride',authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)
module.exports = router;