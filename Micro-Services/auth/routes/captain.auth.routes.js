const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const captainController = require('../controllers/captain.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { loginLimiter, signupLimiter, refreshLimiter, verifyEmailLimiter } = require('../limiters/captainLimiter');

router.post('/register', [
    body('email').isEmail().withMessage("Invalid Email"),
    body('fullName.firstName').isLength({ min: 3 }).withMessage("First name must be at least 3 characters long"),
    body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 character long"),
    body('vehicle.color').isLength({ min: 3 }).withMessage("Color must be at least 3 character long"),
    body('vehicle.plate').isLength({ min: 3 }).withMessage("Plate must be at least 3 character long"),
    body('vehicle.capacity').isLength({ min: 1 }).withMessage("Capacity must be at least 1"),
    body('vehicle.vehicleType').isIn(['car', 'motorcycle', 'auto']).withMessage("Invalid vehicle type")
], signupLimiter, captainController.registerCaptain);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 character long"),
],loginLimiter, captainController.captainLogin);

router.post('/verify-email',verifyEmailLimiter, captainController.verifyEmail);
router.get('/refresh-token',refreshLimiter, captainController.refreshToken);
router.get('/logOut', authMiddleware, captainController.logoutCaptain);
router.get('/logout-all', authMiddleware, captainController.logoutAllCaptain);

module.exports = router;