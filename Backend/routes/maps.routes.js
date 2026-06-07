const express = require('express');
const { authUser } = require('../middlewares/auth.middleware');
const mapController  = require('../controllers/map.controller');
const {query} = require('express-validator');
const router = express.Router();


router.get('/get-coordinates',
    query('address').isString().isLength({min:3})
    ,authUser,mapController.getCoordinates);

router.get('/get-distance-time',
    query("origin").isString().isLength({min:3}),
    query("destination").isString().isLength({min:3})
    ,authUser,mapController.getDistanceTime);
    
router.get('/get-suggestions',
    query('input').isString().isLength({min: 3})
    ,mapController.getAutoCompleteSuggestions);

    
module.exports = router;