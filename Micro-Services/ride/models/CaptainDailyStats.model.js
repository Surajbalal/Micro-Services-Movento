const mongoose = require("mongoose");

const captainDailyStatsSchema = new mongoose.Schema(
  {
    captainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Captain",
      required: true,
      index: true
    },

    date: {
      type: Date,
      required: true,
      index: true
    },


    totalEarnings: {
      type: Number,
      default: 0
    },

    totalDistanceMeters: {
      type: Number, 
      default: 0
    },

    totalRides: {
      type: Number,
      default: 0
    },

    totalRatingPoints: {
      type: Number,
      default: 0
    },

    ratedRides: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

captainDailyStatsSchema.index({captainId:1, date:1}, {unique: true})
module.exports = mongoose.model("CaptainDailyStats", captainDailyStatsSchema);