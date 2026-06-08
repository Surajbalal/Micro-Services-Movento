const mapService = require ('../services/maps.service');
const {validationResult} = require('express-validator')
module.exports.getCoordinates = async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({error: errors.array()});
    }
    const {address} = req.query;


    try {
        const coordinates = await mapService.getAddressCoordinates(address);
        res.status(200).json(coordinates);
        
    } catch (error) {
        res.status(404).json({message:"Coordinates not found"});
    }
}
module.exports.getDistanceTime = async(req,res,next)=>{
     try {

    const error = validationResult(req);
    if(!error.isEmpty()){ 
        return res.status(400).json({error:error});
    }

    const {origin,destination} = req.query;

       const distanceTimeData = await mapService.getDistanceTime(origin,destination);

    return res.status(200).json(distanceTimeData);

 } catch (error) {
   return res.status(500).json({ message: "Failed to calculate distance and time" });
 }
}
module.exports.getAutoCompleteSuggestions = async(req,res,next)=>{
    console.log("hello",req);
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors : errors.array()});
        }

        const {input} = req.query;

        const suggestion = await mapService.getAutoCompleteSuggestions(input);
        
        return res.status(200).json(suggestion);

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'})
    }
}

module.exports.getRoutePolyline = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const { origin, destination } = req.query;
        const routeData = await mapService.getRoutePolyline(origin, destination);
        return res.status(200).json(routeData);
    } catch (error) {
        console.error("Failed to compute route polyline:", error.message);
        return res.status(500).json({ message: "Failed to fetch route polyline" });
    }
};