const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    'fullName':{
        'firstName':{
            type: String,
            required: true,
            minlength:[3,'First name must be at least 3 character']
        },
        'lastName':{
            type: String,
            require: false,
        }
    },
    'email':{
        type: String,
        required: true,
        unique: true
    },
    'isAvailable':{
        type: Boolean,
        default: true,
    },
    // 'password':{
    //     type:String,
    //     require: true,
    //     select: false,
    //     minlength: [7,'Password must be at least 7 character']
    // },
    'socketId':{
        type: String,
        
    },
    'status':{
        type: String,
        enum: ['active','inactive'],
        default: 'inactive',
    },
    'vehicle':{
        'color':{
            type: String,
            required : true,
            minlength: [3, 'Color must be at least 3 character']
        },
        'plate':{
            type: String,
            required: true,
             minlength: [3, 'Plate must be at least 3 character']
        },
        'capacity':{
            type: String,
            require:true,
            minlength: [1, 'capacity must be at 1']
        },
        'vehicleType':{
            type: String,
            enum: ['motorcycle', 'car', 'auto'],
            required: true
        },
        'location':{
            'lat':{
                type: Number
            },
            'lng':{
                type: Number
            }
        }
    },
    "location": {
       
  type: {
    type: String,
    enum: ["Point"],
    default: "Point"
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
}

}) 

captainSchema.index({
  location: "2dsphere", "vehicle.vehicleType": 1 },
  { partialFilterExpression: { status: "active" } }
);
captainSchema.index({ location: "2dsphere" });

captainSchema.methods.genrateToken =  function(){
    const token =  jwt.sign({_id:this._id, role:'captain'},process.env.JWT_SECRET,{expiresIn: '24h'});
    return token;
}
captainSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
 
}
captainSchema.statics.hashPassword = async function(password){
   return await bcrypt.hash(password,10);
    
}
const captainModel =  mongoose.model('captain', captainSchema);
module.exports = captainModel;