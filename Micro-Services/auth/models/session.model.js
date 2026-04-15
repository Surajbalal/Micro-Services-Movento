const { default: mongoose } = require("mongoose");
const { refreshToken } = require("../controllers/user.controller");

const sessionSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: true

    },
    refreshTokenHash:{
        type: String,
        // required: [true,"Refresh token hash is reqquired"]
    },
    ip:{
        type: String,
        required: [true,"IP ddress is required"]
    },
    userAgent: {
        type: String,
        required: [true,"User agent is required"]
    },
    revoke: {
        type: Boolean,
        default: false
    },

},{
    timestamps: true
})


module.exports =  mongoose.model("session",sessionSchema);