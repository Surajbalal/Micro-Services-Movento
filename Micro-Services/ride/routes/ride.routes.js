const express = require("express");
const router = express.Router();
const rideController = require('../controllers/ride.controller');
const {body, query} = require('express-validator');
const { auth } = require('../middlewares/auth.middleware');

router.post('/create',auth,
    body('pickup').isString().isLength({min:3}).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({min:3}).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn(['auto', 'car', 'motorcycle']).withMessage('Invalid vehicleType'),rideController.createRide
)
router.get('/get-fare',auth,
    query('pickup').isString().isLength({min:3}).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({min:3}).withMessage('Invalid destination address'),rideController.getfare)

router.post('/confirm',auth,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    // body('otp').isString().isLength({min:6, max:6}).withMessage('Invalid OTP'),
    rideController.confirmRide
)
router.get('/start-ride',auth,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({max: 6, min: 6}).withMessage('Invalid ride otp'),
    rideController.startRide
)
router.post('/end-ride',auth,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)
router.get('/get-ride',auth,
     body('rideId').isMongoId().withMessage('Invalid ride id'),
     rideController.getRide
)
router.post('/cancel',auth,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('reason').isString().isLength({min:3}).withMessage('Invalid reason'),
    rideController.cancelRide
)
router.get('/get-captain-stats',auth,rideController.getCaptainStats)
router.post('/rate', auth,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('rating').isNumeric().isFloat({ min: 1, max: 5 }).withMessage('Invalid rating'),
    body('feedback').optional().isString().withMessage('Feedback must be a string'),
    rideController.rateRide
)
module.exports = router;