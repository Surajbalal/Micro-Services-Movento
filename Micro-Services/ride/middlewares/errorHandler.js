module.exports = (err,req,res,next) =>{
    console.log(err);
    res.status(err.status || 500).json({
        code:err.code || 500,
        message:err.message || "Internal server error",
        
    })
    
}