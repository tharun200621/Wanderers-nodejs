const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const plm = require("passport-local-mongoose");
const passportLocalMongoose = plm.default || plm;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otpHash: String,
    otpExpires: Date,
    otpAttempts: {
        type: Number,
        default: 0
    },
    rememberTokenHash: String,
    rememberTokenExpires: Date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
