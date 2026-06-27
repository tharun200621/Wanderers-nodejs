const crypto = require("crypto");

const OTP_EXPIRE_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const REMEMBER_EXPIRE_DAYS = 30;

function hashValue(value) {
    return crypto.createHash("sha256").update(String(value)).digest("hex");
}

module.exports.OTP_MAX_ATTEMPTS = OTP_MAX_ATTEMPTS;
module.exports.REMEMBER_EXPIRE_DAYS = REMEMBER_EXPIRE_DAYS;
module.exports.hashValue = hashValue;

module.exports.generateOtp = () => {
    const otp = String(crypto.randomInt(100000, 1000000));
    return {
        otp,
        otpHash: hashValue(otp),
        otpExpires: new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000)
    };
};

module.exports.generateRememberToken = () => {
    const token = crypto.randomBytes(32).toString("hex");
    return {
        token,
        tokenHash: hashValue(token),
        tokenExpires: new Date(Date.now() + REMEMBER_EXPIRE_DAYS * 24 * 60 * 60 * 1000)
    };
};
