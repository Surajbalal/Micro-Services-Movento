const mongoose = require('mongoose');
const { type } = require('os');


const rideSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    captain:{
        type: mongoose.Schema.Types.ObjectId,

    },
   pickup: {
    address: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    }
  },

  destination: {
    address: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    }
  },
    fare: {
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum: ['pending','accepted','ongoing','completed','cancelled'],
        default: 'pending'
    },

  cancellation: {
    reason: {
      type: String, // e.g. "user_changed_mind", "driver_no_show"
    },
    note: {
      type: String // optional free text from user
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'captain', 'system']
    },
    cancelledAt: {
      type: Date
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  },
    duration:{
        type:Number //in sec
    },
    distance:{
        type: Number //in mtr
    },
    paymentID:{
        type: String
    },
    orderID:{
        type: String
    },
    signature:{
        type: String
    },
    otp:{
        type : String,
        select: false,
        required: true,
    }
})
rideSchema.index(
  { captain: 1 },
  {partialFilterExpression: { status: { $in: ["ongoing", "accepted"] } } }
);
rideSchema.index(
  { user: 1 },
  { partialFilterExpression: { status: { $in: ["ongoing", "accepted"] } } }
);
module.exports = mongoose.model('rideModel',rideSchema);